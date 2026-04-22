import React, { useState } from 'react';
import axios from 'axios';
import { Search, Clock, XCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CheckStatus = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await axios.get(`${API_URL}/api/visits/status/${phone}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white flex flex-col items-center py-12 px-4 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md mb-8 flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Track <span className="text-indigo-400">Status</span></h1>
        <Link to="/register-visitor" className="text-slate-400 hover:text-indigo-400 font-semibold text-sm transition-colors">
          ← Back to Reg
        </Link>
      </div>

      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl shadow-indigo-900/20 border border-slate-700 p-8 mb-8 relative z-10">
        <form onSubmit={handleSearch}>
          <label className="block text-sm font-medium text-slate-400 mb-2">Enter Registered Phone Number</label>
          <div className="flex gap-3">
            <input 
              type="tel" required 
              placeholder="e.g. 9876543210"
              className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 shadow-inner"
              onChange={(e) => setPhone(e.target.value)}
            />
            <button 
              type="submit" disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 font-bold disabled:bg-indigo-800 disabled:shadow-none"
            >
              <Search size={20} /> {loading ? '...' : 'Check'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-sm mt-4 font-medium animate-[fadeIn_0.3s_ease-out] text-center">{error}</p>}
      </div>

      {result && (
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl shadow-indigo-900/20 border border-slate-700 p-8 text-center animate-[fadeIn_0.5s_ease-out] relative z-10">
          <h2 className="text-2xl font-bold text-white mb-1">Hi, {result.visitor.name}</h2>
          <p className="text-slate-400 text-sm mb-6">Meeting with: <span className="text-indigo-400 font-semibold">{result.visit.hostId.name}</span></p>

          {result.visit.status === 'Pending' && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-6 rounded-2xl flex flex-col items-center shadow-lg shadow-amber-500/10">
              <Clock size={48} className="mb-3" />
              <h3 className="font-bold text-xl mb-1">Approval Pending</h3>
              <p className="text-sm opacity-80">Please wait while the host approves your request.</p>
            </div>
          )}

          {result.visit.status === 'Rejected' && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl flex flex-col items-center shadow-lg shadow-red-500/10">
              <XCircle size={48} className="mb-3" />
              <h3 className="font-bold text-xl mb-1">Request Denied</h3>
              <p className="text-sm opacity-80">Your visit request was not approved by the host.</p>
            </div>
          )}

          {result.visit.status === 'Approved' && (
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg shadow-emerald-500/10">
                <CheckCircle size={18} /> Access Granted
              </span>
              
              <div className="bg-white p-3 rounded-2xl shadow-xl shadow-indigo-500/20 mb-6 transform hover:scale-105 transition-transform duration-300">
                <img src={result.visit.qrCodeData} alt="Your QR Code" className="w-48 h-48 mx-auto" />
              </div>
              
              <p className="text-slate-400 text-sm bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-inner">
                Show this QR code to the security guard at the entry gate.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CheckStatus;
