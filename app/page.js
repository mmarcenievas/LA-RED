'use client'
// Inicio: portada, estadísticas, accesos rápidos y listado de carreras.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, TIPOS } from '@/lib/supabase'

export default function Inicio() {
  const [carreras, setCarreras] = useState([])
  const [stats, setStats] = useState({ c: 0, m: 0, a: 0 })

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('carreras').select('id,nombre,materias(count)').order('nombre')
      setCarreras(data || [])
      const contar = async (t) => (await supabase.from(t).select('*', { count: 'exact', head: true })).count || 0
      setStats({ c: await contar('carreras'), m: await contar('materias'), a: await contar('publicaciones') })
    })()
  }, [])

  return (
    <>
      <section className="hero">
        <h1>El verdadero sueño colectivo</h1>
<p>Apuntes, parciales, todo el material que tengamos, en un solo lugar.<br />Descargá sin registrarte</p>
        <div className="stats">
          <div className="stat"><b>{stats.c}</b>Carreras</div>
          <div className="stat"><b>{stats.m}</b>Materias</div>
          <div className="stat"><b>{stats.a}</b>Archivos</div>
        </div>
      </section>
      <div className="quick">
        {TIPOS.map((t) => <Link key={t} className="pill o" href={'/buscar?tipo=' + encodeURIComponent(t)}>{t}</Link>)}
      </div>
      <h2 className="sec">Carreras</h2>
      <div className="grid">
        {carreras.map((c) => (
          <Link key={c.id} href={'/carrera/' + c.id} className="card">
            <h3>{c.nombre}</h3><span className="mut">{c.materias[0].count} materias</span>
          </Link>
        ))}
      </div>
    </>
  )
}
