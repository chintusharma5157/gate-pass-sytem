import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, CalendarDays, Phone, Fingerprint } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HostDashboard = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Local storage se logged-in host ka data nikalna
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'host') {
      navigate('/login'); 
      return;
    }
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/visits/host/${user._id}`);
      setVisits(data);
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitId) => {
    try {
      await axios.put(`${API_URL}/api/visits/approve/${visitId}`);
      alert("Visit Approved! QR Code Generated.");
      fetchVisits(); // List ko refresh karo
    } catch (error) {
      alert(error.response?.data?.message || "Error approving visit");
    }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 flex justify-center items-center">
      <div className="text-indigo-400 text-xl font-semibold animate-pulse tracking-widest flex items-center gap-2">
        <Clock className="animate-spin" /> LOADING DASHBOARD...
      </div>
    </div>
  );

  return (
    // Yaha par explicitly bg-slate-900 aur text-white add kiya gaya hai
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* Subtle Background Glow (blur-3xl for better cross-browser rendering) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-3xl rounded-full pointer-events-none"></div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10 bg-slate-800/40 backdrop-blur-md p-6 md:px-8 rounded-2xl shadow-lg border border-slate-700/50 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Host <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Portal</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Welcome back, {user?.name}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50">
          <CalendarDays size={18} className="text-indigo-400" />
          <span className="text-slate-300 text-sm font-semibold">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Visitor Requests Grid */}
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-indigo-400" /> Recent Requests
        </h2>
        
        {visits.length === 0 ? (
          <div className="text-center bg-slate-800/40 backdrop-blur-md p-10 rounded-2xl shadow-sm border border-slate-700/50 text-slate-400 font-medium">
            No visitors requested to meet you yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visits.map((visit) => (
              <div key={visit._id} className="group bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 flex flex-col justify-between">
                
                <div className="flex items-start gap-4 mb-4">
                  {/* Visitor Photo */}
                  {visit.visitorId?.photoUrl ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full group-hover:bg-indigo-500/40 transition-all"></div>
                      <img src={visit.visitorId.photoUrl} alt="Visitor" className="relative w-16 h-16 rounded-full object-cover border-2 border-slate-600 group-hover:border-indigo-400 transition-colors" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-400">
                      No Pic
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-100">{visit.visitorId?.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Phone size={12} className="text-indigo-400" /> {visit.visitorId?.phone}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Fingerprint size={12} className="text-indigo-400" /> {visit.visitorId?.idProof}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl mb-5 text-sm text-slate-300">
                  <span className="font-semibold text-indigo-400">Purpose:</span> {visit.purpose}
                </div>

                {/* Status & Action Buttons */}
                {visit.status === 'Pending' ? (
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => handleApprove(visit._id)} 
                      className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 py-2 rounded-xl font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/50 flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button 
                      className="flex-1 bg-red-500/10 text-red-400 border border-red-500/30 py-2 rounded-xl font-semibold hover:bg-red-500/20 hover:border-red-500/50 flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="mt-auto text-center flex flex-col items-center bg-slate-900/30 p-4 rounded-xl border border-slate-700/30">
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <CheckCircle size={16} /> Access Approved
                    </span>
                    {/* QR Code display with dark neon frame */}
                    {visit.qrCodeData && (
                      <div className="p-2 bg-white rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        <img src={visit.qrCodeData} alt="Gate Pass QR" className="w-28 h-28 object-contain" />
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
