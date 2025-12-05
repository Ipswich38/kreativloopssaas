"use client"

import { EnhancedSidebar } from '@/components/layout/enhanced-sidebar'
import { Header } from '@/components/layout/header'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const authUser = localStorage.getItem('auth_user')
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    try {
      setUser(JSON.parse(authUser))
    } catch {
      router.push('/auth/login')
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <EnhancedSidebar
        clinicName={user.clinic_name || 'Happy Teeth Dental Clinic'}
        userEmail={user.email}
      />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <Header />

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}