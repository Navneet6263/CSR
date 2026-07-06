import AuthBackground from '@/components/auth/AuthBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Full Screen Dynamic Slideshow Background */}
      <div className="absolute inset-0 z-0">
        <AuthBackground />
      </div>

      {/* Content Wrapper - Zoomed out slightly to look elegant */}
      <div className="relative z-10 flex w-full max-w-7xl h-full items-center justify-center lg:justify-between gap-12 lg:gap-24 scale-[0.95] xl:scale-90 origin-center transition-transform">

        {/* Left Side: Hero Text & Stats in a Glass Panel */}
        <div className="hidden lg:flex w-[50%] flex-col justify-center gap-10">
          
          {/* Text Content - No Box, Floating Freely */}
          <div className="px-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">TalentBridge</h1>
                <p className="text-[0.7rem] text-emerald-200 tracking-widest uppercase font-bold drop-shadow-md">Scholarship Platform</p>
              </div>
            </div>

            <div>
              <h3 className="text-emerald-300 font-black text-sm tracking-widest uppercase mb-4 drop-shadow-md">Empowering Futures</h3>
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.2] mb-6 drop-shadow-lg capitalize">
                Every student deserves a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">fair chance</span>
              </h2>
              <p className="text-emerald-50/90 text-lg leading-relaxed max-w-md font-semibold drop-shadow-md">
                Connect with CSR scholarships, track applications, and get funded — all in one seamless place.
              </p>
            </div>
          </div>

          {/* Stats Grid - Made lighter so they don't block the image */}
          <div className="grid grid-cols-2 gap-4 px-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
              <p className="text-3xl font-bold text-white mb-1 drop-shadow-sm">12,400+</p>
              <p className="text-sm font-semibold text-emerald-100 drop-shadow-sm">Students funded</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
              <p className="text-3xl font-bold text-white mb-1 drop-shadow-sm">₹48Cr</p>
              <p className="text-sm font-semibold text-emerald-100 drop-shadow-sm">Disbursed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
              <p className="text-3xl font-bold text-white mb-1 drop-shadow-sm">96%</p>
              <p className="text-sm font-semibold text-emerald-100 drop-shadow-sm">Approval rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
              <p className="text-3xl font-bold text-white mb-1 drop-shadow-sm">3 days</p>
              <p className="text-sm font-semibold text-emerald-100 drop-shadow-sm">Avg. review time</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-[45%] flex items-center justify-center py-8">
          <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/60">
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}
