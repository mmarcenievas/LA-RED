'use client'
// Tarjeta de una publicación: datos, botón Descargar y Reportar.
import { useState } from 'react'
import { supabase, urlArchivo } from '@/lib/supabase'

export default function PostCard({ p, materia }) {
  const [descargas, setDescargas] = useState(p.descargas)

  async function descargar() {
    await supabase.rpc('registrar_descarga', { pub_id: p.id }) // suma 1 al contador
    setDescargas(descargas + 1)
    window.open(urlArchivo(p.archivo_path), '_blank')
  }

  async function reportar() {
    const motivo = prompt('¿Por qué querés reportar este archivo?')
    if (!motivo) return
    const { error } = await supabase.from('reportes').insert({ publicacion_id: p.id, motivo: motivo.slice(0, 200) })
    alert(error ? 'No se pudo enviar el reporte.' : 'Gracias, un administrador lo va a revisar.')
  }

  return (
    <article className="post">
      <span className="tag">{p.tipo}</span> {materia && <span className="mut">{materia}</span>}
      <h3>{p.titulo}</h3>
      <div className="mut">{p.descripcion}</div>
      <div className="meta">
        <span>Por {p.alias || 'anónimo'}</span>
        <span>{new Date(p.creado_en).toLocaleDateString('es-AR')}</span>
        <span>Cursada {p.anio_cursada}</span>
        <span>⬇ {descargas} descargas</span>
      </div>
      <div className="acts">
        <button className="pill s" onClick={descargar}>Descargar</button>
        <button className="link" onClick={reportar}>Reportar</button>
      </div>
    </article>
  )
}
