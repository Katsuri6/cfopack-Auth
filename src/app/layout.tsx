import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'CFO Pack – Finance Intelligence Platform',
  description: 'Upload your financial data and get boardroom-ready insights instantly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider makes the logged-in user available to every page */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
