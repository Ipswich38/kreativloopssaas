"use client"

import { useState } from 'react'
import {
  Calendar,
  Users,
  CreditCard,
  Package,
  Settings,
  Menu,
  X,
  Home,
  FileText,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Services', href: '/services', icon: FileText },
  { name: 'Financial', href: '/financial', icon: DollarSign },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  clinicName: string
}

export function Sidebar({ clinicName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 bg-white shadow-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {clinicName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 truncate">
                {clinicName}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-secondary-700">
                    U
                  </span>
                </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  User Name
                </p>
                <p className="text-xs text-gray-500 truncate">
                  user@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}