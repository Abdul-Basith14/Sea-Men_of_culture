import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    length: 5
  },
  projectName: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectImage: {
    type: String,
    default: 'https://via.placeholder.com/400/4A0E0E/FFFFFF?text=Project'
  },
  totalProducts: {
    type: Number,
    default: 0,
    min: [0, 'Total products cannot be negative']
  },
  productsSold: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for products remaining
projectSchema.virtual('productsRemaining').get(function() {
  return this.totalProducts - this.productsSold;
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
