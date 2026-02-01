import { useState, useEffect } from 'react';
import { DollarSign, User, Loader2, Tag } from 'lucide-react';
import Modal from './Modal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MarkAsSoldModal = ({ isOpen, onClose, product, members, onRefresh }) => {
  const [sellingPrice, setSellingPrice] = useState('');
  const [soldBy, setSoldBy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setSellingPrice(product.sellingPrice || '');
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!soldBy) {
      toast.error('Please specify which member sold the item');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/products/${product._id}/sell`, {
        sellingPrice: parseFloat(sellingPrice),
        soldBy
      });
      toast.success('Sale recorded and profit distributed');
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Liquidate Component">
      <div className="flex items-center gap-4 mb-6 p-4 glass-card bg-maroon-900/10 border-maroon-700/20">
        <img src={product.productImage} className="w-16 h-16 rounded-lg object-cover" />
        <div>
          <h3 className="font-bold text-white">{product.productCode}</h3>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Standard Unit</p>
          <p className="text-sm font-bold text-maroon-700">Cost Basis: ₹{product.costPrice.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <DollarSign size={16} className="text-success" /> Liquidation Price (Selling)
          </label>
          <input
            type="number"
            className="input-field text-xl font-bold py-3"
            placeholder="0.00"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
            min={product.costPrice}
          />
          {sellingPrice && parseFloat(sellingPrice) > product.costPrice && (
            <p className="text-xs text-success font-bold flex items-center gap-1">
              <Tag size={12} /> Estimated Net Profit: ₹{(parseFloat(sellingPrice) - product.costPrice).toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <User size={16} className="text-maroon-700" /> Executive Responsible
          </label>
          <div className="grid grid-cols-2 gap-3">
            {members.map(member => (
              <button
                key={member._id}
                type="button"
                onClick={() => setSoldBy(member._id)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  soldBy === member._id 
                    ? 'bg-maroon-700 border-maroon-600 shadow-[0_0_10px_rgba(74,14,14,0.3)]' 
                    : 'bg-black-900/50 border-white/5 hover:border-white/10'
                }`}
              >
                <img src={member.profileImage} className="w-8 h-8 rounded-full" />
                <span className={`text-[11px] font-bold truncate ${soldBy === member._id ? 'text-white' : 'text-white/60'}`}>
                  {member.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gold-500/5 border border-gold-500/10 rounded-xl space-y-2">
          <p className="text-[10px] uppercase font-bold text-gold-500 tracking-widest">Profit Allocation Protocol</p>
          <p className="text-xs text-white/60 leading-relaxed italic">
            Upon confirmation, the net profit will be distributed equally (25% each) across the partner network. 
            The responsible executive will hold payment obligations to other members.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(74,14,14,0.4)]"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : "Authorize Liquidation"}
        </button>
      </form>
    </Modal>
  );
};

export default MarkAsSoldModal;
