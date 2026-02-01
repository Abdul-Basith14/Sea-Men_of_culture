import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    length: 5
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Product must belong to a project']
  },
  productImage: {
    type: String,
    default: 'https://via.placeholder.com/300/4A0E0E/FFFFFF?text=Product'
  },
  costPrice: {
    type: Number,
    required: [true, 'Please provide cost price'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative']
  },
  status: {
    type: String,
    enum: ['not_sold', 'sold', 'in_process'],
    default: 'not_sold'
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldDate: {
    type: Date
  },
  profit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate profit before saving
productSchema.pre('save', function(next) {
  if (this.sellingPrice && this.costPrice) {
    this.profit = this.sellingPrice - this.costPrice;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
