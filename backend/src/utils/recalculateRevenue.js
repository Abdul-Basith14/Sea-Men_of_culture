import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const recalculateAllRevenue = async () => {
  try {
    await connectDB();
    console.log('\n🔄 Starting revenue recalculation with new 25% logic...\n');

    // Step 1: Reset all users' financial data
    console.log('📊 Resetting all user financial data...');
    const users = await User.find();
    
    for (const user of users) {
      user.totalProfit = 0;
      user.paymentsDue = [];
      user.paymentsReceivable = [];
      user.pendingPaymentApprovals = [];
      await user.save();
    }
    console.log('✅ User data reset complete\n');

    // Step 2: Get all sold products
    console.log('🛍️  Processing sold products...');
    const soldProducts = await Product.find({ status: 'sold' }).populate('soldBy');
    
    if (soldProducts.length === 0) {
      console.log('ℹ️  No sold products found. Nothing to recalculate.');
      process.exit(0);
    }

    console.log(`📦 Found ${soldProducts.length} sold products\n`);

    // Step 3: Recalculate for each sold product
    for (const product of soldProducts) {
      const sellingPrice = product.sellingPrice;
      const sharePerMember = sellingPrice / 4; // 25% for each of 4 members
      const seller = await User.findById(product.soldBy._id);
      
      if (!seller) {
        console.log(`⚠️  Skipping product ${product.productCode} - seller not found`);
        continue;
      }

      console.log(`Processing ${product.productCode}:`);
      console.log(`  Selling Price: ₹${sellingPrice}`);
      console.log(`  Share per member: ₹${sharePerMember}`);
      console.log(`  Seller: ${seller.name}`);

      // Give seller their 25% share immediately
      seller.totalProfit += sharePerMember;

      // Get all 4 members
      const allMembers = await User.find();
      const otherMembers = allMembers.filter(m => m._id.toString() !== seller._id.toString());

      // Add payment obligations
      otherMembers.forEach(member => {
        seller.paymentsDue.push({
          toMember: member._id,
          amount: sharePerMember
        });

        member.paymentsReceivable.push({
          fromMember: seller._id,
          amount: sharePerMember
        });
      });

      await seller.save();
      
      // Save other members
      for (const member of otherMembers) {
        await member.save();
      }

      console.log(`  ✅ ${seller.name} credited with ₹${sharePerMember}`);
      console.log(`  ✅ Payment obligations created for 3 members\n`);
    }

    // Step 4: Recreate all transactions
    console.log('🔄 Recreating transactions...');
    await Transaction.deleteMany({});

    for (const product of soldProducts) {
      const sellingPrice = product.sellingPrice;
      const sharePerMember = sellingPrice / 4;
      const seller = product.soldBy;
      
      const allMembers = await User.find();
      const otherMembers = allMembers.filter(m => m._id.toString() !== seller._id.toString());

      const transactionPayments = otherMembers.map(member => ({
        fromMember: seller._id,
        toMember: member._id,
        amount: sharePerMember,
        status: 'pending'
      }));

      await Transaction.create({
        productId: product._id,
        seller: seller._id,
        sellingPrice: sellingPrice,
        profitPerMember: sharePerMember,
        payments: transactionPayments
      });
    }
    console.log(`✅ Created ${soldProducts.length} transactions\n`);

    // Step 5: Display summary
    console.log('📊 FINAL SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const updatedUsers = await User.find();
    for (const user of updatedUsers) {
      const totalDue = user.paymentsDue.reduce((sum, p) => sum + p.amount, 0);
      const totalReceivable = user.paymentsReceivable.reduce((sum, p) => sum + p.amount, 0);
      
      console.log(`👤 ${user.name}:`);
      console.log(`   Total Profit (verified): ₹${user.totalProfit}`);
      console.log(`   Payments Due: ₹${totalDue} (to ${user.paymentsDue.length} members)`);
      console.log(`   Payments Receivable: ₹${totalReceivable} (from ${user.paymentsReceivable.length} members)`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Revenue recalculation complete!\n');
    console.log('💡 Notes:');
    console.log('   - All sellers now have only their 25% share in totalProfit');
    console.log('   - All payment obligations reset to "pending" status');
    console.log('   - Members need to complete the payment verification flow again\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during recalculation:', error);
    process.exit(1);
  }
};

recalculateAllRevenue();
