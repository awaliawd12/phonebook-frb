'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';

const WelcomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/directory');
    }, 1000); // Durasi 3 detik
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 text-blue-900 font-sans">
      <div className="text-center">
        
        {/* Animasi Telepon Berdering */}
        <div className="relative mb-12 flex items-center justify-center">
          {/* Gelombang luar */}
          <div className="absolute w-32 h-32 bg-blue-400 rounded-full animate-ping opacity-30"></div>
          {/* Gelombang dalam */}
          <div className="absolute w-24 h-24 bg-blue-500 rounded-full animate-ping opacity-50 delay-75"></div>
          {/* Ikon Utama */}
          <div className="relative bg-white p-8 rounded-full shadow-xl animate-bounce">
            <Phone size={48} className="text-blue-600" />
          </div>
        </div>
        
        {/* Teks Sambutan */}
        <h1 className="text-4xl font-black mb-3 text-blue-950 tracking-tight">Phonebook</h1>
        <p className="text-blue-600 font-medium text-lg">Menghubungkan ke Direktori Internal...</p>
        
        {/* Loading Bar yang elegan */}
        <div className="mt-12 w-56 h-1.5 bg-blue-100 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-blue-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;