import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2, LogIn } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email);
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
              left: [-100, 100],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-64 bg-maroon-700/20 blur-[100px] rounded-full pointer-events-none"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2 relative z-10"
          >
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Business <span className="text-maroon-700">Profit</span>
            </h1>
            <p className="text-white/60">Passwordless Access for Partners</p>
            <p className="text-xs text-white/40 italic">First 4 emails only</p>
          </motion.div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to login"
                className="input-field"
                required
              />
              <p className="text-xs text-white/40 mt-1">
                No password needed. Just enter your email.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 h-12 relative overflow-hidden group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  Access Tracker
                </span>
              )}
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </button>
          </form>
          
          <div className="text-center pt-4 space-y-2">
            <p className="text-sm text-white/40">
              Secure passwordless authentication
            </p>
            <p className="text-xs text-maroon-700/60">
              Limited to first 4 registered emails
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
