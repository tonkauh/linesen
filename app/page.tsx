'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลจาก Supabase
  useEffect(() => {
    async function getArtworks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        if (data) setArtworks(data);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    }

    getArtworks();
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- 1. Navbar (แถบเมนูบน) --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition">
            LINE<span className="text-indigo-600">SEN</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/upload">
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:scale-105 transition active:scale-95 shadow-lg shadow-indigo-100 flex items-center gap-2">
                <span>+</span> อัปโหลดผลงาน
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. Hero Section --- */}
      <section className="relative max-w-6xl mx-auto px-6 pt-40 pb-24 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-100/40 blur-[100px] rounded-full -z-10" />
        
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-600 bg-indigo-50 rounded-full uppercase">
          Protecting Thai Artists
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
          Line<span className="text-indigo-600">Sen</span>
        </h1>
        
        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          พื้นที่ปลอดภัยของศิลปินไทย ปกป้องทุกลายเส้นจากการถูกขโมยโดย AI 
          และแสดงผลงานคุณภาพสูงสุดแบบไม่บีบอัดไฟล์
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <Link href="/upload" className="w-full sm:w-auto">
            <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 w-full">
              เริ่มอัปโหลดผลงาน
            </button>
          </Link>
          <button className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all w-full sm:w-auto">
            เรียนรู้ระบบป้องกัน AI
          </button>
        </div>
      </section>

      {/* --- 3. Gallery Section --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Recent Masterpieces</h2>
            <p className="text-slate-400 text-lg font-medium">ผลงานล่าสุดที่ได้รับการปกป้องบนระบบของเรา</p>
          </div>
          <div className="hidden md:flex gap-2">
             <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
             <div className="h-1.5 w-4 bg-slate-200 rounded-full" />
             <div className="h-1.5 w-4 bg-slate-200 rounded-full" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-100 aspect-[4/5] rounded-[32px] mb-4" />
                <div className="h-6 bg-slate-100 rounded-lg w-2/3 mb-2" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {artworks.length > 0 ? (
              artworks.map((art) => (
                <div key={art.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden mb-6 shadow-sm border border-slate-100 group-hover:shadow-2xl group-hover:-translate-y-3 transition-all duration-500">
                    {art.image_url ? (
                      <img 
                        src={art.image_url} 
                        alt={art.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">
                        No Artwork Image
                      </div>
                    )}
                    
                    {/* Protection Badge */}
                    {art.protection_status && (
                      <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest text-indigo-600 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        🛡️ AI PROTECTED
                      </div>
                    )}
                  </div>
                  <div className="px-2">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {art.title || "Untitled"}
                    </h3>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                      @{art.artist || "Unknown Artist"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 bg-slate-50 rounded-[50px] text-center border-4 border-dashed border-slate-100">
                <div className="text-5xl mb-6">🎨</div>
                <p className="text-slate-400 text-xl font-bold italic mb-4">ยังไม่มีผลงานในระบบ...</p>
                <Link href="/upload">
                  <button className="text-indigo-600 font-bold hover:underline">คลิกที่นี่เพื่อเริ่มอัปโหลดรูปแรกของคุณ</button>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- 4. Footer --- */}
      <footer className="py-20 px-6 border-t border-slate-50 text-center bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-2xl font-black tracking-tighter mb-6">
            LINE<span className="text-indigo-600">SEN</span>
          </div>
          <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
            © 2026 LineSen Project. Built for Artists.
          </p>
        </div>
      </footer>
    </main>
  );
}