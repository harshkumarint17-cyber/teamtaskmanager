import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TeamFlow - Project Management',
  description: 'TeamFlow by Ethara — manage your projects, assign tasks, and collaborate with your team in one place.',
  icons: {
    icon: '/ethara.png',
    shortcut: '/ethara.png',
    apple: '/ethara.png',
  },
  openGraph: {
    title: 'TeamFlow - Project Management',
    description: 'TeamFlow by Ethara — manage your projects, assign tasks, and collaborate with your team in one place.',
    url: 'https://teamflow.ethara.ai',
    siteName: 'TeamFlow',
    images: [
      {
        url: '/ethara.png',
        width: 512,
        height: 512,
        alt: 'TeamFlow by Ethara',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TeamFlow - Project Management',
    description: 'TeamFlow by Ethara — manage your projects, assign tasks, and collaborate with your team in one place.',
    images: ['/ethara.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
