import AnimatedBackground from '@/components/shared/AnimatedBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <main className="relative z-10 w-full flex items-center justify-center py-12 px-4">
        {children}
      </main>
    </div>
  );
}
