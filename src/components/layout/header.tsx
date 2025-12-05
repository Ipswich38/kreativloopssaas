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
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center flex-1 space-x-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients, appointments..."
              className="pl-10 h-9 text-sm"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Online status indicator */}
          <div className="flex items-center space-x-1">
            {online ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ${online ? 'text-green-600' : 'text-red-600'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}