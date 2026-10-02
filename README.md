# La Red · Material de estudio colaborativo (no oficial)

Next.js 14 + Supabase (base de datos y Storage), listo para Vercel.
Sitio colaborativo no oficial, sin afiliación con la UNM.

## Qué hay en cada carpeta
- `app/`: las páginas (inicio, carrera, materia, subir, buscar, admin). Cada carpeta es una URL.
- `components/`: piezas repetidas (barra superior, tarjeta de publicación).
- `lib/supabase.js`: conexión a Supabase y constantes (tipos de material, formatos, 20 MB).
- `supabase/schema.sql`: tablas, seguridad, bucket de archivos y datos de ejemplo.

## Guía paso a paso

### 1. Crear el proyecto en Supabase
1. Entrá a supabase.com, creá una cuenta y tocá **New project** (plan gratuito alcanza para arrancar).
2. Elegí nombre, una clave de base de datos (guardala) y la región más cercana (São Paulo).

### 2. Crear tablas, seguridad y Storage
1. En Supabase abrí **SQL Editor > New query**.
2. Pegá todo el contenido de `supabase/schema.sql` y tocá **Run**. Debe decir "Success".
3. Verificá en **Table Editor** que existan las tablas y en **Storage** el bucket `materiales`.

### 3. Copiar las claves
En **Project Settings > API** copiá **Project URL** y **anon public key**.

### 4. Probar en tu computadora
1. Instalá Node.js 18 o superior (nodejs.org).
2. En la carpeta del proyecto: copiá `.env.example` como `.env.local` y pegá tus dos valores.
3. Ejecutá `npm install` y después `npm run dev`. Abrí http://localhost:3000.

### 5. Crear el usuario administrador
1. Supabase > **Authentication > Users > Add user > Create new user** (email y clave; tildá "Auto confirm").
2. Copiá el **UID** del usuario creado.
3. En **SQL Editor** ejecutá: `insert into admins (user_id) values ('PEGAR-EL-UID');`
4. Entrá a `/admin` en el sitio con ese email y clave.
Para desactivar los registros públicos: **Authentication > Providers > Email > desactivar "Allow new users to sign up"**.

### 6. Subir el código a GitHub
Creá un repositorio en github.com, subí la carpeta (`.env.local` no se sube, está en `.gitignore`).

### 7. Publicar en Vercel
1. En vercel.com: **Add New > Project** e importá el repositorio.
2. En **Environment Variables** cargá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Tocá **Deploy**. Cada cambio que subas a GitHub se publica solo.

### 8. Cargar las carreras y materias reales
En `schema.sql` borrá los datos de ejemplo (sección final) antes de correrlo, o desde **Table Editor**
borrá las filas de `carreras` (las materias se borran en cascada). Después cargá las reales con
**Insert > Import data from CSV** (primero `carreras`, luego `materias` con el `carrera_id` correspondiente),
o con `insert` en el SQL Editor siguiendo el formato del ejemplo.

## Cómo funciona la seguridad
- Lectura pública: cualquiera ve carreras, materias y publicaciones.
- Subida pública con límites: la base valida largo de textos, año y tipo; Storage valida 20 MB y formatos (PDF, DOCX, JPG, PNG, ZIP).
- Reportes: cualquiera reporta. Con 3 reportes la publicación se oculta sola hasta que el admin decida.
- Borrar: solo el admin (tabla `admins` + función `is_admin()`).

## Limitaciones a tener en cuenta
- No hay límite de subidas por persona. Si aparece spam, sumar Cloudflare Turnstile o limitar por IP.
- Los archivos no se escanean en busca de virus. Conviene aclararlo en el sitio.
- El plan gratuito de Supabase tiene 1 GB de Storage; si se llena, hay que pasar a un plan pago.
- Podés recibir reclamos por derechos de autor: dejá un mail de contacto en el pie de página y borrá rápido lo que corresponda.
