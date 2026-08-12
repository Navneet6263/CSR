import AuthBackground from '@/components/auth/AuthBackground';
import AuthImpactStats from '@/components/auth/AuthImpactStats';

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

          <AuthImpactStats />
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
