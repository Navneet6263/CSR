'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const slides = Array.from({ length: 6 }, (_, index) => `/images/auth/indian-school-0${index + 1}.jpg`);

export default function AuthBackground() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 7000);
    return () => window.clearInterval(timer); }, []);
  return <div className="absolute inset-0 overflow-hidden bg-[#061b33]">
    {slides.map((src, index) => <Image key={src} src={src} alt="" fill sizes="100vw" priority={index === 0}
      className={`object-cover object-center transition-opacity duration-1000 ${index === active ? 'opacity-100' : 'opacity-0'}`} />)}
    <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(3,20,40,.96)_0%,rgba(4,47,59,.82)_43%,rgba(6,27,51,.38)_68%,rgba(6,27,51,.62)_100%)]" />
    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_right,black,transparent_65%)]" />
    <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
    <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">{slides.map((src, index) => <span key={src} className={`h-1 rounded-full transition-all ${index === active ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />)}</div>
  </div>;
}
