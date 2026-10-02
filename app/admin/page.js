'use client'
// Panel de administración: login con Supabase Auth y gestión de reportes.
// Solo funciona para usuarios cargados en la tabla "admins" (ver README).
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const [estado, setEstado] = useState('cargando') // cargando | login | admin | noadmin
  const [reportes, setReportes] = useState([])
  const [msg, setMsg] = useState('')

  async function revisar() {
    const { data: s } = await supabase.auth.getSession()
    if (!s.session) return setEstado('login')
    const { data: esAdmin } = await supabase.rpc('is_admin')
    if (!esAdmin) return setEstado('noadmin')
    setEstado('admin'); cargar()
  }
  async function cargar() {
    const { data } = await supabase.from('reportes')
      .select('id,motivo,publicaciones(id,titulo,archivo_path,materias(nombre))').order('creado_en', { ascending: false })
    setReportes(data || [])
  }
  useEffect(() => { revisar() }, [])

  async function entrar(e) {
    e.preventDefault()
    const d = new FormData(e.target)
    const { error } = await supabase.auth.signInWithPassword({ email: d.get('email'), password: d.get('password') })
    if (error) return setMsg('Email o clave incorrectos.')
    setMsg(''); revisar()
  }
  async function borrar(r) {
    if (!confirm('¿Borrar definitivamente el archivo y la publicación?')) return
    await supabase.storage.from('materiales').remove([r.publicaciones.archivo_path])
    await supabase.from('publicaciones').delete().eq('id', r.publicaciones.id) // borra también sus reportes
    cargar()
  }
  async function descartar(r) { await supabase.from('reportes').delete().eq('id', r.id); cargar() }
  async function salir() { await supabase.auth.signOut(); setEstado('login') }

  if (estado === 'cargando') return <p className="empty">Cargando…</p>
  if (estado === 'noadmin') return <><p className="note">Tu usuario no tiene permisos de administrador.</p><button className="link" onClick={salir}>Salir</button></>
  if (estado === 'login') return (
    <>
      <h2>Administración</h2>
      <form onSubmit={entrar}>
        <label>Email</label><input type="text" name="email" required />
        <label>Clave</label><input type="password" name="password" required />
        {msg && <p className="note">{msg}</p>}
        <p><button className="pill" type="submit">Entrar</button></p>
      </form>
    </>
  )
  return (
    <>
      <h2>Archivos reportados</h2>
      {reportes.length ? reportes.map((r) => (
        <article className="post" key={r.id}>
          <h3>{r.publicaciones.titulo}</h3>
          <div className="meta"><span>{r.publicaciones.materias.nombre}</span><span>Motivo: {r.motivo}</span></div>
          <div className="acts">
            <button className="pill s" onClick={() => borrar(r)}>Borrar</button>
            <button className="pill s o" onClick={() => descartar(r)}>Descartar reporte</button>
          </div>
        </article>
      )) : <p className="empty">No hay reportes pendientes.</p>}
      <button className="link" onClick={salir}>Salir</button>
    </>
  )
}
