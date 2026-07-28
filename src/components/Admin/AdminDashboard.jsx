import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import TicketGeneratorPortal from './TicketGeneratorPortal';
import AttendancePortal from './AttendancePortal';
import BiometricEnrollment from './BiometricEnrollment';
import { FiSliders, FiUserCheck, FiLogOut, FiMenu, FiX, FiUser, FiList } from 'react-icons/fi';
import { Fingerprint } from 'lucide-react';
import LogHistory from './LogHistory';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'scanner' | 'biometrics'
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in, and fetch role
    const checkAuth = async () => {
      // Check for mock session stored during local offline testing
      const mockRole = localStorage.getItem('ggsc_mock_role');
      const mockEmail = localStorage.getItem('ggsc_mock_email');
      
      if (mockRole) {
        const mockProf = {
          display_name: mockEmail ? mockEmail.split('@')[0] : mockRole,
          role: mockRole,
          email: mockEmail || `${mockRole}@ggsc.org`
        };
        setProfile(mockProf);
        if (mockRole === 'volunteer') {
          setActiveTab('scanner');
        } else {
          setActiveTab('generator');
        }
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        return;
      }

      try {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('display_name, role, email')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!prof || (prof.role !== 'admin' && prof.role !== 'oops' && prof.role !== 'member' && prof.role !== 'volunteer')) {
          // If not permitted role
          await supabase.auth.signOut();
          navigate('/admin/login');
          return;
        }

        setProfile(prof);

        // Auto-select the first tab that the user has permission to view
        if (prof.role === 'volunteer') {
          setActiveTab('scanner');
        } else {
          setActiveTab('generator');
        }
      } catch (err) {
        console.error('Error verifying admin profile:', err);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('ggsc_mock_role');
    localStorage.removeItem('ggsc_mock_email');
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f6f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-bold text-neutral-500">Authorizing dashboard session...</p>
        </div>
      </div>
    );
  }

  const getMenuItems = () => {
    const role = profile?.role;
    if (role === 'admin' || role === 'oops') {
      return [
        { id: 'generator', label: 'Ticket Generator', icon: FiSliders },
        { id: 'scanner', label: 'Attendance Scanner', icon: FiUserCheck },
        { id: 'biometrics', label: 'Biometric Settings', icon: Fingerprint },
        { id: 'logs', label: 'Log History', icon: FiList },
      ];
    } else if (role === 'member') {
      return [
        { id: 'generator', label: 'Ticket Generator', icon: FiSliders },
        { id: 'scanner', label: 'Attendance Scanner', icon: FiUserCheck },
      ];
    } else if (role === 'volunteer') {
      return [
        { id: 'scanner', label: 'Attendance Scanner', icon: FiUserCheck },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex relative z-10">
      
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-24 left-4 z-40 lg:hidden p-2 rounded-xl bg-white border border-neutral-200 shadow"
      >
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white/80 backdrop-blur-md border-r border-neutral-200 p-6 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 mt-8 lg:mt-0">
            <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center overflow-hidden">
              <img src="/img/main.png" alt="GGSC" className="h-full w-full object-cover" />
            </div>
            <div className="leading-none">
              <span className="font-extrabold tracking-wider text-sm block" style={{ fontFamily: "'Bungee', sans-serif" }}>
                GGSC ADMIN
              </span>
              <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">UEM Kolkata</span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 bg-neutral-100/50 rounded-2xl border border-neutral-200/40 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate leading-tight">
              <p className="text-xs font-extrabold text-neutral-800 truncate">{profile?.display_name || 'Admin User'}</p>
              <p className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">{profile?.role}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
                    ${activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' 
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
                  `}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <FiLogOut size={16} />
          Logout Session
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 lg:h-screen lg:overflow-y-auto mt-16 lg:mt-0">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'generator' && <TicketGeneratorPortal />}
          {activeTab === 'scanner' && <AttendancePortal />}
          {activeTab === 'biometrics' && <BiometricEnrollment />}
          {activeTab === 'logs' && <LogHistory />}
        </div>
      </main>
    </div>
  );
}
