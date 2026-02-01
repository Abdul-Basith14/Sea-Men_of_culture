import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Package, Loader2, DollarSign } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedNumber from '../components/AnimatedNumber';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Revenue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRevenue, setProjectRevenue] = useState(null);

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

  const calculateProjectRevenue = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      const project = res.data.data.project;
      const products = res.data.data.products;
      const userId = user?.id || user?._id;
      
      console.log('Calculating revenue for user:', userId);
      console.log('User payments receivable:', user?.paymentsReceivable?.length);
      console.log('User total profit:', user?.totalProfit);
      
      // Calculate user's total VERIFIED revenue from this project
      const soldProducts = products.filter(p => p.status === 'sold');
      
      // Only count revenue from:
      // 1. Products I sold myself (I already got my 25%)
      // 2. Products where payment was verified (no longer in paymentsReceivable)
      let userRevenue = 0;
      const revenueProducts = [];
      
      soldProducts.forEach(product => {
        const sharePerMember = product.sellingPrice / 4;
        const isSeller = product.soldBy?._id === userId;
        
        console.log(`Product ${product.productCode}: Seller=${product.soldBy?.name}, isSeller=${isSeller}`);
        
        if (isSeller) {
          // I sold this, I already got my 25%
          userRevenue += sharePerMember;
          revenueProducts.push({...product, verified: true, isSeller: true});
          console.log(`  Added ${sharePerMember} (I sold it)`);
        } else {
          // Check if I have a pending receivable from the seller
          const hasPendingReceivable = user?.paymentsReceivable?.some(
            payment => payment.fromMember?._id === product.soldBy?._id && 
                       payment.amount === sharePerMember
          );
          
          console.log(`  Pending receivable: ${hasPendingReceivable}`);
          
          if (!hasPendingReceivable) {
            // Payment was verified, I received this revenue
            userRevenue += sharePerMember;
            revenueProducts.push({...product, verified: true, isSeller: false});
            console.log(`  Added ${sharePerMember} (verified payment)`);
          }
        }
      });

      console.log('Total calculated revenue:', userRevenue);
      console.log('Revenue products count:', revenueProducts.length);

      setProjectRevenue({
        project,
        products: revenueProducts,
        totalRevenue: userRevenue,
        productCount: revenueProducts.length
      });
      setSelectedProject(project);
    } catch (error) {
      console.error('Revenue calculation error:', error);
      toast.error('Failed to load project revenue');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
            <TrendingUp size={20} className="text-success" />
            <h1 className="font-bold tracking-tight">My Revenue</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {!selectedProject ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Active Projects</h2>
              <p className="text-sm text-white/40">View your revenue share from each project</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <button
                  key={project._id}
                  onClick={() => calculateProjectRevenue(project._id)}
                  className="glass-card p-6 text-left hover:border-success/50 transition-all"
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
                      <TrendingUp size={16} className="text-success" />
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
              <p className="text-sm text-white/40">Your revenue share from this project</p>
            </div>

            {/* Total Revenue Box */}
            <div className="glass-card-maroon p-8 border-2 border-success/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/20 rounded-full">
                    <DollarSign size={32} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 uppercase tracking-wider">Total Revenue (Your 25% Share)</p>
                    <p className="text-xs text-white/40 mt-1">From {projectRevenue?.productCount} sold products</p>
                  </div>
                </div>
              </div>
              <div className="text-5xl font-bold text-success">
                ₹<AnimatedNumber value={projectRevenue?.totalRevenue || 0} />
              </div>
            </div>

            {/* Product Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectRevenue?.products.map(product => {
                  const sharePerMember = product.sellingPrice / 4;
                  return (
                    <div key={product._id} className="glass-card p-4 space-y-3">
                      <div className="flex gap-3">
                        <img 
                          src={product.productImage} 
                          alt={product.productCode}
                          className="w-16 h-16 object-cover rounded-lg border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-white/60">{product.productCode}</p>
                          <p className="text-sm text-white/80 truncate">Sold: ₹{product.sellingPrice}</p>
                          <p className="text-xs text-white/40">{new Date(product.soldDate).toLocaleDateString()}</p>
                          {product.isSeller && (
                            <p className="text-xs text-maroon-700 font-bold mt-1">You sold this</p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                        <span className="text-xs text-white/60">Your Share</span>
                        <span className="text-lg font-bold text-success">₹{sharePerMember}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Revenue;
