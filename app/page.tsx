'use client' // สำคัญ: ต้องใส่เพื่อให้ใช้ useState และ useEffect ได้

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // อย่าลืมสร้างไฟล์ lib/supabase.ts ตามที่คุยกันก่อนหน้านี้นะครับ

export default function Home() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลจาก Supabase artworks table
  useEffect(() => {
    async function getArtworks() {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('id', { ascending: false }); // เอาอันใหม่ขึ้นก่อน

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
    <main className="min-h-screen bg-white">
      {/* 1. Hero Section (ปรับสีให้ Modern ขึ้นตามที่คุณชอบ) */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-100/50 blur-[120px] rounded-full -z-10" />
        <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Line<span className="text-indigo-600">Sen</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          พื้นที่ปลอดภัยของศิลปินไทย ปกป้องทุกลายเส้นจากการถูกขโมยโดย AI 
          และแสดงผลงานคุณภาพสูงสุดแบบไม่บีบอัดไฟล์
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 transition w-full sm:w-auto">
            เริ่มใช้งานฟรี
          </button>
          <button className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition w-full sm:w-auto">
            เรียนรู้ระบบป้องกัน AI
          </button>
        </div>
      </section>

      {/* 2. Gallery Showcase (ส่วนที่เพิ่มใหม่ - ดึงข้อมูลจาก Supabase) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Recent Masterpieces</h2>
            <p className="text-slate-400 font-medium">ผลงานล่าสุดที่ได้รับความคุ้มครองจากเรา</p>
          </div>
          <button className="text-indigo-600 font-bold text-sm hover:underline">ดูทั้งหมด →</button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium animate-pulse">กำลังโหลดผลงานศิลปะ...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {artworks.length > 0 ? (
              artworks.map((art) => (
                <div key={art.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/5] bg-slate-100 rounded-[32px] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                    {art.image_url ? (
                      <img 
                        src={art.image_url} 
                        alt={art.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                    )}
                    
                    {/* Badge ป้องกัน AI */}
                    {art.protection_status && (
                      <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-indigo-600 shadow-sm">
                        🛡️ AI PROTECTED
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{art.title}</h3>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">@{art.artist}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-slate-50 rounded-[40px] text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">ยังไม่มีผลงานในระบบ ลองเพิ่มข้อมูลใน Supabase ดูครับ!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Feature Preview (ปรับดีไซน์ให้เข้ากับ Vibe ใหม่) */}
      <section className="bg-slate-900 py-24 rounded-[60px] mx-4 mb-20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-4xl font-black mb-16 text-white">ทำไมต้อง LineSen?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: '🛡️', title: 'AI Protection', desc: 'ใช้เทคโนโลยี Glaze ป้องกันการถูกดูดรูปไปเทรน AI' },
              { icon: '✨', title: 'Ultra High-Res', desc: 'ภาพคมชัดทุกลายเส้น ไม่โดนลดคุณภาพแม้แต่ 1%' },
              { icon: '💰', title: 'Safe Sale', desc: 'ระบบขายงานที่ปลอดภัย เพื่อรายได้ของศิลปินไทย' }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-3 text-white">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 4. Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="text-xl font-black italic mb-4">LINE<span className="text-indigo-600">SEN</span></div>
          <p className="text-slate-400 text-sm font-medium">© 2026 LineSen. All rights reserved. Created for Artists.</p>
        </div>
      </footer>
    </main>
  );
}