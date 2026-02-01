import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, Mail, Camera, Save, ArrowLeft, 
  ChevronRight, DollarSign, TrendingUp, Package, 
  CheckCircle, AlertCircle, Loader2, CreditCard, RotateCcw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [financials, setFinancials] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || null);

  const fetchData = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const [finRes, projRes] = await Promise.all([
        api.get(`/users/${userId}/financials`),
        api.get(`/users/${userId}/project-analytics`)
      ]);
      setFinancials(finRes.data.data);
      setProjectStats(projRes.data.data);
    } catch (error) {
      toast.error('Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      // Add timestamp to prevent caching of profile images
      const imageUrl = user.profileImage.includes('?') 
        ? user.profileImage 
        : `${user.profileImage}?t=${Date.now()}`;
      setPreview(imageUrl);
      fetchData();
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (imageFile) data.append('profileImage', imageFile);

    const userId = user?.id || user?._id;
    try {
      const response = await api.put(`/users/${userId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile updated successfully');
      
      // Clear image file state
      setImageFile(null);
      
      // Update preview with new image URL and cache-busting timestamp
      if (response.data.data.profileImage) {
        const imageUrlWithTimestamp = `${response.data.data.profileImage}?t=${Date.now()}`;
        setPreview(imageUrlWithTimestamp);
      }
      
      // Reload user data
      await loadUser();
      
      // Force refresh the data
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentAction = async (type, data) => {
    try {
      if (type === 'mark-paid') {
        await api.post('/payments/request-approval', {
          toMemberId: data.toMember._id,
          amount: data.amount
        });
        toast.success('Payment notification sent');
      } else if (type === 'verify-received') {
        await api.post('/payments/approve', {
          fromMemberId: data.fromMember._id,
          amount: data.amount
        });
        toast.success('Payment verified');
      }
      fetchData();
      loadUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleResetFinancials = async () => {
    if (!window.confirm('Are you sure you want to reset all financial data? This will clear your total profit, all payment dues, and receivables. This action cannot be undone.')) return;
    
    const userId = user?.id || user?._id;
    try {
      await api.post(`/users/${userId}/reset`);
      toast.success('Financial data reset successfully');
      fetchData();
      loadUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black-900">
      <AnimatedBackground />
      <Loader2 className="animate-spin text-maroon-700" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen relative text-white pb-20">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="h-16 flex items-center px-6 glass-card border-none rounded-none sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm text-white/40 font-medium tracking-tight">
            <span>Operating System</span>
            <ChevronRight size={14} />
            <span className="text-white font-bold">User Configuration</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card & Quick Stats */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Edit Card */}
            <section className="glass-card p-6 space-y-6">
              <div className="relative flex flex-col items-center group">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-maroon-900/50 shadow-2xl">
                  <img src={preview} alt={user?.name} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold uppercase tracking-widest text-white">
                    <Camera size={20} className="mb-1" />
                    Change
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 px-1">Legal Name</label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-700" />
                    <input 
                      type="text" 
                      className="input-field pl-9 text-sm" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 px-1">Network Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-700" />
                    <input 
                      type="email" 
                      className="input-field pl-9 text-sm" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Update Core System</>}
                </button>
              </form>
            </section>

            {/* Wallet Overview */}
            <section className="glass-card-maroon p-6 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard size={16} className="text-maroon-700" /> Liquidity Vault
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-tight">Accrued Profit</div>
                  <div className="text-xl font-bold text-success">₹{financials?.totalProfit.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-tight">Revenue Impact</div>
                  <div className="text-xl font-bold text-blue-400">₹{financials?.revenueGenerated.toLocaleString()}</div>
                </div>
              </div>
              
              <button 
                onClick={handleResetFinancials}
                className="w-full mt-4 px-4 py-2.5 bg-red-900/20 text-red-400 border border-red-700/30 rounded-lg hover:bg-red-700 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold"
                title="Reset all financial data"
              >
                <RotateCcw size={14} />
                Reset Financial Data
              </button>
            </section>
          </div>

          {/* Right Column: Financial Hub & Projects */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Financial Status Tabs (Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5 border-l-4 border-l-maroon-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-maroon-900/20 rounded-lg text-maroon-700">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-maroon-700 bg-maroon-900/10 px-2 py-0.5 rounded uppercase">Outgoing</span>
                </div>
                <div className="text-2xl font-bold italic">₹{financials?.totalDue.toLocaleString()}</div>
                <p className="text-xs text-white/40 mt-1">Total operational dues to partners</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-l-success">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-success/10 rounded-lg text-success">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded uppercase">Incoming</span>
                </div>
                <div className="text-2xl font-bold italic">₹{financials?.totalReceivable.toLocaleString()}</div>
                <p className="text-xs text-white/40 mt-1">Verified assets awaiting liquidation</p>
              </div>
            </div>

            {/* Project Analytics Table */}
            <section className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 tracking-tight">
                  <Package size={18} className="text-maroon-700" /> My Projects
                </h3>
                <span className="text-[10px] font-bold text-white/40">{projectStats.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/30">
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">My Revenue</th>
                      <th className="px-6 py-4">My Profit</th>
                      <th className="px-6 py-4">Items Sold</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projectStats.map(proj => (
                      <tr key={proj._id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/project/${proj._id}`)}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-maroon-700 group-hover:text-white transition-colors">#{proj.projectCode}</div>
                          <div className="text-[10px] text-white/40 truncate max-w-[150px]">{proj.projectName}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-400">₹{proj.userRevenue.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-success">₹{proj.userProfit.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-white font-bold">{proj.productsSold}</span>
                            <span className="text-white/40 text-xs">of {proj.totalProducts}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            proj.status === 'completed' ? 'bg-success/10 text-success border border-success/30' : 'bg-maroon-900/20 text-maroon-700 border border-maroon-700/30'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Financial Settlement Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Dues list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-maroon-700 flex items-center gap-2">
                  <AlertCircle size={14} /> Settlement Required
                </h4>
                <div className="space-y-3">
                  {financials?.paymentsDue.length > 0 ? financials.paymentsDue.map((due, i) => (
                    <div key={i} className="glass-card p-4 flex items-center justify-between group hover:border-maroon-700/30 transition-all">
                      <div className="flex items-center gap-3">
                        <img src={due.toMember.profileImage} className="w-8 h-8 rounded-full border border-maroon-900/50" />
                        <div>
                          <div className="text-[11px] font-bold">{due.toMember.name}</div>
                          <div className="text-[10px] text-maroon-700 font-bold tracking-tight">₹{due.amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePaymentAction('mark-paid', due); }}
                        className="p-2 bg-maroon-900/20 text-maroon-700 rounded-lg hover:bg-maroon-700 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Confirm Payment"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  )) : (
                    <div className="text-[10px] text-white/20 italic p-4 glass-card border-dashed">All operational dues settled.</div>
                  )}
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-success flex items-center gap-2">
                  <CheckCircle size={14} /> Asset Verification
                </h4>
                <div className="space-y-3">
                  {financials?.pendingPaymentApprovals.length > 0 ? financials.pendingPaymentApprovals.map((req, i) => (
                    <div key={i} className="glass-card p-4 flex items-center justify-between group hover:border-success/30 transition-all bg-success/5 border-success/20">
                      <div className="flex items-center gap-3">
                        <img src={req.fromMember.profileImage} className="w-8 h-8 rounded-full border border-success/30" />
                        <div>
                          <div className="text-[11px] font-bold">{req.fromMember.name}</div>
                          <div className="text-[10px] text-success font-bold tracking-tight">₹{req.amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePaymentAction('verify-received', req); }}
                          className="p-2 bg-success/20 text-success rounded-lg hover:bg-success hover:text-white transition-all"
                          title="Verify Audit"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-[10px] text-white/20 italic p-4 glass-card border-dashed">No assets awaiting verification.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
