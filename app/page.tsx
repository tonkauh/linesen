'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Heart, Share2, MessageCircle, PlusSquare, Home, Search, User, Compass, Bell, MoreHorizontal } from "lucide-react";

export default function SocialFeed() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getArtworks() {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('id', { ascending: false });
        if (error) throw error;
        if (data) setArtworks(data);
      } catch (err) {
        console.error("Error fetching art:", err);
      } finally {
        setLoading(false);
      }
    }
    getArtworks();
  }, []);

  return (
    <main className="min-h-screen bg-white flex text-black">
      {/* --- 1. SIDEBAR (แสดงเฉพาะบน PC/Tablet) --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 p-8 space-y-8 bg-white z-50">
        <h1 className="text-3xl font-serif italic tracking-tighter mb-10 text-black">LineSen</h1>
        <nav className="flex flex-col space-y-6">
          <Link href="/" className="flex items-center gap-4 font-bold text-sm text-black hover:opacity-60 transition-all">
            <Home className="w-5 h-5 text-black" /> Home
          </Link>
          <button className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all">
            <Search className="w-5 h-5" /> Search
          </button>
          <button className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all">
            <Compass className="w-5 h-5" /> Explore
          </button>
          <button className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all">
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <Link href="/upload" className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all">
            <PlusSquare className="w-5 h-5" /> Create
          </Link>
          <button className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all">
            <User className="w-5 h-5" /> Profile
          </button>
        </nav>
      </aside>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <section className="flex-1 overflow-y-auto bg-white">
        
        {/* Top Header (แสดงเฉพาะบน Mobile) */}
        <nav className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif italic tracking-tighter text-black">LineSen</h1>
          <div className="flex gap-4 items-center">
            <Link href="/upload"><PlusSquare className="w-6 h-6 text-black" /></Link>
            <Bell className="w-6 h-6 text-black" />
          </div>
        </nav>

        {/* --- ART FEED GRID --- */}
        <div className="max-w-6xl mx-auto p-4 md:p-10">
          {loading ? (
            <div className="p-20 text-center font-serif italic text-gray-400 animate-pulse">
              Curating your private archive...
            </div>
          ) : (
            /* Masonry Layout: 1 col on mobile, 2 on tablet, 3 on PC */
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {artworks.map((art) => (
                <article 
                  key={art.id} 
                  className="break-inside-avoid group relative border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${art.artist}`} alt="avatar" />
                      </div>
                      <span className="text-[12px] font-bold tracking-tight text-black">{art.artist || 'Anonymous'}</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Image with Protection Overlay */}
                  <div className="relative overflow-hidden cursor-zoom-in" onContextMenu={(e) => e.preventDefault()}>
                    <img 
                      src={art.image_url} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={art.title}
                      draggable="false"
                    />
                    {/* PC Hover Details */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-end p-6">
                      <p className="text-white/80 text-[10px] tracking-[0.2em] uppercase mb-1">Artist Spotlight</p>
                      <h3 className="text-white font-serif italic text-xl leading-none">{art.title}</h3>
                    </div>
                    {/* Shield Label */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 text-[8px] font-black text-white uppercase tracking-widest rounded-sm border border-white/20">
                      Shielded
                    </div>
                  </div>

                  {/* Interaction & Caption */}
                  <div className="p-5 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-5">
                        <Heart className="w-5 h-5 text-black hover:fill-red-500 hover:text-red-500 transition-colors cursor-pointer" />
                        <MessageCircle className="w-5 h-5 text-black cursor-pointer hover:opacity-50" />
                        <Share2 className="w-5 h-5 text-black cursor-pointer hover:opacity-50" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-black uppercase tracking-wide">{art.title}</h3>
                      <p className="text-[11px] text-gray-500 font-serif italic leading-relaxed">
                        A unique masterpiece archived and protected on LineSen Vault.
                      </p>
                      <div className="pt-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Ownership Verified</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- 3. BOTTOM NAVIGATION (แสดงเฉพาะบน Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 h-16 flex justify-around items-center z-50">
        <Home className="w-6 h-6 text-black" />
        <Search className="w-6 h-6 text-gray-300" />
        <Link href="/upload" className="bg-black p-2 rounded-lg">
          <PlusSquare className="w-6 h-6 text-white" />
        </Link>
        <Bell className="w-6 h-6 text-gray-300" />
        <User className="w-6 h-6 text-gray-300" />
      </nav>
    </main>
  );
}