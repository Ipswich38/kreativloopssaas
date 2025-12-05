"use client"

import { Bell, Search, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { isOnline } from '@/lib/database/offline'

export function Header() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const checkOnlineStatus = async () => {
      const status = await isOnline()
      setOnline(status)
    }

    checkOnlineStatus()
    window.addEventListener('online', () => setOnline(true))
    window.addEventListener('offline', () => setOnline(false))

    return () => {
      window.removeEventListener('online', () => setOnline(true))
      window.removeEventListener('offline', () => setOnline(false))
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section - Breadcrumb/Title */}
        <div className="flex items-center flex-1 space-x-4">
          <div className="lg:hidden"></div> {/* Spacer for mobile menu button */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">
              Dental Practice Management
            </h2>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:flex items-center flex-1 justify-center max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients, appointments..."
              className="pl-10 h-9 text-sm bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          {/* Online status indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-lg">
            {online ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${online ? 'text-green-600' : 'text-red-600'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}