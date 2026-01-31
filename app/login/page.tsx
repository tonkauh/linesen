'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false) // สลับโหมด Login / Sign Up
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      // --- ระบบสมัครสมาชิก ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      })
      if (error) setMessage(error.message)
      else setMessage('Registration successful! Please check your email for confirmation.')
    } else {
      // --- ระบบเข้าสู่ระบบ ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage(error.message)
      else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-12">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Back to Feed
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif italic tracking-tighter">LineSen</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
            {isSignUp ? 'Create New Account' : 'Collector Entry'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full border-b border-gray-100 py-3 outline-none focus:border-black transition-all text-sm rounded-none bg-transparent"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full border-b border-gray-100 py-3 outline-none focus:border-black transition-all text-sm rounded-none bg-transparent"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[10px] font-bold tracking-[0.5em] uppercase hover:opacity-80 transition disabled:bg-gray-200"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-all"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          
          {message && (
            <p className={`text-[11px] italic p-4 rounded ${message.includes('successful') ? 'bg-gray-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}