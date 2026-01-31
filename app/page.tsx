'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Heart, Share2, MessageCircle, PlusSquare, Home, Search, User, Compass, Bell, MoreHorizontal } from "lucide-react";

export default function SocialFeed() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<number[]>([]); // เก็บ ID ของโพสต์ที่กด Like แล้ว

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

  // --- ฟังก์ชันกด Like ---
  const handleLike = async (id: number, currentLikes: number) => {
    // ถ้าเคย Like แล้ว ให้กดซ้ำไม่ได้ (ในขั้นต้น)
    if (likedPosts.includes(id)) return;

    try {
      // 1. Update ใน UI ทันที (Optimistic Update) เพื่อความเร็ว
      setArtworks(artworks.map(art => 
        art.id === id ? { ...art, likes_count: (art.likes_count || 0) + 1 } : art
      ));
      setLikedPosts([...likedPosts, id]);

      // 2. Update ใน Database
      const { error } = await supabase
        .from('artworks')
        .update({ likes_count: (currentLikes || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-white flex text-black">
      {/* Sidebar (เหมือนเดิม) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 p-8 space-y-8 bg-white z-50">
        <h1 className="text-3xl font-serif italic tracking-tighter mb-10">LineSen</h1>
        <nav className="flex flex-col space-y-6">
            <Link href="/" className="flex items-center gap-4 font-bold text-sm"><Home className="w-5 h-5" /> Home</Link>
            <Link href="/upload" className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all"><PlusSquare className="w-5 h-5" /> Create</Link>
        </nav>
      </aside>

      <section className="flex-1 overflow-y-auto bg-white">
        {/* Mobile Nav (เหมือนเดิม) */}
        <nav className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex justify-between items-center text-black">
          <h1 className="text-2xl font-serif italic tracking-tighter">LineSen</h1>
          <Link href="/upload"><PlusSquare className="w-6 h-6" /></Link>
        </nav>

        <div className="max-w-6xl mx-auto p-4 md:p-10">
          {loading ? (
            <div className="p-20 text-center font-serif italic text-gray-400">Loading...</div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {artworks.map((art) => (
                <article key={art.id} className="break-inside-avoid group relative border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                  
                  {/* Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${art.artist}`} alt="avatar" />
                      </div>
                      <span className="text-[12px] font-bold">{art.artist || 'Anonymous'}</span>
                    </div>
                  </div>

                  {/* Image Area */}
                  <div className="relative overflow-hidden cursor-pointer">
                    <img src={art.image_url} className="w-full h-auto" alt={art.title} />
                  </div>

                  {/* Interaction Bar */}
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-5 items-center">
                        <Heart 
                          onClick={() => handleLike(art.id, art.likes_count)}
                          className={`w-6 h-6 cursor-pointer transition-all ${
                            likedPosts.includes(art.id) 
                            ? "fill-red-500 text-red-500 scale-125" 
                            : "text-black hover:text-red-500"
                          }`} 
                        />
                        <MessageCircle className="w-6 h-6" />
                        <Share2 className="w-6 h-6" />
                      </div>
                    </div>
                    
                    {/* Like Counter */}
                    <p className="text-[11px] font-bold mb-2">
                        {art.likes_count || 0} likes
                    </p>

                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold uppercase tracking-wide">{art.title}</h3>
                      <p className="text-[11px] text-gray-400 font-serif italic">Verified Artwork</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mobile Bottom Nav (เหมือนเดิม) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 h-16 flex justify-around items-center z-50 text-black">
        <Home className="w-6 h-6" />
        <Link href="/upload" className="bg-black p-2 rounded-lg text-white"><PlusSquare className="w-6 h-6" /></Link>
        <User className="w-6 h-6" />
      </nav>
    </main>
  );
}