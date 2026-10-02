'use client'
// Búsqueda global (?q=texto) y listado por tipo (?tipo=Parciales).
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PostCard from '@/components/PostCard'

export default function Buscar() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const texto = (sp.get('q') || '').trim().replace(/[%,()]/g, ' ') // limpia caracteres especiales del filtro
    const tipo = sp.get('tipo')
    setQ(texto || tipo || '')
    ;(async () => {
      let pq = supabase.from('publicaciones').select('*,materias(nombre)').order('creado_en', { ascending: false }).limit(50)
      if (texto) pq = pq.ilike('titulo', `%${texto}%`)
      if (tipo) pq = pq.eq('tipo', tipo)
      const [p, m, c] = await Promise.all([
        pq,
        texto ? supabase.from('materias').select('id,nombre,carreras(nombre)').ilike('nombre', `%${texto}%`) : { data: [] },
        texto ? supabase.from('carreras').select('id,nombre').ilike('nombre', `%${texto}%`) : { data: [] },
      ])
      setRes({ posts: p.data || [], materias: m.data || [], carreras: c.data || [] })
    })()
  }, [])

  if (!res) return <p className="empty">Buscando…</p>
  const vacio = !res.posts.length && !res.materias.length && !res.carreras.length
  return (
    <>
      <h2 className="sec">Resultados para “{q}”</h2>
      {res.carreras.length > 0 && <><h3>Carreras</h3><div className="grid">
        {res.carreras.map((c) => <Link key={c.id} href={'/carrera/' + c.id} className="card"><h3>{c.nombre}</h3></Link>)}</div></>}
      {res.materias.length > 0 && <><h3 className="sec">Materias</h3><div className="grid">
        {res.materias.map((m) => <Link key={m.id} href={'/materia/' + m.id} className="card"><h3>{m.nombre}</h3><span className="mut">{m.carreras.nombre}</span></Link>)}</div></>}
      {res.posts.length > 0 && <><h3 className="sec">Material</h3>
        {res.posts.map((p) => <PostCard key={p.id} p={p} materia={p.materias.nombre} />)}</>}
      {vacio && <p className="empty">No encontramos nada. Probá con otra palabra.</p>}
    </>
  )
}
