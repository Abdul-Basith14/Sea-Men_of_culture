import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Search, Plus, Filter, User as UserIcon, RefreshCw, History, ArrowRight, Menu, X, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import MemberCard from '../components/MemberCard';
import ProjectsSection from '../components/ProjectsSection';
import { MemberSkeleton } from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout, loadUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setMembers(res.data.data);
    } catch (error) {
      toast.error('Failed to load members network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleMemberAction = async (type, data) => {
    try {
      if (type === 'request-approval') {
        await api.post('/payments/request-approval', {
          toMemberId: data.toMember._id,
          amount: data.amount
        });
        toast.success('Payment notification sent to partner');
      } else if (type === 'approve') {
        await api.post('/payments/approve', {
          fromMemberId: data.fromMember._id,
          amount: data.amount
        });
        toast.success('Payment verified and profit updated');
      } else if (type === 'reject') {
        await api.post('/payments/reject', {
          fromMemberId: data.fromMember._id,
          amount: data.amount
        });
        toast.error('Payment verification rejected');
      }
      
      // Refresh both local members list and global user state
      fetchMembers();
      loadUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="h-16 glass-card border-t-0 border-l-0 border-r-0 rounded-none flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-maroon-900 w-8 h-8 rounded flex items-center justify-center font-bold text-sm border border-maroon-700/30">SM</div>
          <span className="text-lg font-bold tracking-tight">SEA-MEN_OF_CULTURE</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { fetchMembers(); loadUser(); }}
            className={`text-white/40 hover:text-maroon-700 transition-all ${loading ? 'animate-spin text-maroon-700' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          
          <button className="text-white/60 hover:text-maroon-700 transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-maroon-700 rounded-full"></span>
          </button>

          <Link 
            to="/transactions" 
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-maroon-700/30"
          >
            <History size={16} className="text-maroon-700" />
            <span className="hidden md:inline">Ledger</span>
          </Link>

          {/* Hamburger Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-all"
              title="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-64 glass-card border-maroon-700/30 z-[60] overflow-hidden shadow-2xl bg-black-900/95 backdrop-blur-xl">
                <div className="py-2">
                  <Link 
                    to="/current-projects"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors group"
                  >
                    <CheckCircle size={18} className="text-gold-500 group-hover:text-gold-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Revenue Verification</p>
                      <p className="text-[10px] text-white/40">Verify payments received</p>
                    </div>
                  </Link>

                  <Link 
                    to="/revenue"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors group"
                  >
                    <TrendingUp size={18} className="text-success group-hover:text-success/80" />
                    <div>
                      <p className="text-sm font-bold text-white">My Revenue</p>
                      <p className="text-[10px] text-white/40">View revenue by project</p>
                    </div>
                  </Link>

                  <Link 
                    to="/payment-due"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors group"
                  >
                    <AlertCircle size={18} className="text-maroon-700 group-hover:text-maroon-600" />
                    <div>
                      <p className="text-sm font-bold text-white">Payment Due</p>
                      <p className="text-[10px] text-white/40">Manage payment obligations</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 pl-6 border-l border-white/10">
            <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{user?.role === 'admin' ? 'Admin' : 'Partner'}</p>
              </div>
              <img 
                src={user?.profileImage} 
                alt={user?.name} 
                className="w-10 h-10 rounded-full border-2 border-maroon-900/50 object-cover bg-black-900 shadow-[0_0_15px_rgba(74,14,14,0.3)]"
              />
            </Link>
            <button 
              onClick={logout}
              className="p-2 hover:bg-maroon-900/20 rounded-lg text-white/60 hover:text-maroon-700 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Sidebar - Member Section (30%) */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6 animate-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <UserIcon size={18} className="text-maroon-700" /> Strategic Partners
            </h2>
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-12rem)] scrollbar-hide pb-10">
            {loading && members.length === 0 ? (
              [1, 2, 3, 4].map(i => (
                <MemberSkeleton key={i} />
              ))
            ) : (
              members.map((member, idx) => (
                <MemberCard 
                  key={member._id} 
                  member={member} 
                  index={idx}
                  isCurrentUser={member._id === user?.id}
                  onAction={handleMemberAction}
                />
              ))
            )}
          </div>
        </aside>
        
        {/* Content - Projects Section (70%) */}
        <section className="w-full lg:w-2/3 flex flex-col gap-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <ProjectsSection />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
