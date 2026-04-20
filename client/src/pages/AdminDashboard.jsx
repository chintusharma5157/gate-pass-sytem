import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Trash2, Edit, X, Save, ShieldAlert, Clock, AlertOctagon } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('host'); 
  
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', role: '' });

  const navigate = useNavigate();

  // FIX: Infinite Loop Fix. Data sirf component mount par ek baar read hoga.
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]); // <- Yahan se currentUser hata diya, ab loop nahi banega!

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('${API_URL}/api/auth/users');
      setUsersList(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_URL}/api/auth/users/${id}`);
        setUsersList(usersList.filter(u => u._id !== id));
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, phone: user.phone, email: user.email, role: user.role });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${API_URL}/api/auth/users/${editingUser._id}`, editForm);
      setUsersList(usersList.map(u => (u._id === editingUser._id ? data.user : u)));
      setEditingUser(null);
    } catch (error) {
      alert("Failed to update user");
    }
  };

  // --- 🔥 NAYA RESET SYSTEM FEATURE 🔥 ---
  const handleSystemReset = async () => {
    const confirm1 = window.confirm("🚨 DANGER ZONE: Are you sure you want to WIPE ALL DATA (Visits, Visitors, and Staff)? Admin accounts will remain safe.");
    
    if (confirm1) {
      const confirm2 = window.prompt("Type 'RESET' in capital letters to confirm this destructive action:");
      
      if (confirm2 === 'RESET') {
        try {
          setLoading(true);
          await axios.post(`${API_URL}/api/auth/reset-database`);
          alert("✅ System data has been successfully wiped clean!");
          fetchUsers(); // Refresh UI after wipe
        } catch (error) {
          alert("❌ Reset failed. Check backend console.");
        } finally {
          setLoading(false);
        }
      } else {
        alert("Reset Cancelled: You didn't type RESET correctly.");
      }
    }
  };

  const filteredUsers = usersList.filter(u => u.role === activeTab);
  const totalHosts = usersList.filter(u => u.role === 'host').length;
  const totalGuards = usersList.filter(u => u.role === 'guard').length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white p-4 md:p-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <ShieldAlert className="text-indigo-400" size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin <span className="text-indigo-400">Control Panel</span></h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Manage all staff and security personnel</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl flex-1 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Hosts</p>
              <p className="text-xl font-black text-emerald-400">{totalHosts}</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl flex-1 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Guards</p>
              <p className="text-xl font-black text-orange-400">{totalGuards}</p>
            </div>

            {/* NAYA WIPE DATABASE BUTTON */}
            <button 
              onClick={handleSystemReset}
              title="Wipe all data from Database"
              className="bg-red-900/20 border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all p-3 rounded-xl flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.15)] group"
            >
              <AlertOctagon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Reset DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden relative z-10">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('host')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-all ${activeTab === 'host' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Users size={20} /> Employees / Hosts
          </button>
          <button 
            onClick={() => setActiveTab('guard')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-all ${activeTab === 'guard' ? 'text-orange-400 border-b-2 border-orange-400 bg-slate-800' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Shield size={20} /> Security Guards
          </button>
        </div>

        {/* Data Table */}
        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Clock className="text-indigo-400 animate-spin w-10 h-10" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="pb-4 pl-4 font-semibold">Name</th>
                  <th className="pb-4 font-semibold">Email</th>
                  <th className="pb-4 font-semibold">Phone</th>
                  <th className="pb-4 font-semibold">Role</th>
                  <th className="pb-4 text-right pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-500 font-medium">No records found for this role.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
                      <td className="py-4 pl-4 font-bold text-white">{u.name}</td>
                      <td className="py-4 text-slate-300">{u.email}</td>
                      <td className="py-4 text-slate-300">{u.phone || 'N/A'}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'host' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 pr-4 flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(u)} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(u._id, u.name)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            
            <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit className="text-indigo-400" /> Edit Staff Details
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                <input type="email" required value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-slate-400 rounded-xl px-4 py-3 outline-none" disabled title="Email cannot be changed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                <input type="tel" required value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <select required value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="host" className="bg-slate-800">Host (Employee)</option>
                  <option value="guard" className="bg-slate-800">Security Guard</option>
                  <option value="admin" className="bg-slate-800">Admin</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 transition-all font-bold flex justify-center items-center gap-2 mt-6">
                <Save size={20} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;