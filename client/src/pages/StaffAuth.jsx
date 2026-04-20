import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Phone, Briefcase, LogIn, UserPlus } from 'lucide-react';

// Naya Dynamic URL yahan se aayega
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StaffAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'host'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      // Yahan par humne localhost hata kar API_URL laga diya
      const { data } = await axios.post(`${API_URL}${endpoint}`, formData);
      
      // Token aur user data local storage me save karo
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      // Role ke hisaab se dashboard par bhej do
      if (data.role === 'host') navigate('/host-dashboard');
      else if (data.role === 'guard') navigate('/guard-dashboard');
      else navigate('/admin-dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Explicitly bg-slate-900 aur text-white add kiya gaya hai
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white flex justify-center items-center px-4 relative overflow-hidden">
      
      {/* Fixed Background Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"></div>

      {/* Solid background for the card instead of transparent blur */}
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl shadow-indigo-900/20 border border-slate-700 p-8 relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Staff Portal' : 'Register Staff'}
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            {isLogin ? 'Secure access to your dashboard' : 'Create a secure staff account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium animate-[fadeIn_0.3s_ease-out]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Register mode me extra fields dikhao */}
          {!isLogin && (
            <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="relative group">
                <User className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input type="text" name="name" required placeholder="Full Name" onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 shadow-inner" />
              </div>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input type="tel" name="phone" required placeholder="Phone Number" onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 shadow-inner" />
              </div>
              <div className="relative group">
                <Briefcase className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <select name="role" required onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-inner">
                  <option value="host">Host (Teacher/Employee)</option>
                  <option value="guard">Security Guard</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input type="email" name="email" required placeholder="Email Address" onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 shadow-inner" />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input type="password" name="password" required placeholder="Password" onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 shadow-inner" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 transition-all font-bold flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30 mt-6 disabled:bg-indigo-800 disabled:shadow-none">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {loading ? 'Authenticating...' : (isLogin ? 'Login to Portal' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400 border-t border-slate-700 pt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default StaffAuth;