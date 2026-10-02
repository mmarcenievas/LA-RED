'use client'
// Barra superior: logo, links y buscador global.
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  function buscar(e) {
    e.preventDefault()
    const q = new FormData(e.target).get('q').trim()
    if (q) router.push('/buscar?q=' + encodeURIComponent(q))
  }
  return (
    <header>
      <div className="bar">
        <Link href="/" className="logo" aria-label="La Red, inicio">
          {/* Logotipo genérico: tres nodos conectados */}
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 6 6 24h20z" /><circle cx="16" cy="6" r="4" fill="currentColor" />
            <circle cx="6" cy="24" r="4" fill="currentColor" /><circle cx="26" cy="24" r="4" fill="currentColor" />
          </svg>La Red
        </Link>
        <nav><Link href="/"><button>Inicio</button></Link><Link href="/subir"><button>Subir</button></Link></nav>
        <form className="sb" onSubmit={buscar}>
          <input name="q" type="search" placeholder="Buscar carreras, materias, apuntes…" />
        </form>
      </div>
    </header>
  )
}
