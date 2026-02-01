import { useState } from 'react';
import { Package, Upload, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CreateProjectModal = ({ isOpen, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('projectName', formData.projectName);
    data.append('description', formData.description);
    if (image) data.append('projectImage', image);

    try {
      const res = await api.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Project created successfully!');
      onRefresh();
      onClose();
      // Reset form
      setFormData({ projectName: '', description: '' });
      setImage(null);
      setPreview(null);
      // Redirect to project detail to add products
      navigate(`/project/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Establish New Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Project Archetype (Image)</label>
          <div 
            className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 bg-black-900/40 hover:border-maroon-700/50 transition-all cursor-pointer relative"
            onClick={() => document.getElementById('project-image').click()}
          >
            {preview ? (
              <div className="relative group w-full">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <span className="text-xs font-bold text-white">Change Image</span>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-maroon-900/20 rounded-full text-maroon-700">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Upload Reference Image</p>
                  <p className="text-[10px] text-white/40">JPEG, PNG or WebP up to 5MB</p>
                </div>
              </>
            )}
            <input 
              id="project-image"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Project Identifier (Name)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Q1 Infrastructure Bundle"
              value={formData.projectName}
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Operational Description</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Primary objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-white/10 rounded-lg text-white/60 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 btn-primary py-3"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Deploy Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
