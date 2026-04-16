import NavigationSidebar from '../../components/NavigationSidebar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function AuthLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <NavigationSidebar />
        <main style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '65px'
        }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
