'use client'
// Materia: pestañas por tipo, filtro por año y orden.
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, TIPOS } from '@/lib/supabase'
import PostCard from '@/components/PostCard'

export default function Materia() {
  const { id } = useParams()
  const [m, setM] = useState(null)
  const [posts, setPosts] = useState([])
  const [tab, setTab] = useState(TIPOS[0])
  const [anio, setAnio] = useState('')
  const [orden, setOrden] = useState('nuevos')

  useEffect(() => {
    supabase.from('materias').select('id,nombre,anio,cuatrimestre,carreras(id,nombre)').eq('id', id).single()
      .then(({ data }) => setM(data))
    supabase.from('publicaciones').select('*').eq('materia_id', id).then(({ data }) => setPosts(data || []))
  }, [id])

  if (!m) return <p className="empty">Cargando…</p>
  const anios = [...new Set(posts.map((p) => p.anio_cursada))].sort().reverse()
  const lista = posts
    .filter((p) => p.tipo === tab && (!anio || p.anio_cursada == anio))
    .sort((a, b) => (orden === 'bajados' ? b.descargas - a.descargas : new Date(b.creado_en) - new Date(a.creado_en)))

  return (
    <>
      <Link href={'/carrera/' + m.carreras.id} className="crumb">← {m.carreras.nombre}</Link>
      <h2>{m.nombre}</h2>
      <div className="mut">{m.anio}º año · {m.cuatrimestre}º cuatrimestre</div>
      <div className="tabs">
        {TIPOS.map((t) => <button key={t} className={'pill s ' + (t === tab ? '' : 'o')} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="tools">
        <select value={anio} onChange={(e) => setAnio(e.target.value)}>
          <option value="">Todos los años</option>{anios.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="nuevos">Más recientes</option><option value="bajados">Más descargados</option>
        </select>
        <Link className="pill s" href={'/subir?materia=' + id}>+ Subir</Link>
      </div>
      {lista.length ? lista.map((p) => <PostCard key={p.id} p={p} />)
        : <p className="empty">Todavía no hay material acá. ¡Sé el primero en subirlo!</p>}
    </>
  )
}
