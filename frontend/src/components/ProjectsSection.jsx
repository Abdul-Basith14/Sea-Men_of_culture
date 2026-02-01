import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import api from '../utils/api';
import { Package, Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';
import { ProjectSkeleton } from './SkeletonLoader';

const ProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: { status: filter === 'all' ? undefined : filter, search: searchTerm }
      });
      setProjects(res.data.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 px-2">
          <Package size={20} className="text-maroon-700" /> Operational Projects
        </h2>
        
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder="Search code or name..." 
              className="input-field pl-10 py-2 w-full sm:w-64 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="input-field py-2 px-3 text-sm w-auto hidden sm:block"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed</option>
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary py-2 px-4 whitespace-nowrap shadow-[0_0_15px_rgba(74,14,14,0.3)]"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <ProjectCard 
              key={project._id} 
              project={project}
              index={idx}
              onClick={(id) => window.location.href = `/project/${id}`} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4 glass-card border-dashed">
          <div className="p-6 rounded-full bg-white/5">
            <Package size={48} />
          </div>
          <div className="text-center">
            <p className="font-bold text-white/60">No matching deployments found</p>
            <p className="text-xs">Adjust filters or initialize a new project bundle.</p>
          </div>
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchProjects} 
      />
    </div>
  );
};

export default ProjectsSection;
