'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  '/images/auth/slide1.png',
  '/images/auth/slide2.png',
  '/images/auth/slide3.png',
  '/images/auth/slide4.png',
  '/images/auth/slide5.png'
];

export default function AuthBackground() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background Slideshow */}
      {slides.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: currentSlide === idx ? 1 : 0 }}
        >
          <Image
            src={src}
            alt="Students"
            fill
            sizes="100vw"
            className="object-cover"
            priority={idx === 0}
          />
        </div>
      ))}

      {/* Overlays - Kept very subtle so images pop clearly */}
      <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply z-0" />
      
      {/* Soft dark gradient from left to ensure light text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-emerald-950/50 to-transparent z-0 pointer-events-none" />
    </>
  );
}
