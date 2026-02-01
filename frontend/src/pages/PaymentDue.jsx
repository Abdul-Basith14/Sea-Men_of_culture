import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Package, Loader2, DollarSign, CheckCircle, User } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedNumber from '../components/AnimatedNumber';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PaymentDue = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [products, setProducts] = useState([]);
  const [paying, setPaying] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { status: 'active' } });
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectProducts = async (projectId) => {
    try {
      const [projectRes, transactionsRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get('/transactions')
      ]);
      
      const userId = user?.id || user?._id;
      
      // Get ALL products sold by current user (regardless of payment status)
      const userSoldProducts = projectRes.data.data.products.filter(p => 
        p.status === 'sold' && p.soldBy?._id === userId
      );
      
      setProducts(userSoldProducts);
      setTransactions(transactionsRes.data.data || []);
      setSelectedProject(projectRes.data.data.project);
    } catch (error) {
      toast.error('Failed to load project products');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleMarkAsPaid = async (product, toMemberId, amount) => {
    setPaying(`${product._id}-${toMemberId}`);
    try {
      const response = await api.post('/payments/request-approval', {
        toMemberId: toMemberId,
        amount: amount
      });
      
      console.log('Mark as paid response:', response.data);
      toast.success('Payment notification sent to member');
      
      // Refresh both project products and user data
      await loadUser();
      await fetchProjectProducts(selectedProject._id);
    } catch (error) {
      console.error('Mark as paid error:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setPaying(null);
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
            <AlertCircle size={20} className="text-maroon-700" />
            <h1 className="font-bold tracking-tight">Payment Due</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {!selectedProject ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Active Projects</h2>
              <p className="text-sm text-white/40">View and manage your payment obligations</p>
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
                      <AlertCircle size={16} className="text-maroon-700" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedProject(null)}
                className="text-sm text-maroon-700 hover:text-maroon-600 flex items-center gap-1 mb-2"
              >
                <ArrowLeft size={16} /> Back to projects
              </button>
              <h2 className="text-2xl font-bold">{selectedProject.projectName}</h2>
              <p className="text-sm text-white/40">Products you sold and payment obligations</p>
            </div>

            <div className="space-y-6">
              {products.map(product => {
                const sharePerMember = product.sellingPrice / 4;
                const userId = user?.id || user?._id;

                // Find the transaction for this product
                const transaction = transactions.find(t => 
                  (t.productId?._id === product._id || t.productId === product._id) &&
                  t.seller?._id === userId
                );

                if (!transaction || !transaction.payments) {
                  console.log('No transaction found for product:', product.productCode);
                  return null;
                }

                // Get the 3 payment entries from transaction
                const productPayments = transaction.payments.filter(p => 
                  p.fromMember?._id === userId || p.fromMember === userId
                );

                if (productPayments.length === 0) {
                  console.log('No payments found for product:', product.productCode);
                  return null;
                }

                return (
                  <div key={product._id} className="glass-card p-6 space-y-6">
                    {/* Product Header */}
                    <div className="flex gap-4 pb-4 border-b border-white/10">
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-success" />
                            <span className="text-lg font-bold text-success">Selling Price: ₹{product.sellingPrice}</span>
                          </div>
                          <div className="text-sm text-white/60">
                            Cost: ₹{product.costPrice} | Profit: ₹{product.profit}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">Payment Distribution</h4>
                        <span className="text-xs text-white/40">₹{sharePerMember} per member</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {productPayments.map((txPayment, idx) => {
                          const memberId = txPayment.toMember?._id || txPayment.toMember;
                          
                          // Find member details
                          const memberPayment = user?.paymentsDue?.find(
                            p => (p.toMember?._id || p.toMember) === memberId
                          );
                          
                          const member = memberPayment?.toMember || txPayment.toMember;
                          if (!member) return null;

                          const paymentStatus = txPayment.status;
                          const isPaid = paymentStatus === 'paid';
                          const isAwaitingVerification = paymentStatus === 'approval_requested';

                          return (
                            <div key={idx} className="glass-card-maroon p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={member.profileImage} 
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full border border-white/20"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">{member.name}</p>
                                  <p className="text-xs text-white/40 truncate">{member.email}</p>
                                </div>
                              </div>

                              <div className="border-t border-white/10 pt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-white/60">Amount Due</span>
                                  <span className="text-lg font-bold text-maroon-700">₹{sharePerMember}</span>
                                </div>

                                {isPaid ? (
                                  <div className="bg-success/20 border border-success/40 rounded-lg p-2 flex items-center justify-center gap-2 text-success">
                                    <CheckCircle size={16} />
                                    <span className="text-xs font-bold">Paid & Verified</span>
                                  </div>
                                ) : isAwaitingVerification ? (
                                  <div className="bg-gold-500/20 border border-gold-500/40 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gold-500 font-medium">Awaiting Verification</p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleMarkAsPaid(product, member._id, sharePerMember)}
                                    disabled={paying === `${product._id}-${member._id}`}
                                    className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2"
                                  >
                                    {paying === `${product._id}-${member._id}` ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle size={16} />
                                        Mark as Paid
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4 glass-card border-dashed">
                <Package size={48} />
                <p className="font-bold text-white/60">No products sold in this project yet</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PaymentDue;
