interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative max-w-md w-full mx-4">
      {/* Claymorphism card */}
      <div
        className={
          'relative bg-white/70 backdrop-blur-sm ' +
          'rounded-3xl p-8 ' +
          'shadow-[8px_8px_20px_rgba(0,0,0,0.08),-8px_-8px_20px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.04)] ' +
          'border border-white/60 ' +
          'animate-card-entrance'
        }
      >
        {children}
      </div>
    </div>
  );
}
