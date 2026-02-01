import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black-900/80 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card-maroon w-full max-w-xl relative z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-maroon-700/20 rounded-full text-white/40 hover:text-maroon-700 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
