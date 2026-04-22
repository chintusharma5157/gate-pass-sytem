import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Send, CheckCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VisitorRegistration = () => {
  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [hosts, setHosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', idProof: '', purpose: '', hostId: ''
  });

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/auth/hosts`);
        setHosts(data);
      } catch (error) {
        console.error("Error fetching hosts:", error);
      }
    };
    fetchHosts();
  }, []);

  const handleCapture = (e) => {
    e.preventDefault();
    setPhoto(webcamRef.current.getScreenshot());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) return alert("Please capture your photo first!");
    
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/visitors/request-pass`, {
        ...formData,
        photoUrl: photo 
      });
      setIsSuccess(true);
      setFormData({ name: '', phone: '', idProof: '', purpose: '', hostId: '' });
      setPhoto(null);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex justify-center items-center relative overflow-hidden p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="bg-slate-800/40 backdrop-blur-md p-10 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-emerald-500/30 text-center max-w-md relative z-10 transform animate-[fadeIn_0.5s_ease-out]">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500/10 p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle className="text-emerald-400 w-16 h-16" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Request Sent!</h2>
          <p className="text-slate-400 mb-8 font-medium">Your gate pass request is pending approval. Please check your status in a few moments.</p>
          <div className="flex flex-col gap-3">
            <a href="/status" className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 px-6 py-3 rounded-xl hover:bg-emerald-500/20 transition-all font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Track Pass Status
            </a>
            <button onClick={() => setIsSuccess(false)} className="text-slate-400 hover:text-white transition-colors text-sm font-medium mt-2">
              Register Another Visitor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-10 px-4 flex justify-center items-center relative overflow-hidden">
      
      {/* Dark Theme Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl w-full bg-slate-800/40 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Webcam Section */}
        <div className="md:w-5/12 bg-slate-900/60 p-8 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="text-indigo-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Identity Scan</h2>
          </div>
          
          <div className="w-full max-w-sm bg-black rounded-2xl overflow-hidden border-4 border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 relative group">
            <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/50 rounded-xl transition-all pointer-events-none z-10"></div>
            {!photo ? (
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-auto opacity-90" />
            ) : (
              <img src={photo} alt="Captured" className="w-full h-auto opacity-90" />
            )}
            {/* Cyberpunk scanning line effect */}
            {!photo && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-[pulse_2s_ease-in-out_infinite]"></div>}
          </div>

          {!photo ? (
            <button onClick={handleCapture} className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 px-6 py-3 rounded-xl hover:bg-indigo-500/30 hover:text-indigo-200 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] font-semibold w-full justify-center">
              <Camera size={20} /> Capture Photo
            </button>
          ) : (
            <button onClick={(e) => { e.preventDefault(); setPhoto(null); }} className="flex items-center gap-2 bg-slate-700/50 text-slate-300 border border-slate-600 px-6 py-3 rounded-xl hover:bg-slate-700 transition-all font-semibold w-full justify-center">
              <RefreshCw size={20} /> Retake Photo
            </button>
          )}
        </div>

        {/* Right Side: Form Section */}
        <div className="md:w-7/12 p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Visitor Details</h2>
            <a href="/status" className="text-indigo-400 font-semibold hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors">
              Check Status &rarr;
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input type="text" required value={formData.name} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-500" placeholder="John Doe" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                <input type="tel" required value={formData.phone} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-500" placeholder="9876543210" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">ID Proof (Aadhar/PAN)</label>
              <input type="text" required value={formData.idProof} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-500" placeholder="Document Number" onChange={(e) => setFormData({...formData, idProof: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Whom to meet? (Host)</label>
              <select required value={formData.hostId} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none" onChange={(e) => setFormData({...formData, hostId: e.target.value})}>
                <option value="" className="bg-slate-800">Select Host</option>
                {hosts.map(host => (
                  <option key={host._id} value={host._id} className="bg-slate-800">{host.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Purpose of Visit</label>
              <input type="text" required value={formData.purpose} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-500" placeholder="Meeting, Interview, Delivery..." onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] font-bold mt-8 disabled:bg-indigo-800 disabled:shadow-none">
              <Send size={20} /> {isSubmitting ? 'Processing Request...' : 'Submit Gate Pass Request'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default VisitorRegistration;
