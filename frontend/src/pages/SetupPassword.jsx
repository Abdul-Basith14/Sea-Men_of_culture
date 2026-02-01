import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';

const SetupPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    const result = await changePassword(newPassword);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-maroon p-8 space-y-8 relative overflow-hidden">
          {/* Animated Accent */}
          <motion.div 
            animate={{ 
              top: [-100, 100], 
              right: [-100, 100],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-64 bg-maroon-700/20 blur-[100px] rounded-full pointer-events-none"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2 relative z-10"
          >
            <div className="bg-maroon-900/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-maroon-700/30 mb-4">
              <ShieldCheck size={32} className="text-maroon-700" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              One Last Step
            </h1>
            <p className="text-white/60">Please set your permanent password to secure your account.</p>
          </motion.div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Lock size={16} /> New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set new password"
                className="input-field"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Lock size={16} /> Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="input-field"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 h-12"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Set Account Password"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupPassword;
