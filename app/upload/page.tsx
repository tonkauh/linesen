'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { ChevronLeft, Image as ImageIcon, X, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function IGUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

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

    try {
      setUploading(true)
      
      // 1. Optimize Image
      const options = { maxSizeMB: 5, maxWidthOrHeight: 4000, useWebWorker: true, initialQuality: 1, fileType: 'image/webp' as any }
      const processedFile = await imageCompression(file, options)

      // 2. Storage Upload
      const fileName = `${Date.now()}.webp`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(`public/${fileName}`, processedFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(`public/${fileName}`)

      // 3. Database Insert
      const { error: dbError } = await supabase.from('artworks').insert([
        { title, artist: artist || 'Anonymous', image_url: urlData.publicUrl }
      ])

      if (dbError) throw dbError
      router.push('/')
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
        
        {/* --- IG TOP NAVIGATION --- */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <Link href="/"><ChevronLeft className="w-6 h-6" /></Link>
            <h2 className="text-sm font-bold">New Post</h2>
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`text-sm font-bold text-blue-500 hover:text-blue-700 disabled:text-gray-300 transition-colors`}
          >
            {uploading ? 'Posting...' : 'Share'}
          </button>
        </nav>

        {/* --- IMAGE PREVIEW AREA --- */}
        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <>
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={() => {setFile(null); setPreviewUrl(null);}}
                className="absolute top-4 right-4 bg-black/50 p-1 rounded-full text-white backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Select Artwork</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* --- INPUT FIELDS --- */}
        <div className="p-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" /> {/* Avatar Placeholder */}
            <textarea 
              placeholder="Write a title for your masterpiece..."
              className="w-full mt-2 text-sm outline-none resize-none border-none focus:ring-0 placeholder:text-gray-300"
              rows={2}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <hr className="border-gray-50" />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium w-20 text-gray-400">Artist Name</span>
              <input 
                type="text" 
                placeholder="Who created this? (Optional)"
                className="flex-1 text-sm outline-none border-none focus:ring-0"
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            
            <hr className="border-gray-50" />
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-xs font-medium">LineSen Protection Enabled</span>
              </div>
              <div className="w-8 h-4 bg-black rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tighter">
              Your artwork will be optimized and shielded with our proprietary digital vault technology.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}