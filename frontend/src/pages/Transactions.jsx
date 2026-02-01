import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, History, Search, Filter, 
  ArrowUpRight, ArrowDownLeft, Calendar, 
  User, Package, Download, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedNumber from '../components/AnimatedNumber';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Transactions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data);
    } catch (error) {
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.productId?.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.productId?.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.seller?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative text-white">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="h-16 flex items-center px-6 glass-card border-none rounded-none sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <History size={20} className="text-maroon-700" />
            <h1 className="font-bold tracking-tight">Financial Ledger</h1>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Audit logs for all capital movements</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                type="text" 
                placeholder="Search ledger..." 
                className="input-field pl-10 py-2 w-full md:w-64 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all">
              <Download size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-maroon-700 mb-4" size={40} />
            <div className="space-y-4 w-full">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card h-24 w-full animate-pulse bg-white/5" />
              ))}
            </div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((t, idx) => (
                <motion.div 
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-maroon-700/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-maroon-900/20 border border-maroon-700/30 flex items-center justify-center text-maroon-700 font-bold">
                      {t.productId?.projectCode.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.productId?.projectName}</h4>
                      <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {new Date(t.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:pl-10">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Seller</p>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <User size={12} className="text-maroon-700" />
                        {t.seller?.name}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Sale Value</p>
                      <p className="text-xs font-bold text-success">
                        <AnimatedNumber value={t.sellingPrice} />
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Individual Share</p>
                      <p className="text-xs font-bold text-gold-500">
                        <AnimatedNumber value={t.profitPerMember} />
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Entities Paid</p>
                      <div className="flex gap-1">
                        {t.payments.map((p, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full ${p.status === 'paid' ? 'bg-success' : p.status === 'approval_requested' ? 'bg-gold-500' : 'bg-white/10'}`}
                            title={`${p.toMember?.name}: ${p.status}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link 
                      to={`/project/${t.productId?._id}`}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                      title="View Project"
                    >
                      <Package size={18} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4 glass-card border-dashed">
            <Info size={48} />
            <p className="font-bold text-white/60">No transaction records found in the ledger.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
