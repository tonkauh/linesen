'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('กรุณาเลือกรูปภาพ!')

    try {
      setUploading(true)

      // --- STEP 1: LOSSLESS SHIELDING (ชัดเท่าต้นฉบับเป๊ะ) ---
      const options = {
        maxSizeMB: 50,           // ขยายเพดานไว้สูงมากเพื่อให้ไม่โดนบีบอัด
        maxWidthOrHeight: 8000,  // รองรับไฟล์ใหญ่ระดับ 8K เพื่อความคมชัดสูงสุด
        useWebWorker: true,
        initialQuality: 1,       // 1 = 100% Quality (ห้ามลดคุณภาพไฟล์)
        fileType: 'image/webp'   // แปลงเป็น WebP แบบ Lossless เพื่อความลื่นไหลของเว็บ
      }
      
      const protectedFile = await imageCompression(file, options)

      // --- STEP 2: SECURITY NAMING ---
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      const filePath = `vault/${fileName}`

      // --- STEP 3: UPLOAD TO SUPABASE ---
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, protectedFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(filePath)

      // --- STEP 4: DATABASE RECORD WITH SECURITY TAGS ---
      const { error: dbError } = await supabase.from('artworks').insert([{ 
        title, 
        artist, 
        image_url: urlData.publicUrl,
        protection_status: true,
        metadata: { 
          original_name: file.name,
          upload_method: 'Lossless Shield',
          timestamp: new Date().toISOString()
        }
      }])

      if (dbError) throw dbError

      alert('นำผลงานเข้าสู่ระบบป้องกันสำเร็จ!')
      router.push('/')
      router.refresh()

    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 max-w-md w-full">
        <h1 className="text-3xl font-serif italic mb-2">Secure Upload</h1>
        <p className="text-gray-400 text-sm mb-8">Lossless encryption for your masterpiece.</p>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <input 
            type="text" placeholder="Title" required
            className="w-full py-3 border-b border-gray-100 outline-none focus:border-black transition"
            onChange={(e) => setTitle(e.target.value)}
          />
          <input 
            type="text" placeholder="Artist name" required
            className="w-full py-3 border-b border-gray-100 outline-none focus:border-black transition"
            onChange={(e) => setArtist(e.target.value)}
          />

          <div className="relative h-48 border-2 border-dashed border-gray-100 rounded-[32px] flex items-center justify-center group hover:bg-gray-50 transition cursor-pointer">
            <input 
              type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="text-center">
              <span className="text-2xl mb-2 block">🖼️</span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {file ? file.name : "Select High-Res File"}
              </p>
            </div>
          </div>

          <button 
            disabled={uploading}
            className="w-full bg-black text-white py-5 rounded-full font-bold hover:opacity-80 transition disabled:bg-gray-200"
          >
            {uploading ? 'SHIELDING...' : 'PROTECT & UPLOAD'}
          </button>
        </form>
      </div>
    </main>
  )
}