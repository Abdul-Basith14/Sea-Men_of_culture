import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  profitPerMember: {
    type: Number,
    required: true
  },
  payments: [{
    fromMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approval_requested', 'paid'],
      default: 'pending'
    },
    requestedDate: {
      type: Date
    },
    paidDate: {
      type: Date
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
