export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      
      {/* Left Side: Soft Glass Blue Glowing Panel */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-slate-900">
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#2e86c1]/40 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#5b2c6f]/40 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-[#00d2ff]/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Glass Overlay to soften the colors */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] z-0" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-[#2e86c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">TalentBridge</h1>
            <p className="text-[0.65rem] text-blue-200 tracking-widest uppercase font-semibold">Scholarship Platform</p>
          </div>
        </div>

        <div className="relative z-10 mt-auto mb-20">
          <h3 className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-4">Empowering Futures</h3>
          <h2 className="text-5xl font-bold text-white leading-[1.1] mb-6">
            Every student deserves a <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">fair chance</span>
          </h2>
          <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm font-light">
            Connect with CSR scholarships, track applications, and get funded — all in one seamless place.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold text-white mb-1">12,400+</p>
            <p className="text-xs text-blue-200">Students funded</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold text-white mb-1">₹48Cr</p>
            <p className="text-xs text-blue-200">Disbursed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold text-white mb-1">96%</p>
            <p className="text-xs text-blue-200">Approval rate</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold text-white mb-1">3 days</p>
            <p className="text-xs text-blue-200">Avg. review time</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>

    </div>
  );
}
