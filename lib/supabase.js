// Conexión única a Supabase, compartida por todas las páginas.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const TIPOS = ['Apuntes', 'Trabajos prácticos', 'Parciales', 'Finales', 'Resúmenes', 'Otros']
export const EXTENSIONES = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'zip']
export const MAX_MB = 20

// Devuelve el link público de un archivo guardado en Storage
export const urlArchivo = (path) =>
  supabase.storage.from('materiales').getPublicUrl(path).data.publicUrl
