import './globals.css'
import { Inter } from 'next/font/google'
import NavigationSidebar from '../components/NavigationSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TaskFlow',
  description: 'A modern task management application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <NavigationSidebar />
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
