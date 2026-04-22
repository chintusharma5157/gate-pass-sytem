import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage'; 
import VisitorRegistration from './pages/VisitorRegistration';
import StaffAuth from './pages/StaffAuth';
import HostDashboard from './pages/HostDashboard';
import CheckStatus from './pages/CheckStatus';
import GuardDashboard from './pages/GuardDashboard';
import AdminDashboard from './pages/AdminDashboard'; // 🔥 YAHAN IMPORT KIYA HAI

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-gray-900 flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1">
          <Routes>
           
            <Route path="/" element={<LandingPage />} />
            
          
            <Route path="/register-visitor" element={<VisitorRegistration />} />
            
            <Route path="/status" element={<CheckStatus />} />
            <Route path="/login" element={<StaffAuth />} /> 
            <Route path="/host-dashboard" element={<HostDashboard />} /> 
            <Route path="/guard-dashboard" element={<GuardDashboard />} /> 
            
            
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
