import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Loader2, DollarSign, User, Image as ImageIcon } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedNumber from '../components/AnimatedNumber';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CurrentProjects = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [products, setProducts] = useState([]);
  const [verifying, setVerifying] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectProducts = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      const userId = user?.id || user?._id;
      
      // Get products sold by OTHER members (not by current user)
      const soldProducts = res.data.data.products.filter(p => 
        p.status === 'sold' && p.soldBy?._id !== userId
      );
      
      setProducts(soldProducts);
      setSelectedProject(res.data.data.project);
    } catch (error) {
      toast.error('Failed to load project products');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleVerifyPayment = async (product, fromMemberId, amount) => {
    setVerifying(`${product._id}-${fromMemberId}`);
    try {
      const response = await api.post('/payments/approve', {
        fromMemberId: fromMemberId,
        amount: amount
      });
      
      console.log('Payment verification response:', response.data);
      toast.success('Payment verified successfully! Revenue updated.');
      
      // Refresh both project products and user data
      await loadUser();
      await fetchProjectProducts(selectedProject._id);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="animate-spin text-maroon-700" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="h-16 flex items-center px-6 glass-card border-none rounded-none sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Package size={20} className="text-maroon-700" />
            <h1 className="font-bold tracking-tight">Revenue Verification</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {!selectedProject ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Active Projects</h2>
              <p className="text-sm text-white/40">Select a project to verify payments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <button
                  key={project._id}
                  onClick={() => fetchProjectProducts(project._id)}
                  className="glass-card p-6 text-left hover:border-maroon-700/50 transition-all"
                >
                  <img 
                    src={project.projectImage} 
                    alt={project.projectName}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{project.projectName}</h3>
                      <span className="text-xs bg-maroon-900/30 px-2 py-1 rounded">{project.projectCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>{project.productsSold} sold</span>
                      <span>{project.totalProducts} total</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-sm text-maroon-700 hover:text-maroon-600 flex items-center gap-1 mb-2"
                >
                  <ArrowLeft size={16} /> Back to projects
                </button>
                <h2 className="text-2xl font-bold">{selectedProject.projectName}</h2>
                <p className="text-sm text-white/40">Verify payments from sellers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map(product => {
                const sharePerMember = product.sellingPrice / 4;
                
                // Check if current user has pending receivable from this seller
                const hasPendingPayment = user?.paymentsReceivable?.some(
                  payment => payment.fromMember?._id === product.soldBy?._id && 
                             payment.amount === sharePerMember
                );

                // Check if there's a pending approval request
                const hasPendingApproval = user?.pendingPaymentApprovals?.some(
                  approval => approval.fromMember?._id === product.soldBy?._id && 
                              approval.amount === sharePerMember
                );

                // Only show products where I have a pending receivable
                if (!hasPendingPayment) return null;

                return (
                  <div key={product._id} className="glass-card p-6 space-y-4">
                    <div className="flex gap-4">
                      <img 
                        src={product.productImage} 
                        alt={product.productCode}
                        className="w-24 h-24 object-cover rounded-lg border border-white/10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-white/10 px-2 py-1 rounded font-mono">{product.productCode}</span>
                          <span className="text-xs text-white/60">{new Date(product.soldDate).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-maroon-700" />
                            <span className="text-white/80">Sold by: <strong>{product.soldBy?.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign size={14} className="text-success" />
                            <span className="text-white/80">Sale Price: <strong className="text-success">₹{product.sellingPrice}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Your Share (25%)</span>
                        <span className="text-xl font-bold text-gold-500">₹{sharePerMember}</span>
                      </div>

                      {hasPendingApproval ? (
                        <button
                          onClick={() => handleVerifyPayment(product, product.soldBy._id, sharePerMember)}
                          disabled={verifying === `${product._id}-${product.soldBy._id}`}
                          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                          {verifying === `${product._id}-${product.soldBy._id}` ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Verify Payment Received
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-3 text-center">
                          <p className="text-xs text-gold-500 font-medium">Awaiting payment confirmation from seller</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {products.filter(p => {
              const sharePerMember = p.sellingPrice / 4;
              const hasPendingPayment = user?.paymentsReceivable?.some(
                payment => payment.fromMember?._id === p.soldBy?._id && 
                           payment.amount === sharePerMember
              );
              return hasPendingPayment;
            }).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4 glass-card border-dashed">
                <Package size={48} />
                <p className="font-bold text-white/60">No pending payment verifications</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CurrentProjects;
