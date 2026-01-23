import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Real-time scrolling display',
  description: 'Generated with BLACKBOX AI Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="antialiased">{children}</body>
    </html>
  )
}
