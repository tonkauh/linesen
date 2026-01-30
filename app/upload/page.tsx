'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

      // 1. อัปโหลดรูปไปที่ Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. ดึง Public URL ของรูปที่เพิ่งอัปโหลด
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName)

      const imageUrl = urlData.publicUrl

      // 3. บันทึกข้อมูลลงตาราง artworks
      const { error: dbError } = await supabase
        .from('artworks')
        .insert([{ 
          title, 
          artist, 
          image_url: imageUrl,
          protection_status: true // สมมติว่าผ่านระบบป้องกันแล้ว
        }])

      if (dbError) throw dbError

      alert('อัปโหลดสำเร็จ!')
      router.push('/') // กลับหน้าแรกไปดูผลงาน
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full border border-slate-100">
        <h1 className="text-3xl font-black mb-8 text-slate-900">Upload <span className="text-indigo-600">Art</span></h1>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อผลงาน</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="ตั้งชื่อภาพของคุณ"
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อศิลปิน</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="ชื่อนามปากกา"
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เลือกไฟล์ภาพ</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-300"
          >
            {uploading ? 'กำลังอัปโหลด...' : 'บันทึกผลงาน'}
          </button>
        </form>
      </div>
    </main>
  )
}