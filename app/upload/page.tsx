'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'

export default function FreshUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Select your piece')

    try {
      setUploading(true)
      
      // 1. Optimize
      const options = { maxSizeMB: 5, maxWidthOrHeight: 3000, useWebWorker: true, initialQuality: 0.9, fileType: 'image/webp' as any }
      const processedFile = await imageCompression(file, options)

      // 2. Storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(`public/${fileName}`, processedFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(`public/${fileName}`)

      // 3. Database (ส่งแค่ 3 ค่าที่ตารางต้องการ)
      const { error: dbError } = await supabase.from('artworks').insert([
        { title, artist: artist || 'Anonymous', image_url: urlData.publicUrl }
      ])

      if (dbError) throw dbError

      alert('Upload Success!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-10">
      <form onSubmit={handleUpload} className="w-full max-w-sm space-y-8">
        <h1 className="text-4xl font-serif italic italic text-center">New Vault</h1>
        <div className="space-y-4">
          <input type="text" placeholder="Title" required className="w-full border-b py-2 outline-none focus:border-black" onChange={(e)=>setTitle(e.target.value)} />
          <input type="text" placeholder="Artist" className="w-full border-b py-2 outline-none focus:border-black" onChange={(e)=>setArtist(e.target.value)} />
        </div>
        <div className="border-2 border-dashed border-gray-100 h-40 flex items-center justify-center relative">
          <input type="file" accept="image/*" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{file ? file.name : "Select Image"}</p>
        </div>
        <button disabled={uploading} className="w-full bg-black text-white py-4 font-bold tracking-widest uppercase hover:opacity-80 transition disabled:bg-gray-200">
          {uploading ? 'Processing...' : 'Upload Now'}
        </button>
      </form>
    </main>
  )
}