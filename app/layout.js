import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'La Red · Material de estudio colaborativo',
  description: 'Todo el material en un solo lugar. Sitio no oficial.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer>
          Sitio colaborativo no oficial, sin afiliación con la UNM.<br />
          <a className="link" href="/admin">Administración</a>
        </footer>
      </body>
    </html>
  )
}
