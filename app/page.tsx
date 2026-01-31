'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Heart, Share2, MessageCircle, PlusSquare, Home, Search, User, Compass, Bell, MoreHorizontal, LogOut } from "lucide-react";

export default function SocialFeed() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<number[]>([]); // เก็บเฉพาะ ID ที่ user คนนี้กด Like จริงๆ จาก DB
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      // 1. เช็กสถานะ User
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. ดึงข้อมูลงานศิลปะ
      const { data: arts, error } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: false });
      
      if (arts) setArtworks(arts);

      // 3. ถ้า Login อยู่ ให้ดึงรายการที่เคย Like ไว้จากตาราง likes
      if (user) {
        const { data: myLikes } = await supabase
          .from('likes')
          .select('artwork_id')
          .eq('user_id', user.id);
        
        if (myLikes) {
          setLikedPosts(myLikes.map(l => l.artwork_id));
        }
      }
      setLoading(false);
    }

    fetchData();

    // ติดตามการเปลี่ยนแปลง Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setLikedPosts([]); // ถ้า logout ให้ล้างหัวใจแดงออก
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLike = async (id: number, currentLikes: number) => {
    // --- 1. เช็กก่อนว่า Login หรือยัง ---
    if (!user) {
      alert("Please Sign In to like artworks.");
      return;
    }

    const isLiked = likedPosts.includes(id);
    const newLikesCount = isLiked 
      ? Math.max(0, (currentLikes || 0) - 1) 
      : (currentLikes || 0) + 1;

    // --- 2. Update UI ทันที (Optimistic) ---
    setArtworks(artworks.map(art => 
      art.id === id ? { ...art, likes_count: newLikesCount } : art
    ));

    if (isLiked) {
      setLikedPosts(likedPosts.filter(postId => postId !== id));
    } else {
      setLikedPosts([...likedPosts, id]);
    }

    // --- 3. Update Database (ตาราง likes และ artworks) ---
    try {
      if (isLiked) {
        // ลบแถวในตาราง likes
        await supabase.from('likes').delete().eq('user_id', user.id).eq('artwork_id', id);
      } else {
        // เพิ่มแถวในตาราง likes (จำว่า user คนนี้ like แล้ว)
        await supabase.from('likes').insert([{ user_id: user.id, artwork_id: id }]);
      }

      // อัปเดตตัวเลขรวมในตาราง artworks
      await supabase.from('artworks').update({ likes_count: newLikesCount }).eq('id', id);
    } catch (err) {
      console.error("Failed to update like status:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    alert("Signed out successfully");
  };

  return (
    <main className="min-h-screen bg-white flex text-black">
      {/* --- 1. SIDEBAR --- */}
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
          
          {user ? (
            <button onClick={handleSignOut} className="flex items-center gap-4 text-red-400 text-sm hover:text-red-600 transition-all pt-10">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-4 text-gray-500 text-sm hover:text-black transition-all pt-10">
              <User className="w-5 h-5" /> Sign In
            </Link>
          )}
        </nav>
      </aside>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <section className="flex-1 overflow-y-auto bg-white">
        <nav className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex justify-between items-center text-black">
          <h1 className="text-2xl font-serif italic tracking-tighter">LineSen</h1>
          <div className="flex gap-4 items-center">
            <Link href="/upload"><PlusSquare className="w-6 h-6 text-black" /></Link>
            {user ? (
                <button onClick={handleSignOut}><LogOut className="w-5 h-5 text-red-400" /></button>
            ) : (
                <Link href="/login"><User className="w-6 h-6 text-black" /></Link>
            )}
          </div>
        </nav>

        <div className="max-w-6xl mx-auto p-4 md:p-10">
          {loading ? (
            <div className="p-20 text-center font-serif italic text-gray-400 animate-pulse">
              Curating your private archive...
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {artworks.map((art) => (
                <article key={art.id} className="break-inside-avoid group relative border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${art.artist}`} alt="avatar" />
                      </div>
                      <span className="text-[12px] font-bold tracking-tight text-black">{art.artist || 'Anonymous'}</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="relative overflow-hidden cursor-zoom-in" onContextMenu={(e) => e.preventDefault()}>
                    <img src={art.image_url} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" alt={art.title} draggable="false" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 text-[8px] font-black text-white uppercase tracking-widest rounded-sm border border-white/20">Shielded</div>
                  </div>

                  <div className="p-5 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-5">
                        <Heart 
                          onClick={() => handleLike(art.id, art.likes_count)}
                          className={`w-5 h-5 cursor-pointer transition-all duration-300 ${
                            likedPosts.includes(art.id) 
                            ? "fill-red-500 text-red-500 scale-125" 
                            : "text-black hover:text-red-500 scale-100"
                          }`} 
                        />
                        <MessageCircle className="w-5 h-5 text-black cursor-pointer hover:opacity-50" />
                        <Share2 className="w-5 h-5 text-black cursor-pointer hover:opacity-50" />
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-black mb-3">{art.likes_count || 0} likes</p>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-black uppercase tracking-wide">{art.title}</h3>
                      <p className="text-[11px] text-gray-500 font-serif italic leading-relaxed">LineSen Protected Piece.</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- 3. BOTTOM NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 h-16 flex justify-around items-center z-50 text-black">
        <Home className="w-6 h-6 text-black" />
        <Search className="w-6 h-6 text-gray-300" />
        <Link href="/upload" className="bg-black p-2 rounded-lg text-white"><PlusSquare className="w-6 h-6" /></Link>
        <Bell className="w-6 h-6 text-gray-300" />
        {user ? (
            <button onClick={handleSignOut}><LogOut className="w-6 h-6 text-red-400" /></button>
        ) : (
            <Link href="/login"><User className="w-6 h-6 text-gray-300" /></Link>
        )}
      </nav>
    </main>
  );
}