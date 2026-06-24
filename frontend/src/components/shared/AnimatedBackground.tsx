const blobs = [
  {
    size: 'w-72 h-72',
    gradient: 'bg-gradient-to-br from-[#e8d5f5] to-[#d4b8e8]',
    position: 'top-[8%] left-[10%]',
    animation: 'animate-float-1',
  },
  {
    size: 'w-96 h-96',
    gradient: 'bg-gradient-to-br from-[#c5dff8] to-[#a8c8e8]',
    position: 'top-[45%] right-[5%]',
    animation: 'animate-float-2',
  },
  {
    size: 'w-64 h-64',
    gradient: 'bg-gradient-to-br from-[#d5f5e3] to-[#a9dfbf]',
    position: 'bottom-[12%] left-[25%]',
    animation: 'animate-float-3',
  },
  {
    size: 'w-48 h-48',
    gradient: 'bg-gradient-to-br from-[#fdebd0] to-[#f5cba7]',
    position: 'top-[25%] right-[30%]',
    animation: 'animate-float-4',
  },
  {
    size: 'w-80 h-80',
    gradient: 'bg-gradient-to-br from-[#ebdef0] to-[#d2b4de]',
    position: 'bottom-[5%] right-[15%]',
    animation: 'animate-float-5',
  },
  {
    size: 'w-40 h-40',
    gradient: 'bg-gradient-to-br from-[#d6eaf8] to-[#aed6f1]',
    position: 'top-[5%] right-[8%]',
    animation: 'animate-float-6',
  },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5]">
      {/* Soft clay blobs */}
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl opacity-40 ${blob.size} ${blob.gradient} ${blob.position} ${blob.animation}`}
        />
      ))}

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #5b2c6f 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#e8d5f5] to-transparent opacity-30 rounded-full blur-[100px]" />
    </div>
  );
}
