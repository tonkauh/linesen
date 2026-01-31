'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [myArt, setMyArt] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        // ดึงเฉพาะงานที่เป็นของ User คนนี้
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .eq('user_id', user.id)
          .order('id', { ascending: false })
        
        if (data) setMyArt(data)
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผลงานชิ้นนี้ออกจากระบบป้องกัน?")) return

    try {
      // 1. ลบจาก Database
      const { error: dbError } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id)
      
      if (dbError) throw dbError

      // 2. ลบจาก Storage (ดึงชื่อไฟล์จาก URL)
      const fileName = imageUrl.split('/').pop()
      await supabase.storage.from('gallery').remove([`vault/${fileName}`])

      setMyArt(myArt.filter(art => art.id !== id))
      alert("ลบสำเร็จ")
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-gray-400">Loading your vault...</div>

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Artist Dashboard</h1>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase italic">{user?.email}</p>
          </div>
          <div className="flex gap-8">
            <Link href="/upload" className="text-xs font-bold tracking-widest uppercase border-b border-black pb-1 hover:opacity-50 transition">Add Artwork</Link>
            <button onClick={handleLogout} className="text-xs font-bold tracking-widest uppercase text-red-500 hover:opacity-50 transition">Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {myArt.length > 0 ? (
            myArt.map(art => (
              <div key={art.id} className="group">
                <div className="relative aspect-square bg-gray-50 overflow-hidden border border-gray-100 transition-all duration-500 group-hover:shadow-xl">
                  <img 
                    src={art.image_url} 
                    className="w-full h-full object-cover select-none" 
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button 
                      onClick={() => handleDelete(art.id, art.image_url)}
                      className="text-[10px] font-bold tracking-[0.2em] text-white uppercase border border-white/50 px-4 py-2 hover:bg-white hover:text-black transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase">{art.title}</h3>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-400 font-serif italic text-lg mb-4">No artworks posted yet.</p>
              <Link href="/upload" className="text-xs font-bold tracking-widest uppercase text-indigo-600 hover:underline">Start Prosting</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}