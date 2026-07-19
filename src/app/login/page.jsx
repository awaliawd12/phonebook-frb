'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'; // Tambahkan import onAuthStateChanged
import { Lock, Mail, ArrowRight, UserCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // MENCEGAH AKSES: Jika sudah login, lempar langsung ke admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err) {
      setError('Email atau password salah!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-100 max-w-sm w-full border border-blue-50">
        
        <div className="text-center mb-8">
          <div className="bg-blue-900 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <UserCircle2 className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-black text-blue-950">Admin Access</h2>
          <p className="text-blue-400 text-sm mt-1">Silakan masuk untuk melanjutkan</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-5 top-4.5 text-blue-300" size={18} />
            <input
              type="email"
              value={email || ""} // Tambahkan || "" untuk fix warning controlled component
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 p-4 border border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-blue-50/50"
              placeholder="Email admin"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-5 top-4.5 text-blue-300" size={18} />
            <input
              type="password"
              value={password || ""} // Tambahkan || "" untuk fix warning controlled component
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 p-4 border border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-blue-50/50"
              placeholder="Password"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group flex items-center justify-center gap-2 bg-blue-900 text-white font-bold py-4 rounded-2xl mt-2 hover:bg-blue-950 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-blue-200"
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <p className="text-center text-blue-300 text-[10px] mt-8 uppercase tracking-widest font-bold">
          Sistem Direktori VoIP
        </p>
      </div>
    </div>
  );
};

export default Login;