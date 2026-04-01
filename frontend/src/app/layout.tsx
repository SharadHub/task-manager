import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multi-Tenant Task Manager',
  description: 'Isolated task management for organizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900 bg-gray-50" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
