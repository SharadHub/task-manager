import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import NavigationSidebar from '../components/NavigationSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TaskFlow',
  description: 'A modern task management application',
  icons: {
    icon: '/task-flow.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
