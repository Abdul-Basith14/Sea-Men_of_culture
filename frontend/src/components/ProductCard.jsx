import { Package, Tag, Clock, User, Trash2, DollarSign } from 'lucide-react';

const ProductCard = ({ product, onSell, onDelete }) => {
  const isSold = product.status === 'sold';
  
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 ${isSold ? 'opacity-80' : 'hover:border-maroon-700/50'}`}>
      <div className="h-40 relative group">
        <img 
          src={product.productImage} 
          alt={product.productCode} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black-900/80 px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
          {product.productCode}
        </div>
        
        {isSold && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-success text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
              <Tag size={14} /> LIQUIDATED
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40 uppercase tracking-widest font-bold">Standard Unit</span>
          <span className={`px-2 py-0.5 rounded-full font-bold ${isSold ? 'text-success bg-success/10' : 'text-gold-500 bg-gold-500/10'}`}>
            {isSold ? 'Sold' : 'Available'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <p className="text-[9px] text-white/40 uppercase font-bold">Cost Basis</p>
            <p className="text-sm font-bold">₹{product.costPrice.toLocaleString()}</p>
          </div>
          <div className="bg-maroon-900/20 p-2 rounded-lg border border-maroon-700/20">
            <p className="text-[9px] text-maroon-700 uppercase font-bold">Target Yield</p>
            <p className="text-sm font-bold">₹{product.sellingPrice?.toLocaleString() || '---'}</p>
          </div>
        </div>

        {isSold ? (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <User size={14} className="text-maroon-700" />
                <span className="text-[11px] font-bold">{product.soldBy?.name}</span>
              </div>
              <div className="text-[11px] font-bold text-success">+₹{product.profit?.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <Clock size={12} />
              <span>{new Date(product.soldDate).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => onSell(product)}
              className="flex-1 btn-gold py-2 text-xs"
            >
              <DollarSign size={14} /> Liquidate
            </button>
            <button 
              onClick={() => onDelete(product._id)}
              className="p-2 glass-card hover:bg-maroon-900/20 hover:text-maroon-700 transition-colors border-white/10"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
