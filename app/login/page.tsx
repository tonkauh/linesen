'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async (type: 'LOGIN' | 'SIGNUP') => {
    setLoading(true)
    const { error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) alert(error.message)
    else {
      alert(type === 'LOGIN' ? 'Welcome back!' : 'Account created!')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[2px] shadow-sm border border-gray-100 max-w-sm w-full">
        <h1 className="text-2xl font-serif italic mb-8 text-center">LineSen Artist Access</h1>
        <div className="space-y-6">
          <input 
            type="email" placeholder="Email Address"
            className="w-full py-2 border-b border-gray-100 outline-none focus:border-black transition-all bg-transparent"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password"
            className="w-full py-2 border-b border-gray-100 outline-none focus:border-black transition-all bg-transparent"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => handleAuth('LOGIN')} disabled={loading}
              className="w-full bg-black text-white py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-70 transition"
            >
              Sign In
            </button>
            <button 
              onClick={() => handleAuth('SIGNUP')} disabled={loading}
              className="w-full bg-white text-black border border-black py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-50 transition"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}