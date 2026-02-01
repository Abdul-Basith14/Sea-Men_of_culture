import User from '../models/User.js';
import Product from '../models/Product.js';
import Project from '../models/Project.js';
import uploadToCloudinary from '../utils/imageUpload.js';

// @desc    Get all users/members
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;

    // Handle profile image upload
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'profit-tracker/profiles');
      user.profileImage = imageUrl;
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user financial summary
// @route   GET /api/users/:id/financials
// @access  Private
export const getUserFinancials = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('name email totalProfit paymentsDue paymentsReceivable pendingPaymentApprovals');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate revenue generated (sum of selling prices of products sold by this user)
    const productsSoldByUser = await Product.find({ soldBy: user._id, status: 'sold' });
    const revenueGenerated = productsSoldByUser.reduce((sum, p) => sum + p.sellingPrice, 0);

    // Calculate totals
    const totalDue = user.paymentsDue.reduce((sum, payment) => sum + payment.amount, 0);
    const totalReceivable = user.paymentsReceivable.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPendingApprovals = user.pendingPaymentApprovals.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        totalProfit: user.totalProfit,
        revenueGenerated,
        totalDue,
        totalReceivable,
        totalPendingApprovals,
        paymentsDue: user.paymentsDue,
        paymentsReceivable: user.paymentsReceivable,
        pendingPaymentApprovals: user.pendingPaymentApprovals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get project-wise analytics for a user
// @route   GET /api/users/:id/project-analytics
// @access  Private
export const getProjectAnalytics = async (req, res) => {
  try {
    const userId = req.params.id;
    const projects = await Project.find();
    
    const analytics = await Promise.all(projects.map(async (project) => {
      // Find products in this project sold by the user
      const productsSoldByUser = await Product.find({ 
        projectId: project._id, 
        soldBy: userId, 
        status: 'sold' 
      });
      
      const userRevenue = productsSoldByUser.reduce((sum, p) => sum + p.sellingPrice, 0);
      const userProfit = productsSoldByUser.reduce((sum, p) => sum + p.profit, 0);

      // Total project revenue (all products sold in this project)
      const allProductsSoldInProject = await Product.find({ 
        projectId: project._id, 
        status: 'sold' 
      });
      const totalProjectRevenue = allProductsSoldInProject.reduce((sum, p) => sum + p.sellingPrice, 0);

      return {
        _id: project._id,
        projectCode: project.projectCode,
        projectName: project.projectName,
        totalProducts: project.totalProducts,
        productsSold: project.productsSold,
        productsRemaining: project.totalProducts - project.productsSold,
        status: project.status,
        userRevenue,
        userProfit,
        totalProjectRevenue
      };
    }));

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset user financial data (totalProfit, payments)
// @route   POST /api/users/:id/reset
// @access  Private
export const resetUserFinancials = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Reset all financial fields
    user.totalProfit = 0;
    user.paymentsDue = [];
    user.paymentsReceivable = [];
    user.pendingPaymentApprovals = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User financial data reset successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
