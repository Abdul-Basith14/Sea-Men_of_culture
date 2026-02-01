import { ArrowUpRight, ArrowDownLeft, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

const MemberCard = ({ member, isCurrentUser, onAction, index = 0 }) => {
  const totalDue = member.paymentsDue?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalReceivable = member.paymentsReceivable?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingApprovals = member.pendingPaymentApprovals?.length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-card-maroon p-5 space-y-4 relative group ${isCurrentUser ? 'border-maroon-700/60 shadow-[0_0_20px_rgba(74,14,14,0.3)]' : ''}`}
    >
      {isCurrentUser && (
        <span className="absolute top-3 right-3 bg-maroon-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest">
          You
        </span>
      )}
      
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <img 
          src={member.profileImage} 
          alt={member.name} 
          className="w-12 h-12 rounded-full border border-white/10" 
        />
        <div>
          <h3 className="font-bold text-white leading-tight">{member.name}</h3>
          <p className="text-xs text-white/40">{member.email}</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-black-900/40 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Verified Profit</p>
          <div className="text-xl font-bold text-success">
            <AnimatedNumber value={member.totalProfit} />
          </div>
        </div>
      </div>

      {/* Payments Due Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5 uppercase tracking-wide">
            <ArrowUpRight size={14} className="text-maroon-700" /> Amount to Pay
          </p>
          <span className="text-xs font-bold text-maroon-700">
            <AnimatedNumber value={totalDue} />
          </span>
        </div>
        <div className="space-y-1.5">
          {member.paymentsDue?.length > 0 ? (
            member.paymentsDue.slice(0, 3).map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                <span className="text-white/80">{payment.toMember?.name || 'Partner'}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₹{payment.amount}</span>
                  {isCurrentUser && (
                    <button 
                      onClick={() => onAction('request-approval', payment)}
                      className="px-2 py-0.5 bg-maroon-700/20 hover:bg-maroon-700 text-maroon-700 hover:text-white rounded border border-maroon-700/30 transition-all text-[10px]"
                    >
                      Paid
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-white/20 italic text-center py-2">No pending obligations</p>
          )}
        </div>
      </div>

      {/* Payments Receivable Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5 uppercase tracking-wide">
            <ArrowDownLeft size={14} className="text-success" /> To Receive
          </p>
          <span className="text-xs font-bold text-success">
            <AnimatedNumber value={totalReceivable} />
          </span>
        </div>
        <div className="space-y-1.5">
          {member.paymentsReceivable?.length > 0 ? (
            member.paymentsReceivable.slice(0, 3).map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] bg-white/5 p-2 rounded-lg">
                <span className="text-white/80">{payment.fromMember?.name || 'Partner'}</span>
                <span className="font-bold">₹{payment.amount}</span>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-white/20 italic text-center py-2">No pending receivables</p>
          )}
        </div>
      </div>

      {/* Approval Requests for the receiver */}
      {isCurrentUser && pendingApprovals > 0 && (
        <div className="pt-2 border-t border-white/10">
          <p className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Clock size={12} /> Pending Approvals ({pendingApprovals})
          </p>
          <div className="space-y-2">
            {member.pendingPaymentApprovals.map((approval, idx) => (
              <div key={idx} className="bg-gold-500/10 border border-gold-500/20 p-2 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/90 font-bold">{approval.fromMember?.name}</p>
                  <p className="text-[11px] text-gold-500 font-bold">₹{approval.amount}</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => onAction('approve', approval)}
                    className="p-1.5 bg-success/20 hover:bg-success text-success hover:text-white rounded transition-colors"
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button 
                    onClick={() => onAction('reject', approval)}
                    className="p-1.5 bg-maroon-900/40 hover:bg-maroon-700 text-white rounded transition-colors"
                  >
                    <Clock size={14} className="rotate-45" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MemberCard;
