import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode'; // 🔥 THE ULTIMATE SCANNER LIBRARY
import { ShieldCheck, UserCheck, XCircle, ScanLine, UserPlus, Send, Clock } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

const GuardDashboard = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [visitorDetails, setVisitorDetails] = useState(null);
  const [mode, setMode] = useState('scan'); 
  
  const [hosts, setHosts] = useState([]);
  const [manualForm, setManualForm] = useState({
    name: '', phone: '', idProof: '', purpose: '', hostId: ''
  });
  const [manualStatus, setManualStatus] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Ek scan complete hone tak doosre scan ko rokne ke liye
  const isProcessingRef = useRef(false); 

  useEffect(() => {
    if (!user || user.role !== 'guard') {
      navigate('/login');
    }
    const fetchHosts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/auth/hosts`);
        setHosts(data);
      } catch (err) {
        console.error("Error fetching hosts:", err);
      }
    };
    fetchHosts();
  }, [navigate, user]);

  // --- 🔥 HTML5-QRCODE SCANNER LOGIC 🔥 ---
  useEffect(() => {
    if (mode === 'scan') {
      // Initialize the scanner
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        }, 
        false // false means it won't spam console with errors
      );

      scanner.render(
        (decodedText) => {
          // Success Callback
          if (isProcessingRef.current) return; // Agar ek scan chal raha hai, toh ignore karo
          isProcessingRef.current = true;
          
          // Mast si Beep bajao!
          try { new Audio("https://www.soundjay.com/buttons/beep-01a.mp3").play(); } catch(e) {}
          
          handleScanLogic(decodedText);
        },
        (errorMessage) => {
          // Camera scan karte waqt background errors yahan aate hain, inko ignore karna hota hai
        }
      );

      // Cleanup when component unmounts
      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }
  }, [mode]);

  const handleScanLogic = async (text) => {
    console.log("✅ 1. QR SCANNED SUCCESSFULLY:", text);
    
    setLoading(true);
    setError('');
    setSuccess('');
    setVisitorDetails(null);
    setScanResult(text); // UI switch karne ke liye

    try {
      console.log("🚀 2. Backend ko Request bhej rahe hain...");
      const { data } = await axios.post(`${API_URL}/api/visits/scan`, {
        scannedData: text
      });

      console.log("✅ 3. Backend Success Response:", data);
      
      setSuccess("Pass Verified! You may enter.");
      setVisitorDetails(data.visitorDetails);

      // 5 sec baad screen normal hogi
      setTimeout(() => {
        setSuccess('');
        setScanResult(null); 
        isProcessingRef.current = false; // Agle scan ke liye ready!
      }, 5000);

    } catch (err) {
      console.error("❌ 3. Backend Error:", err);
      const backendMsg = err.response?.data?.message || 'Invalid QR Code or Request Failed.';
      setError(`Access Denied: ${backendMsg}`);
      
      // 4 sec baad screen normal hogi
      setTimeout(() => {
        setError('');
        setScanResult(null); 
        isProcessingRef.current = false; // Agle scan ke liye ready!
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setManualStatus('');

    try {
      await axios.post(`${API_URL}/api/visitors/request-pass`, {
        ...manualForm,
        photoUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
      });
      
      setManualStatus('Request successfully sent to Host!');
      setManualForm({ name: '', phone: '', idProof: '', purpose: '', hostId: '' });
      setTimeout(() => setManualStatus(''), 4000);
    } catch (err) {
      setManualStatus(err.response?.data?.message || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white p-4 flex flex-col items-center relative overflow-hidden">
      
      {/* Dynamic CSS to style the Html5QrcodeScanner default UI */}
      <style>{`
        #reader { border: none !important; border-radius: 1rem; overflow: hidden; background: #0f172a; width: 100%; }
        #reader__dashboard_section_csr span { color: #cbd5e1 !important; font-weight: 500; }
        #reader button { background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; margin: 10px; transition: 0.3s; }
        #reader button:hover { background-color: #4338ca; }
        #reader__camera_selection { padding: 8px; border-radius: 8px; background: #1e293b; color: white; border: 1px solid #334155; margin-bottom: 10px;}
        #reader__scan_region { background-color: black; }
      `}</style>

      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl flex justify-between items-center mb-6 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl shadow-orange-900/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <ShieldCheck className="text-orange-400" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Security <span className="text-orange-400">Terminal</span></h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Guard on Duty: {user?.name}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl flex gap-4 mb-6 relative z-10">
        <button onClick={() => setMode('scan')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'scan' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>
          <ScanLine size={20} /> Scan Gate Pass
        </button>
        <button onClick={() => setMode('manual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'manual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>
          <UserPlus size={20} /> Manual Entry
        </button>
      </div>

      {mode === 'scan' && (
        <div className="w-full max-w-2xl bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative z-10">
          <div className="text-center mb-6 flex justify-center items-center gap-2">
            <ScanLine className="text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-white">Live Camera Feed</h2>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border-4 border-slate-700 bg-black min-h-[300px] flex justify-center items-center relative shadow-[0_0_40px_rgba(99,102,241,0.2)]">
            
            {/* 1. Camera Div (Shows when no result is processing) */}
            <div id="reader" className={`w-full ${scanResult || loading || success || error ? 'hidden' : 'block'}`}></div>

            {/* 2. Processing Loading State */}
            {loading && (
              <div className="absolute inset-0 w-full h-full bg-slate-900/95 flex flex-col items-center justify-center z-20">
                <Clock className="text-indigo-400 animate-spin w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold text-indigo-400 animate-pulse">Verifying Pass in System...</h3>
              </div>
            )}

            {/* 3. SUCCESS Takeover Screen */}
            {success && visitorDetails && !loading && (
              <div className="absolute inset-0 w-full h-full bg-emerald-900/95 flex flex-col items-center justify-center z-30 animate-[fadeIn_0.3s_ease-out]">
                <UserCheck className="text-emerald-400 w-20 h-20 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-110" />
                <h2 className="text-4xl font-black text-emerald-400 tracking-widest mb-2">ACCESS GRANTED</h2>
                <p className="text-emerald-200 font-bold text-lg mb-6">{success}</p> 
                
                <div className="bg-black/40 p-4 rounded-2xl flex items-center gap-5 border border-emerald-500/30 backdrop-blur-sm">
                  {visitorDetails.photoUrl && (
                    <img src={visitorDetails.photoUrl} alt="Visitor" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                  )}
                  <div className="text-left">
                    <p className="text-2xl font-bold text-white leading-tight">{visitorDetails.name}</p>
                    <p className="text-emerald-300 font-medium">{visitorDetails.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ERROR Takeover Screen */}
            {error && !loading && (
              <div className="absolute inset-0 w-full h-full bg-red-900/95 flex flex-col items-center justify-center p-6 text-center z-30 animate-[fadeIn_0.3s_ease-out]">
                <XCircle className="text-red-400 w-24 h-24 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] transform scale-110" />
                <h2 className="text-4xl font-black text-red-400 tracking-widest mb-4">ACCESS DENIED</h2>
                <div className="bg-black/40 px-6 py-4 rounded-xl border border-red-500/30 backdrop-blur-sm w-full max-w-md">
                  <p className="text-red-200 font-bold text-lg leading-snug">{error}</p> 
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="w-full max-w-2xl bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative z-10">
          <div className="text-center mb-6 flex justify-center items-center gap-2">
            <UserPlus className="text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-white">Walk-in Visitor Registration</h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" required value={manualForm.name} onChange={(e) => setManualForm({...manualForm, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Visitor Name" />
              <input type="tel" required value={manualForm.phone} onChange={(e) => setManualForm({...manualForm, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Phone Number" />
            </div>
            <input type="text" required value={manualForm.idProof} onChange={(e) => setManualForm({...manualForm, idProof: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Aadhar / PAN / Driving License" />
            <select required value={manualForm.hostId} onChange={(e) => setManualForm({...manualForm, hostId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner">
              <option value="" className="bg-slate-800">-- Select Whom to Meet --</option>
              {hosts.map(host => <option key={host._id} value={host._id} className="bg-slate-800">{host.name}</option>)}
            </select>
            <input type="text" required value={manualForm.purpose} onChange={(e) => setManualForm({...manualForm, purpose: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Reason for visit" />
            
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 transition-all font-bold flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30 mt-4 disabled:bg-indigo-800">
              <Send size={20} /> {loading ? 'Sending...' : 'Send Request to Host'}
            </button>
          </form>
          {manualStatus && (
            <div className={`mt-4 p-3 rounded-xl text-center font-medium ${manualStatus.includes('successfully') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              {manualStatus}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default GuardDashboard;