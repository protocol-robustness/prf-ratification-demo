import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Research ratification · User-owned demonstration',
  description: 'A local, read-only demonstration of researcher agreement, dissent, and a frozen resolution basis.',
  icons: { icon: '/prf-logo.png' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
