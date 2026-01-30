'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getArtworks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('id', { ascending: false });
        if (data) setArtworks(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    getArtworks();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-indigo-100">
      
      {/* Luxury Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif italic tracking-tighter hover:opacity-60 transition-all">
            LineSen
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/upload" className="group flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 group-hover:text-black transition">Upload</span>
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <span className="text-lg">+</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Brand Intro */}
      <section className="max-w-6xl mx-auto pt-32 pb-16 px-6 text-center">
        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-indigo-600 mb-4">The Safe Haven for Art</h2>
        <p className="text-3xl md:text-4xl font-light leading-tight max-w-2xl mx-auto text-gray-800">
          Protecting every stroke. <br/>
          <span className="font-serif italic text-gray-400">Pure artistry, zero AI intrusion.</span>
        </p>
      </section>

      {/* Luxury Grid Gallery */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-12">
            {artworks.map((art) => (
              <div key={art.id} className="group cursor-default">
                <div className="relative aspect-[4/5] bg-white overflow-hidden shadow-sm border border-gray-50 transition-all duration-700 group-hover:shadow-xl">
                  {art.image_url && (
                    <img 
                      src={art.image_url} 
                      alt={art.title} 
                      // SECURITY: ป้องกันการเซฟรูปเบื้องต้น
                      onContextMenu={(e) => e.preventDefault()}
                      draggable="false"
                      className="w-full h-full object-cover transition duration-1000 group-hover:scale-105 select-none" 
                    />
                  )}
                  
                  {/* Protection Tag Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur px-3 py-1 text-[8px] font-black tracking-widest uppercase border border-gray-100">
                      Shielded
                    </div>
                  </div>
                </div>
                <div className="mt-4 px-1">
                  <h3 className="text-sm font-bold tracking-wide uppercase">{art.title}</h3>
                  <p className="text-[10px] text-gray-400 font-medium tracking-widest mt-1 uppercase">@{art.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="py-20 text-center border-t border-gray-50">
        <p className="text-[10px] font-bold tracking-[0.5em] text-gray-300 uppercase">LineSen Online Art Gallery 2026</p>
      </footer>
    </main>
  );
}