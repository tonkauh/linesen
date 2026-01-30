import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 opacity-50 -z-10"></div>
        <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6">
          Line<span className="brush-stroke text-brand">Sen</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          พื้นที่ปลอดภัยของศิลปินไทย ปกป้องทุกลายเส้นจากการถูกขโมยโดย AI 
          และแสดงผลงานคุณภาพสูงสุดแบบไม่บีบอัดไฟล์
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-brand text-white px-8 py-3 rounded-full font-semibold hover:bg-brand/90 transform hover:-translate-y-1 transition w-full sm:w-auto">
            เริ่มใช้งานฟรี
          </button>
          <button className="border-2 border-safety text-safety px-8 py-3 rounded-full font-semibold hover:bg-green-50 transform hover:-translate-y-1 transition w-full sm:w-auto">
            เรียนรู้ระบบป้องกัน AI
          </button>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="bg-white py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12">ทำไมต้อง LineSen?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-bold mb-2 text-slate-800">AI Protection</h3>
              <p className="text-sm text-slate-500">ใช้เทคโนโลยี Glaze ป้องกันการถูกดูดรูปไปเทรน</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-bold mb-2 text-slate-800">Ultra High-Res</h3>
              <p className="text-sm text-slate-500">ภาพคมชัดทุกลายเส้น ไม่โดนลดคุณภาพ</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold mb-2 text-slate-800">Safe Sale</h3>
              <p className="text-sm text-slate-500">ระบบขายงานและ Commission ที่ปลอดภัย</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2026 LineSen. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}