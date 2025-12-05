"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check for Happy Teeth POC account bypass
      if (email === 'sshappyteeth@gmail.com' && password === 'happyteeth123') {
        // Direct login for POC
        localStorage.setItem('auth_user', JSON.stringify({
          id: 'happy-teeth-user',
          email: 'sshappyteeth@gmail.com',
          clinic_id: 'happy-teeth-clinic',
          clinic_name: 'Happy Teeth Dental Clinic'
        }))
        router.push('/dashboard')
        return
      }

      // Regular Supabase authentication would go here
      // For now, simulate error for other emails
      throw new Error('Please use the Happy Teeth POC credentials')

    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">D</span>
          </div>
          <CardTitle className="text-2xl">Dental SaaS</CardTitle>
          <p className="text-sm text-gray-600">
            Sign in to your dental practice management system
          </p>
        </CardHeader>

        <CardContent>
          {/* POC Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
            <p className="text-sm text-amber-800">
              <strong>POC Access:</strong><br />
              Email: sshappyteeth@gmail.com<br />
              Password: happyteeth123
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This is a proof of concept for dental practice management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}