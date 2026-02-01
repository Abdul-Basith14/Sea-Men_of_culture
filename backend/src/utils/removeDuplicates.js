import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const removeDuplicates = async () => {
  try {
    await connectDB();

    const users = await User.find();
    const emailMap = new Map();
    const duplicates = [];

    // Find duplicates
    for (const user of users) {
      const email = user.email.toLowerCase();
      if (emailMap.has(email)) {
        // Keep the first one, mark others for deletion
        duplicates.push(user._id);
      } else {
        emailMap.set(email, user._id);
      }
    }

    if (duplicates.length > 0) {
      await User.deleteMany({ _id: { $in: duplicates } });
      console.log(`✅ Removed ${duplicates.length} duplicate user(s)`);
    } else {
      console.log('✅ No duplicates found');
    }

    // Show remaining users
    const remaining = await User.find();
    console.log(`\n📊 Total users remaining: ${remaining.length}`);
    remaining.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    process.exit(1);
  }
};

removeDuplicates();
