'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Camera, Check } from 'lucide-react'
import Link from 'next/link'

export default function EditProfile() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      // ดึงข้อมูลเดิมจากตาราง profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username || '')
        setBio(profile.bio || '')
      }
      setLoading(false)
    }
    getProfile()
  }, [router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username.toLowerCase().replace(/\s/g, '_'), // กันคนใส่เว้นวรรค
        bio: bio,
        updated_at: new Date(),
      })

    if (error) {
      if (error.code === '23505') alert('This username is already taken.')
      else alert(error.message)
    } else {
      router.push('/profile')
      router.refresh()
    }
    setUpdating(false)
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-serif italic text-gray-400 uppercase tracking-widest">Loading Settings...</div>

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-50 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-50 transition-all">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Cancel</span>
        </Link>
        <h1 className="text-[12px] font-bold uppercase tracking-[0.2em]">Edit Profile</h1>
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-black transition-all"
        >
          {updating ? 'Saving...' : 'Done'}
        </button>
      </nav>

      <div className="max-w-md mx-auto p-8 space-y-12">
        {/* Profile Pic Placeholder */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${username || user?.email}`} alt="avatar" />
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
             </div>
          </div>
          <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Change Profile Photo</button>
        </div>

        {/* Form Fields */}
        <form className="space-y-8">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
            <input 
              type="text" 
              value={username}
              placeholder="Unique identifier..."
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-black transition-all text-sm rounded-none"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bio</label>
            <textarea 
              value={bio}
              placeholder="Tell your story..."
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-black transition-all text-sm rounded-none resize-none h-20"
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </form>

        <div className="pt-10">
            <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                <Check className="w-4 h-4 text-green-500" />
                <p className="text-[9px] text-gray-400 uppercase leading-relaxed tracking-wider">
                    Your username will be visible on the main feed and your private archive.
                </p>
            </div>
        </div>
      </div>
    </main>
  )
}