'use client'
// Carrera: lista de materias (en el orden del plan).
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Carrera() {
  const { id } = useParams()
  const [c, setC] = useState(null)

  useEffect(() => {
    supabase.from('carreras').select('id,nombre,materias(id,nombre)').eq('id', id).single()
      .then(({ data }) => setC(data))
  }, [id])

  if (!c) return <p className="empty">Cargando…</p>
  const materias = [...c.materias].sort((a, b) => a.id - b.id)
  return (
    <>
      <Link href="/" className="crumb">← Inicio</Link>
      <h2>{c.nombre}</h2>
      <div className="grid">
        {materias.map((m) => (
          <Link key={m.id} href={'/materia/' + m.id} className="card"><h3>{m.nombre}</h3></Link>
        ))}
      </div>
    </>
  )
}
