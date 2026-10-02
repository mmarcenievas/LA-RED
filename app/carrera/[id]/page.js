'use client'
// Carrera: materias agrupadas por año y cuatrimestre.
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Carrera() {
  const { id } = useParams()
  const [c, setC] = useState(null)

  useEffect(() => {
    supabase.from('carreras').select('id,nombre,materias(id,nombre,anio,cuatrimestre)').eq('id', id).single()
      .then(({ data }) => setC(data))
  }, [id])

  if (!c) return <p className="empty">Cargando…</p>
  const grupos = [...new Set(c.materias.map((m) => `${m.anio}-${m.cuatrimestre}`))].sort()
  return (
    <>
      <Link href="/" className="crumb">← Inicio</Link>
      <h2>{c.nombre}</h2>
      {grupos.map((g) => {
        const [anio, cuat] = g.split('-')
        return (
          <div key={g}>
            <h3 className="sec">{anio}º año · {cuat}º cuatrimestre</h3>
            <div className="grid">
              {c.materias.filter((m) => `${m.anio}-${m.cuatrimestre}` === g).map((m) => (
                <Link key={m.id} href={'/materia/' + m.id} className="card"><h3>{m.nombre}</h3></Link>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
