'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Search, Building2, ChevronLeft, ChevronRight, Phone } from 'lucide-react';

const UserView = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Menentukan jumlah item per halaman

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Selamat Pagi";
    if (hour >= 12 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "directory"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (a.ruangan || '').localeCompare(b.ruangan || ''));
      setContacts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Reset ke halaman 1 setiap kali ada pencarian baru
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredContacts = contacts.filter(c =>
    c.ruangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telepon?.includes(searchTerm)
  );

  // Logika Paginasi
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const currentItems = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Elegan dengan Sapaan */}
        <header className="bg-blue-900 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-200 mb-8 flex items-center gap-4">
          <div className="bg-white/10 p-4 rounded-2xl">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">{getGreeting()}, Rekan!</h1>
            <p className="text-blue-200 text-sm">Cari dan hubungi ruangan kantor yang Anda tuju.</p>
          </div>
        </header>

        {/* Search Bar Modern */}
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama ruangan..."
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-0 shadow-lg shadow-blue-100 focus:ring-4 focus:ring-blue-200 outline-none transition-all bg-white text-blue-950 placeholder:text-blue-300"
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List Kontak */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center py-10 text-blue-400 font-medium">Sedang memuat data...</p>
          ) : currentItems.length > 0 ? (
            currentItems.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all">
                <h3 className="font-bold text-blue-950 text-lg">{c.ruangan}</h3>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl font-black cursor-default">
                  <Phone size={16} /> {c.telepon}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-blue-300 font-medium">Kontak tidak ditemukan.</p>
          )}
        </div>

        {/* Paginasi Minimalis */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-3 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-blue-900">Hal {currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-3 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;