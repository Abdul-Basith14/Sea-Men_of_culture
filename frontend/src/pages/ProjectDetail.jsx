import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Plus, Search, Filter, 
  ChevronRight, Calendar, User, Info, Loader2,
  Settings, Trash2, CheckCircle
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import ProductCard from '../components/ProductCard';
import AddProductModal from '../components/AddProductModal';
import MarkAsSoldModal from '../components/MarkAsSoldModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users')
      ]);
      setData(projectRes.data.data);
      setMembers(membersRes.data.data);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSell = (product) => {
    setSelectedProduct(product);
    setIsSellModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this unit from inventory?')) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Unit removed from inventory');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete unit');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black-900">
      <AnimatedBackground />
      <Loader2 className="animate-spin text-maroon-700" size={48} />
    </div>
  );

  const { project, products } = data;
  const filteredProducts = products.filter(p => 
    p.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const percentSold = Math.round((project.productsSold / project.totalProducts) * 100);

  return (
    <div className="min-h-screen relative text-white">
      <AnimatedBackground />
      
      {/* Navigation Header */}
      <div className="h-16 flex items-center px-6 glass-card border-none rounded-none sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/40 font-medium">
            <Link to="/dashboard" className="hover:text-white transition-colors">Infrastructure</Link>
            <ChevronRight size={14} />
            <span className="text-white font-bold">{project.projectCode}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Project Overview Header */}
        <section className="glass-card-maroon p-8 flex flex-col md:flex-row gap-8 animate-fade-in">
          <div className="w-full md:w-80 h-60 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img src={project.projectImage} alt={project.projectName} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-maroon-900/40 text-maroon-700 border border-maroon-700/30 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
                  Project Entity
                </span>
                {project.status === 'completed' && (
                  <span className="bg-success/10 text-success border border-success/30 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                    <CheckCircle size={10} /> Fully Liquidated
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{project.projectName}</h1>
              <p className="text-white/60 max-w-2xl text-sm leading-relaxed">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Deployment Date</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-maroon-700" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Operational Head</p>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-maroon-700" />
                  <span>{project.createdBy?.name}</span>
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">Liquidation Progress ({percentSold}%)</p>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${project.status === 'completed' ? 'bg-success' : 'bg-maroon-700'}`}
                    style={{ width: `${percentSold}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Management Section */}
        <section className="space-y-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
              <Package size={24} className="text-maroon-700" /> Component Inventory
            </h2>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by unit code..." 
                  className="input-field pl-10 py-2 w-full sm:w-64 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary py-2 px-4 whitespace-nowrap"
              >
                <Plus size={18} /> Add Component
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onSell={handleSell}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4 glass-card border-dashed">
              <div className="p-6 rounded-full bg-white/5">
                <Info size={48} />
              </div>
              <p className="font-bold text-white/60 text-center">
                {searchTerm ? 'Inventory matching search does not exist.' : 'No components registered in this project.'}
              </p>
            </div>
          )}
        </section>
      </main>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        projectId={id}
        onRefresh={fetchData}
      />

      <MarkAsSoldModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)}
        product={selectedProduct}
        members={members}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default ProjectDetail;
