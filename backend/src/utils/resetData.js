import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const resetData = async () => {
  try {
    await connectDB();

    console.log('🔄 Starting full system reset...');

    // 1. Delete all business data
    await Project.deleteMany({});
    console.log('🗑️  All Projects deleted');

    await Product.deleteMany({});
    console.log('🗑️  All Products deleted');

    await Transaction.deleteMany({});
    console.log('🗑️  All Transactions deleted');

    // 2. Clear user financial stats but keep the users
    await User.updateMany({}, {
      $set: {
        totalProfit: 0,
        paymentsDue: [],
        paymentsReceivable: [],
        pendingPaymentApprovals: []
      }
    });
    console.log('✨ All user financial stats reset to zero');

    console.log('\n🎉 System reset successfully!');
    console.log('👉 All projects, products, and transactions are gone.');
    console.log('👉 All members now have ₹0 profit and no pending payments.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during system reset:', error);
    process.exit(1);
  }
};

resetData();
