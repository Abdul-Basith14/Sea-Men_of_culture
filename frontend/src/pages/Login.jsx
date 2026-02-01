import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
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
            className="text-center space-y-2 relative z-10"
          >
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Business <span className="text-maroon-700">Profit</span>
            </h1>
            <p className="text-white/60">Profit Tracking System for Partners</p>
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
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Lock size={16} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" className="rounded border-white/10 bg-black-900/50 text-maroon-700 focus:ring-maroon-700" />
                Remember me
              </label>
              <button type="button" className="text-sm text-maroon-700 hover:text-maroon-600 transition-colors">
                Forgot Password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 h-12 relative overflow-hidden group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">
                  Login to Tracker
                </span>
              )}
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </button>
          </form>
          
          <div className="text-center pt-4">
            <p className="text-sm text-white/40">
              Authorized personnel only. Secure login.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
