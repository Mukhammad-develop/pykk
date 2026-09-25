import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PYKK',
  description: 'Tech for every business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}
