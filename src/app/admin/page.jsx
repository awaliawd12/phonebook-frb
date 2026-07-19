'use client'; 

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, doc, query, orderBy, writeBatch, deleteDoc, updateDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Tambahkan onAuthStateChanged
import { useRouter } from 'next/navigation';
import { LayoutDashboard, List, LogOut, Building2, Trash2, Edit, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [rows, setRows] = useState([{ telepon: '', ruangan: '' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [currentContact, setCurrentContact] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const itemsPerPage = 10;
  const router = useRouter();

  // PROTEKSI: Cek status login saat komponen dimuat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/'); // Arahkan ke halaman login (root) jika belum login
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch data dari Firestore
  useEffect(() => {
    const q = query(collection(db, "directory"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const addRow = () => setRows([...rows, { telepon: '', ruangan: '' }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleBatchAdd = async (e) => {
    e.preventDefault();
    const batch = writeBatch(db);
    try {
      rows.forEach(row => {
        if (row.ruangan && row.telepon) {
          const docRef = doc(collection(db, "directory"));
          batch.set(docRef, { ...row, createdAt: new Date() });
        }
      });
      await batch.commit();
      setRows([{ ruangan: '', telepon: '' }]);
      showNotification('Data berhasil disimpan!', 'success');
    } catch (error) {
      showNotification('Gagal menyimpan data.', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "directory", currentContact.id), currentContact);
      setIsEditModalOpen(false);
      showNotification('Data berhasil diupdate!', 'success');
    } catch (error) {
      showNotification('Gagal update.', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "directory", deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
      showNotification('Data berhasil dihapus!', 'success');
    } catch (error) {
      showNotification('Gagal menghapus.', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const filteredContacts = contacts.filter(c => 
    c.ruangan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telepon?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-blue-50 font-sans">
      {message.text && (
        <div className={`fixed top-5 right-5 p-4 rounded-2xl text-white font-bold shadow-lg z-[80] ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.text}
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-blue-950 text-blue-200 w-64 flex flex-col py-8 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}>
        <div className="px-8 mb-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-3"><Building2 size={24} /> <span className="font-bold text-xl">Admin</span></div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={24}/></button>
        </div>
        <button onClick={() => {setActiveTab('dashboard'); setIsSidebarOpen(false)}} className={`px-8 py-4 flex items-center gap-4 font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-900 text-white border-l-4 border-blue-400' : 'hover:bg-blue-900/50'}`}><LayoutDashboard size={20} /> Input Data</button>
        <button onClick={() => {setActiveTab('semua'); setIsSidebarOpen(false)}} className={`px-8 py-4 flex items-center gap-4 font-bold transition-all ${activeTab === 'semua' ? 'bg-blue-900 text-white border-l-4 border-blue-400' : 'hover:bg-blue-900/50'}`}><List size={20} /> Daftar Kontak</button>
        <button onClick={handleLogout} className="mt-auto px-8 py-4 flex items-center gap-4 font-bold text-blue-300 hover:text-white transition-all"><LogOut size={20} /> Logout</button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mb-4 p-2 bg-white rounded-xl shadow"><Menu size={24} /></button>

        {activeTab === 'dashboard' ? (
            <div className="space-y-8">
                <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-lg shadow-blue-200">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Kontak</p>
                    <h1 className="text-5xl font-black">{contacts.length}</h1>
                </div>
                <form onSubmit={handleBatchAdd} className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-50">
                    <h2 className="font-bold text-lg mb-6 text-blue-950">Input Data Baru</h2>
                    {rows.map((row, index) => (
                        <div key={index} className="flex gap-2 mb-3">
                            <input placeholder="Ruangan" className="flex-1 p-3 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200" value={row.ruangan} onChange={(e) => updateRow(index, 'ruangan', e.target.value)} required />
                            <input placeholder="Nomor" className="flex-1 p-3 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200" value={row.telepon} onChange={(e) => updateRow(index, 'telepon', e.target.value)} />
                            {index > 0 && <button type="button" onClick={() => removeRow(index)} className="p-3 text-blue-300 hover:text-red-500"><X size={16}/></button>}
                        </div>
                    ))}
                    <div className="flex gap-2 mt-6">
                        <button type="button" onClick={addRow} className="text-sm font-bold text-blue-500 hover:text-blue-700 transition-all">+ Tambah Baris</button>
                        <button type="submit" className="ml-auto bg-blue-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-950 transition-all">Simpan Data</button>
                    </div>
                </form>
            </div>
        ) : (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg text-blue-950">Daftar Semua Kontak</h2>
                    <input placeholder="Cari..." className="p-3 bg-blue-50 border-0 rounded-2xl w-64 focus:ring-2 focus:ring-blue-200 outline-none" onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-blue-400 text-[10px] uppercase tracking-widest border-b border-blue-50">
                                <th className="p-4 font-bold">Ruangan</th>
                                <th className="p-4 font-bold text-right">Nomor</th>
                                <th className="p-4 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedContacts.map((c) => (
                                <tr key={c.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4 font-bold text-blue-950">{c.ruangan}</td>
                                    <td className="p-4 text-right font-mono text-blue-700">{c.telepon}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => { setCurrentContact(c); setIsEditModalOpen(true); }} className="text-blue-200 hover:text-blue-600 transition-all"><Edit size={16} /></button>
                                            <button onClick={() => setDeleteModal({ isOpen: true, id: c.id })} className="text-blue-200 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"><ChevronLeft size={20}/></button>
                    <span className="font-bold text-blue-950">Hal {currentPage} / {totalPages}</span>
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"><ChevronRight size={20}/></button>
                </div>
            </div>
        )}

        {isEditModalOpen && currentContact && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
                <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2rem] max-w-sm w-full flex flex-col gap-4 shadow-2xl">
                    <h2 className="font-bold text-lg text-blue-950">Edit Data</h2>
                    <input className="p-4 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200" value={currentContact.ruangan} onChange={(e) => setCurrentContact({...currentContact, ruangan: e.target.value})} placeholder="Ruangan" />
                    <input className="p-4 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200" value={currentContact.telepon} onChange={(e) => setCurrentContact({...currentContact, telepon: e.target.value})} placeholder="Nomor" />
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold">Batal</button>
                        <button type="submit" className="flex-1 p-4 bg-blue-900 text-white rounded-2xl font-bold">Update</button>
                    </div>
                </form>
            </div>
        )}

        {deleteModal.isOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
                <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl">
                    <h2 className="font-bold text-lg mb-4 text-blue-950">Hapus Kontak?</h2>
                    <p className="text-blue-500 mb-6 text-sm">Data akan dihapus permanen.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="flex-1 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold">Batal</button>
                        <button onClick={confirmDelete} className="flex-1 p-4 bg-red-500 text-white rounded-2xl font-bold">Hapus</button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;