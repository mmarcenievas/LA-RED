'use client'
// Formulario de subida: valida tipo y tamaño, sube a Storage y guarda la fila en la base.
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, TIPOS, EXTENSIONES, MAX_MB } from '@/lib/supabase'

export default function Subir() {
  const router = useRouter()
  const [carreras, setCarreras] = useState([])
  const [cid, setCid] = useState('')
  const [mid, setMid] = useState('')
  const [f, setF] = useState({ tipo: TIPOS[0], titulo: '', descripcion: '', anio: 2026, alias: '' })
  const [archivo, setArchivo] = useState(null)
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    supabase.from('carreras').select('id,nombre,materias(id,nombre)').order('nombre').then(({ data }) => {
      setCarreras(data || [])
      const pre = new URLSearchParams(window.location.search).get('materia') // viene de "+ Subir" en una materia
      const c = (data || []).find((c) => c.materias.some((m) => String(m.id) === pre)) || (data || [])[0]
      if (c) { setCid(String(c.id)); setMid(pre && c.materias.some((m) => String(m.id) === pre) ? pre : String(c.materias[0]?.id || '')) }
    })
  }, [])

  const materias = carreras.find((c) => String(c.id) === cid)?.materias || []
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    const ext = archivo.name.split('.').pop().toLowerCase()
    if (!EXTENSIONES.includes(ext)) return setMsg('Formato no permitido.')
    if (archivo.size > MAX_MB * 1024 * 1024) return setMsg(`El archivo supera los ${MAX_MB} MB.`)
    setEnviando(true); setMsg('')
    // 1) subir el archivo a Storage (carpeta = id de la materia)
    const limpio = archivo.name.normalize('NFD').replace(/[^\w.\-]+/g, '_')
    const path = `${mid}/${Date.now()}-${limpio}`
    const up = await supabase.storage.from('materiales').upload(path, archivo)
    if (up.error) { setEnviando(false); return setMsg('No se pudo subir el archivo: ' + up.error.message) }
    // 2) guardar los datos de la publicación
    const { error } = await supabase.from('publicaciones').insert({
      materia_id: mid, tipo: f.tipo, titulo: f.titulo.trim(), descripcion: f.descripcion.trim(),
      alias: f.alias.trim() || null, anio_cursada: f.anio, archivo_path: path, archivo_nombre: archivo.name,
    })
    if (error) { await supabase.storage.from('materiales').remove([path]); setEnviando(false); return setMsg('Error: ' + error.message) }
    router.push('/materia/' + mid)
  }

  return (
    <>
      <h2>Subir material</h2>
      <p className="note">No hace falta registrarse. Subí solo material propio o de libre circulación. Formatos: PDF, DOCX, JPG, PNG, ZIP · máx. {MAX_MB} MB.</p>
      <form onSubmit={enviar}>
        <label>Carrera</label>
        <select value={cid} onChange={(e) => { setCid(e.target.value); setMid(String(carreras.find((c) => String(c.id) === e.target.value).materias[0]?.id || '')) }}>
          {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <label>Materia</label>
        <select value={mid} onChange={(e) => setMid(e.target.value)} required>
          {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <label>Tipo de material</label>
        <select value={f.tipo} onChange={set('tipo')}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
        <label>Título</label>
        <input type="text" required minLength={3} maxLength={90} value={f.titulo} onChange={set('titulo')} placeholder="Ej: Resumen unidades 1 a 3" />
        <label>Descripción</label>
        <textarea rows={3} maxLength={300} value={f.descripcion} onChange={set('descripcion')} placeholder="¿Qué contiene? ¿Con qué cátedra lo cursaste?" />
        <label>Año de cursada</label>
        <input type="number" min={2000} max={2035} required value={f.anio} onChange={set('anio')} />
        <label>Archivo</label>
        <input type="file" required accept=".pdf,.docx,.jpg,.jpeg,.png,.zip" onChange={(e) => setArchivo(e.target.files[0])} />
        <label>Alias (opcional)</label>
        <input type="text" maxLength={30} value={f.alias} onChange={set('alias')} placeholder="Si lo dejás vacío figura como anónimo" />
        {msg && <p className="note">{msg}</p>}
        <p><button className="pill" type="submit" disabled={enviando}>{enviando ? 'Subiendo…' : 'Publicar'}</button></p>
      </form>
    </>
  )
}
