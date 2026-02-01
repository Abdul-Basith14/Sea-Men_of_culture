import { useState } from 'react';
import { Tag, Upload, Loader2, DollarSign, Filter } from 'lucide-react';
import Modal from './Modal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AddProductModal = ({ isOpen, onClose, projectId, onRefresh }) => {
  const [formData, setFormData] = useState({
    costPrice: '',
    sellingPrice: ''
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
    if (!image) {
      toast.error('Component reference image is required');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('projectId', projectId);
    data.append('costPrice', formData.costPrice || 0);
    if (formData.sellingPrice) data.append('sellingPrice', formData.sellingPrice);
    if (formData.status) data.append('status', formData.status);
    data.append('productImage', image);

    try {
      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Inventory unit added successfully');
      onRefresh();
      onClose();
      // Reset
      setFormData({ costPrice: '', sellingPrice: '' });
      setImage(null);
      setPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add inventory unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Inventory Unit">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Component Archetype (Image)</label>
          <div 
            className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 bg-black-900/40 hover:border-maroon-700/50 transition-all cursor-pointer relative"
            onClick={() => document.getElementById('product-image').click()}
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
              id="product-image"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <DollarSign size={15} className="text-maroon-700" /> Cost Price
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Optional (0.00)"
              value={formData.costPrice}
              onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Tag size={15} className="text-success" /> Target Price
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Optional"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <Filter size={15} className="text-blue-400" /> Initial Status
          </label>
          <select 
            className="input-field py-2"
            value={formData.status || 'not_sold'}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="not_sold">Not Sold (Inventory)</option>
            <option value="in_process">In Process</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : "Commit to Inventory"}
        </button>
      </form>
    </Modal>
  );
};

export default AddProductModal;
