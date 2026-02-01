import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const clearDummyUsers = async () => {
  try {
    await connectDB();

    // Delete the dummy users by their emails
    const dummyEmails = [
      'rahul@business.com',
      'priya@business.com',
      'amit@business.com',
      'sneha@business.com'
    ];

    const result = await User.deleteMany({ email: { $in: dummyEmails } });
    
    console.log(`✅ Deleted ${result.deletedCount} dummy users`);
    console.log('👉 Only real registered users remain in the database\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing dummy users:', error);
    process.exit(1);
  }
};

clearDummyUsers();
