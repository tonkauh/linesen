'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { ChevronLeft, Image as ImageIcon, X, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function IGUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // ดึงข้อมูล User เมื่อหน้าโหลด
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        alert("Please login to share your artwork.");
        router.push('/login');
      }
      setUser(user);
    });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return alert('Please add a title and an image')
    if (!user) return alert('Authentication required')

    try {
      setUploading(true)
      
      // 1. Optimize Image (บีบอัดให้คุณภาพยังกริบแต่ไฟล์เบา)
      const options = { maxSizeMB: 2, maxWidthOrHeight: 4000, useWebWorker: true, initialQuality: 0.8, fileType: 'image/webp' as any }
      const processedFile = await imageCompression(file, options)

      // 2. Storage Upload
      const fileName = `${user.id}/${Date.now()}.webp` // เก็บแยกตาม Folder User
      const { error: uploadError } = await supabase.storage.from('gallery').upload(`public/${fileName}`, processedFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(`public/${fileName}`)

      // 3. Database Insert (ผูก user_id และเอาชื่อจาก Email มาเป็น Artist)
      const { error: dbError } = await supabase.from('artworks').insert([
        { 
          title, 
          artist: user.email?.split('@')[0], // ใช้ชื่อหน้า @ เป็นชื่อศิลปินอัตโนมัติ
          image_url: urlData.publicUrl,
          user_id: user.id // <--- บรรทัดนี้ทำให้รูปไปขึ้นในหน้า Profile ของคนโพสต์
        }
      ])

      if (dbError) throw dbError
      
      // เมื่อโพสต์เสร็จ พาไปหน้า Profile เพื่อดูผลงานตัวเองทันที
      router.push('/profile')
      router.refresh()

    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black md:bg-gray-50 md:py-10">
      <div className="max-w-xl mx-auto bg-white md:border md:rounded-xl overflow-hidden shadow-2xl">
        
        {/* --- TOP NAVIGATION --- */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <Link href="/"><ChevronLeft className="w-6 h-6" /></Link>
            <h2 className="text-sm font-bold uppercase tracking-widest">New Entry</h2>
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`text-sm font-bold text-black hover:opacity-50 disabled:text-gray-300 transition-all uppercase tracking-widest`}
          >
            {uploading ? 'Archiving...' : 'Share'}
          </button>
        </nav>

        {/* --- IMAGE PREVIEW --- */}
        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
          {previewUrl ? (
            <>
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={() => {setFile(null); setPreviewUrl(null);}}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md hover:bg-black transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center gap-3 cursor-pointer group p-20 w-full h-full justify-center">
              <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Select Masterpiece</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* --- INPUT FIELDS --- */}
        <div className="p-6 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} alt="avatar" />
            </div>
            <textarea 
              placeholder="Title of your masterpiece..."
              className="w-full mt-1 text-sm outline-none resize-none border-none focus:ring-0 placeholder:text-gray-300 font-serif italic"
              rows={3}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Posting as</span>
                <span className="text-xs font-bold">@{user?.email?.split('@')[0] || 'authenticating...'}</span>
            </div>
            
            <div className="flex items-center justify-between py-4 px-4 bg-black rounded-lg text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">LineSen Protection Active</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-[9px] text-gray-300 leading-relaxed uppercase tracking-tighter">
              Encrypted in LineSen Vault • Blockchain Verified • Protected IP
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}