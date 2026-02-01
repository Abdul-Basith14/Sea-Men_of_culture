import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create 4 members with temporary passwords
    const members = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@business.com',
        password: 'temp123', // Temporary password - user will change on first login
        profileImage: 'https://via.placeholder.com/150/4A0E0E/FFFFFF?text=RS',
        isFirstLogin: true
      },
      {
        name: 'Priya Patel',
        email: 'priya@business.com',
        password: 'temp123',
        profileImage: 'https://via.placeholder.com/150/5C1A1A/FFFFFF?text=PP',
        isFirstLogin: true
      },
      {
        name: 'Amit Kumar',
        email: 'amit@business.com',
        password: 'temp123',
        profileImage: 'https://via.placeholder.com/150/6B1F1F/FFFFFF?text=AK',
        isFirstLogin: true
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@business.com',
        password: 'temp123',
        profileImage: 'https://via.placeholder.com/150/4A0E0E/FFFFFF?text=SR',
        isFirstLogin: true
      }
    ];

    const createdUsers = await User.create(members);
    
    console.log('✅ Successfully created 4 members:');
    createdUsers.forEach(user => {
      console.log(`   📧 ${user.email} - Password: temp123 (Change on first login)`);
    });

    console.log('\n🎉 Database seeded successfully!');
    console.log('👉 Users can now login with their email and password "temp123"');
    console.log('👉 They will be prompted to set a new password on first login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
