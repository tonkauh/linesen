'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Heart, Share2, MessageCircle, PlusSquare, Home, Search, User, Compass, Bell } from "lucide-react";

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
    <main className="min-h-screen bg-white flex">
      {/* --- SIDEBAR (PC เท่านั้น) --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 p-8 space-y-8">
        <h1 className="text-3xl font-serif italic tracking-tighter mb-10">LineSen</h1>
        <nav className="flex flex-col space-y-6">
          <Link href="/" className="flex items-center gap-4 font-bold text-sm"><Home className="w-5 h-5" /> Home</Link>
          <button className="flex items-center gap-4 text-gray-400 text-sm hover:text-black transition-all"><Search className="w-5 h-5" /> Search</button>
          <button className="flex items-center gap-4 text-gray-400 text-sm hover:text-black transition-all"><Compass className="w-5 h-5" /> Explore</button>
          <button className="flex items-center gap-4 text-gray-400 text-sm hover:text-black transition-all"><Bell className="w-5 h-5" /> Notifications</button>
          <Link href="/upload" className="flex items-center gap-4 text-gray-400 text-sm hover:text-black transition-all"><PlusSquare className="w-5 h-5" /> Create</Link>
          <button className="flex items-center gap-4 text-gray-400 text-sm hover:text-black transition-all"><User className="w-5 h-5" /> Profile</button>
        </nav>
      </aside>

      {/* --- CONTENT AREA --- */}
      <section className="flex-1 overflow-y-auto">
        {/* Top Header (Mobile Only) */}
        <nav className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif italic tracking-tighter">LineSen</h1>
          <Link href="/upload"><PlusSquare className="w-6 h-6 stroke-[1.2]" /></Link>
        </nav>

        {/* Main Feed Container */}
        <div className="max-w-5xl mx-auto p-4 md:p-10">
          {loading ? (
            <div className="p-20 text-center font-serif italic text-gray-300">Curating for you...</div>
          ) : (
            /* --- GRID SYSTEM: 1 Col (Mobile), 2-3 Col (Tablet/PC) --- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
              {artworks.map((art) => (
                <article key={art.id} className="group border border-gray-50 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Artist Header */}
                  <div className="p-4 flex items-center gap-3 border-b border-gray-50">
                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-100 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${art.artist}`} alt="avatar" />
                    </div>
                    <span className="text-[11px] font-bold tracking-tight">{art.artist || 'Anonymous'}</span>
                  </div>

                  {/* Image (ปรับสัดส่วนให้คงที่บน PC) */}
                  <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                    <img 
                      src={art.image_url} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      alt={art.title}
                      draggable="false"
                    />
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 text-[8px] font-bold uppercase tracking-widest border border-gray-100">
                      Shielded
                    </div>
                  </div>

                  {/* Interaction Bar */}
                  <div className="p-5">
                    <div className="flex gap-5 mb-4">
                      <Heart className="w-5 h-5 stroke-[1.5] hover:text-red-500 cursor-pointer transition-colors" />
                      <MessageCircle className="w-5 h-5 stroke-[1.5] cursor-pointer" />
                      <Share2 className="w-5 h-5 stroke-[1.5] cursor-pointer" />
                    </div>
                    <h3 className="text-[12px] font-bold uppercase tracking-wider">{art.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-serif italic">Created by the master of LineSen.</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- BOTTOM NAV (Mobile Only) --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 h-16 flex justify-around items-center z-50">
        <Home className="w-6 h-6 stroke-[1.5]" />
        <Link href="/upload"><PlusSquare className="w-7 h-7 text-black stroke-[1.2]" /></Link>
        <User className="w-6 h-6 text-gray-300 stroke-[1.5]" />
      </nav>
    </main>
  );
}