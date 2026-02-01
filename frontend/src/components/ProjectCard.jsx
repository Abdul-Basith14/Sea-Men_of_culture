import { MoreVertical, Users, Package, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectCard = ({ project, onClick, index = 0 }) => {
  const percentSold = Math.round((project.productsSold / project.totalProducts) * 100) || 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col overflow-hidden group hover:border-maroon-700/50 transition-all duration-500 cursor-pointer"
      onClick={() => onClick(project._id)}
    >
      {/* Project Image */}
      <div className="h-48 relative overflow-hidden">
        <img 
          src={project.projectImage} 
          alt={project.projectName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-black-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-maroon-700 border border-maroon-700/30">
          {project.projectCode}
        </div>
        
        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black-900 via-black-900/60 to-transparent">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${project.status === 'completed' ? 'text-success' : 'text-gold-500'}`}>
              {project.status === 'completed' ? 'Fully Discharged' : 'Active Deployment'}
            </span>
            <span className="text-[10px] font-bold text-white/60">{percentSold}% Sold</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentSold}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (index * 0.1) }}
              className={`h-full ${project.status === 'completed' ? 'bg-success' : 'bg-maroon-700'}`}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-white group-hover:text-maroon-700 transition-colors line-clamp-1">
            {project.projectName}
          </h3>
          <button className="text-white/20 hover:text-white/60 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
        
        <p className="text-xs text-white/50 line-clamp-2 min-h-[32px]">
          {project.description || 'N/A'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Package size={14} className="text-maroon-700" /> {project.productsSold}/{project.totalProducts} Items
            </span>
          </div>
          <div className="flex items-center gap-1 font-bold text-white/60 group-hover:text-gold-500 transition-colors">
            Details <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
