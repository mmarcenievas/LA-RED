-- =====================================================================
-- LA RED · Esquema de base de datos, seguridad (RLS) y Storage
-- Pegar completo en Supabase > SQL Editor > New query > Run
-- =====================================================================

-- ---------- TABLAS ----------
create table carreras (
  id bigint generated always as identity primary key,
  nombre text not null unique
);

create table materias (
  id bigint generated always as identity primary key,
  carrera_id bigint not null references carreras(id) on delete cascade,
  nombre text not null,
  anio smallint not null,
  cuatrimestre smallint not null check (cuatrimestre in (1, 2))
);

create table publicaciones (
  id uuid primary key default gen_random_uuid(),
  materia_id bigint not null references materias(id) on delete cascade,
  tipo text not null check (tipo in ('Apuntes','Trabajos prácticos','Parciales','Finales','Resúmenes','Otros')),
  titulo text not null check (char_length(titulo) between 3 and 90),
  descripcion text check (char_length(descripcion) <= 300),
  alias text check (char_length(alias) <= 30),
  anio_cursada smallint not null check (anio_cursada between 2000 and 2035),
  archivo_path text not null,
  archivo_nombre text not null,
  descargas int not null default 0,
  reportes int not null default 0,          -- se actualiza solo (trigger de abajo)
  creado_en timestamptz not null default now()
);
create index on publicaciones (materia_id, tipo);

create table reportes (
  id bigint generated always as identity primary key,
  publicacion_id uuid not null references publicaciones(id) on delete cascade,
  motivo text not null check (char_length(motivo) <= 200),
  creado_en timestamptz not null default now()
);

-- Usuarios con permiso de administrador (se cargan a mano, ver README)
create table admins (user_id uuid primary key references auth.users(id) on delete cascade);

-- ---------- FUNCIONES ----------
create function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

-- Suma una descarga sin dar permiso general de modificar la tabla
create function registrar_descarga(pub_id uuid) returns void
language sql security definer set search_path = public as $$
  update publicaciones set descargas = descargas + 1 where id = pub_id
$$;

-- Mantiene el contador de reportes de cada publicación
create function actualizar_reportes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update publicaciones set reportes = reportes + 1 where id = new.publicacion_id;
  else
    update publicaciones set reportes = greatest(reportes - 1, 0) where id = old.publicacion_id;
  end if;
  return null;
end $$;
create trigger trg_reportes after insert or delete on reportes
  for each row execute function actualizar_reportes();

-- ---------- SEGURIDAD (RLS): lectura pública, escritura limitada ----------
alter table carreras enable row level security;
alter table materias enable row level security;
alter table publicaciones enable row level security;
alter table reportes enable row level security;
alter table admins enable row level security;   -- sin políticas: nadie la lee directamente

create policy "ver carreras" on carreras for select using (true);
create policy "ver materias" on materias for select using (true);

-- Se ocultan automáticamente las publicaciones con 3 o más reportes (el admin las sigue viendo)
create policy "ver publicaciones" on publicaciones for select using (reportes < 3 or is_admin());
-- Cualquiera publica, pero no puede inventar descargas/reportes ni apuntar a otra carpeta
create policy "subir publicacion" on publicaciones for insert
  with check (descargas = 0 and reportes = 0 and archivo_path like materia_id::text || '/%');
create policy "admin borra publicaciones" on publicaciones for delete using (is_admin());

create policy "reportar" on reportes for insert with check (true);
create policy "admin ve reportes" on reportes for select using (is_admin());
create policy "admin borra reportes" on reportes for delete using (is_admin());

-- ---------- STORAGE: bucket público, 20 MB, solo ciertos formatos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materiales', 'materiales', true, 20971520, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'application/zip', 'application/x-zip-compressed'
]) on conflict (id) do nothing;

create policy "subir archivos" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'materiales' and lower(storage.extension(name)) in ('pdf','docx','jpg','jpeg','png','zip'));
create policy "admin borra archivos" on storage.objects for delete to authenticated
  using (bucket_id = 'materiales' and is_admin());

-- ---------- DATOS DE EJEMPLO (reemplazar por el listado real) ----------
insert into carreras (nombre) values
  ('Lic. en Administración'), ('Ingeniería Electrónica'), ('Lic. en Trabajo Social'), ('Lic. en Comunicación Social');

insert into materias (carrera_id, nombre, anio, cuatrimestre)
select c.id, v.n, v.a, v.q from (values
  ('Lic. en Administración','Introducción a la Administración',1,1),
  ('Lic. en Administración','Matemática I',1,1),
  ('Lic. en Administración','Contabilidad I',1,2),
  ('Lic. en Administración','Microeconomía',2,1),
  ('Lic. en Administración','Estadística',2,2),
  ('Ingeniería Electrónica','Análisis Matemático I',1,1),
  ('Ingeniería Electrónica','Física I',1,1),
  ('Ingeniería Electrónica','Álgebra y Geometría',1,2),
  ('Ingeniería Electrónica','Circuitos Eléctricos',2,1),
  ('Ingeniería Electrónica','Electrónica Analógica',2,2),
  ('Lic. en Trabajo Social','Introducción al Trabajo Social',1,1),
  ('Lic. en Trabajo Social','Sociología',1,2),
  ('Lic. en Trabajo Social','Políticas Sociales',2,1),
  ('Lic. en Trabajo Social','Metodología de la Investigación',2,2),
  ('Lic. en Comunicación Social','Teorías de la Comunicación',1,1),
  ('Lic. en Comunicación Social','Historia Argentina Contemporánea',1,2),
  ('Lic. en Comunicación Social','Taller de Escritura',2,1),
  ('Lic. en Comunicación Social','Comunicación Audiovisual',2,2)
) as v(c, n, a, q) join carreras c on c.nombre = v.c;
