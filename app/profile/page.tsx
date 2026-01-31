'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Grid, Heart, Settings, LogOut, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null); // เก็บข้อมูลจากตาราง profiles
  const [myArtworks, setMyArtworks] = useState<any[]>([]);
  const [likedArtworks, setLikedArtworks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getProfileData() {
      // 1. เช็กสถานะ User ปัจจุบัน
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      // 2. ดึงข้อมูล Profile (Username/Bio) จากตาราง profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 3. ดึงงานที่ตรงกับ user_id ของคนล็อกอิน
      const { data: posts } = await supabase
        .from('artworks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('id', { ascending: false });
      
      // 4. ดึงงานที่เคยกด Like
      const { data: likes } = await supabase
        .from('likes')
        .select('artwork_id, artworks(*)')
        .eq('user_id', currentUser.id);

      setMyArtworks(posts || []);
      setLikedArtworks(likes?.map(l => l.artworks).filter(Boolean) || []);
      setLoading(false);
    }
    getProfileData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-serif italic text-gray-400 uppercase tracking-widest">Accessing Archive...</div>;

  return (
    <main className="min-h-screen bg-white text-black pb-20">
      {/* --- Navigation Bar --- */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-50 transition-all">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Back</span>
        </Link>
        <h2 className="text-[12px] font-bold uppercase tracking-[0.2em]">
          @{profile?.username || user?.email?.split('@')[0]}
        </h2>
        <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-10">
        {/* --- Profile Header Section --- */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          {/* Avatar Area */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-gray-100 p-1 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || user?.email}`} 
              className="w-full h-full rounded-full object-cover" 
              alt="avatar" 
            />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <h1 className="text-3xl font-serif italic tracking-tight">
                {profile?.username || user?.email?.split('@')[0]}
              </h1>
              <Link 
                href="/profile/edit" 
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full hover:opacity-70 transition-all shadow-lg shadow-black/10"
              >
                <Edit3 className="w-3 h-3" /> Edit Profile
              </Link>
            </div>
            
            {/* Stats Display */}
            <div className="flex justify-center md:justify-start gap-10 text-sm py-2">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-lg leading-none">{myArtworks.length}</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Entries</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-lg leading-none">{likedArtworks.length}</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Curated</span>
              </div>
            </div>

            {/* Bio Section */}
            <div className="max-w-md pt-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Vault Status: Active</p>
              <p className="text-xs text-gray-500 font-serif italic leading-relaxed">
                {profile?.bio || "The archivist has not provided a biography yet."}
              </p>
            </div>
          </div>
        </section>

        {/* --- Tab Navigation --- */}
        <div className="flex border-t border-gray-100 justify-center gap-16">
          <button 
            onClick={() => setActiveTab('posts')} 
            className={`py-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-t-2 -mt-[2px] ${activeTab === 'posts' ? 'border-black text-black' : 'border-transparent text-gray-300'}`}
          >
            <Grid className="w-4 h-4" /> My Archive
          </button>
          <button 
            onClick={() => setActiveTab('likes')} 
            className={`py-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-t-2 -mt-[2px] ${activeTab === 'likes' ? 'border-black text-black' : 'border-transparent text-gray-300'}`}
          >
            <Heart className="w-4 h-4" /> Collection
          </button>
        </div>

        {/* --- Image Grid --- */}
        <div className="grid grid-cols-3 gap-1 md:gap-4 pt-4 pb-20">
          {(activeTab === 'posts' ? myArtworks : likedArtworks).map((art) => (
            <div key={art.id} className="aspect-square relative group overflow-hidden bg-gray-50 border border-gray-50">
              <img 
                src={art.image_url} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={art.title} 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 text-white">
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <Heart className="w-4 h-4 fill-white" /> {art.likes_count || 0}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Archive State */}
        {(activeTab === 'posts' ? myArtworks : likedArtworks).length === 0 && (
          <div className="py-32 text-center">
            <p className="text-[11px] font-serif italic text-gray-300 uppercase tracking-widest">
              No fragments discovered in this collection.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}