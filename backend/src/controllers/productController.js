import Product from '../models/Product.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import generateUniqueCode from '../utils/codeGenerator.js';
import uploadToCloudinary from '../utils/imageUpload.js';

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { projectId, costPrice, sellingPrice, status } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Generate unique product code
    const productCode = await generateUniqueCode(Product, 'productCode');

    // Handle image upload
    let productImage;
    if (req.file) {
      productImage = await uploadToCloudinary(req.file.buffer, 'profit-tracker/products');
    }

    const product = await Product.create({
      productCode,
      projectId,
      productImage,
      costPrice: costPrice || 0,
      sellingPrice: sellingPrice || 0,
      status: status || 'not_sold'
    });

    // Increment project totalProducts
    project.totalProducts += 1;
    await project.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('projectId', 'projectName projectCode');

    res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getAllProducts = async (req, res) => {
  try {
    const { search, status, projectId } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by project
    if (projectId) {
      query.projectId = projectId;
    }

    // Search by product code or project code
    if (search) {
      query.productCode = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('projectId', 'projectName projectCode')
      .populate('soldBy', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('projectId', 'projectName projectCode')
      .populate('soldBy', 'name email profileImage');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { costPrice, sellingPrice } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;

    // Handle image upload
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'profit-tracker/products');
      product.productImage = imageUrl;
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('projectId', 'projectName projectCode')
      .populate('soldBy', 'name email profileImage');

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is already sold
    if (product.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a sold product'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark product as sold (CRITICAL WORKFLOW)
// @route   PATCH /api/products/:id/sell
// @access  Private
export const markProductAsSold = async (req, res) => {
  try {
    const { sellingPrice, soldBy } = req.body;

    // Validate inputs
    if (!sellingPrice || sellingPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid selling price'
      });
    }

    if (!soldBy) {
      return res.status(400).json({
        success: false,
        message: 'Please specify who sold the product'
      });
    }

    // Get product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already sold
    if (product.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Product is already sold'
      });
    }

    // Calculate profit and distribution
    const profit = sellingPrice - product.costPrice;
    const sharePerMember = sellingPrice / 4; // Share revenue equally (25% each)

    // Update product
    product.sellingPrice = sellingPrice;
    product.status = 'sold';
    product.soldBy = soldBy;
    product.soldDate = new Date();
    product.profit = profit;
    await product.save();

    // Get all 4 members
    const allMembers = await User.find();
    if (allMembers.length !== 4) {
      return res.status(500).json({
        success: false,
        message: 'System requires exactly 4 members'
      });
    }

    // Get seller
    const seller = await User.findById(soldBy);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Update seller's total profit - ONLY their 25% share
    seller.totalProfit += sharePerMember;

    // Get other 3 members
    const otherMembers = allMembers.filter(member => member._id.toString() !== soldBy.toString());

    // Add payment obligations to seller (seller owes other 3 members their share of revenue)
    otherMembers.forEach(member => {
      seller.paymentsDue.push({
        toMember: member._id,
        amount: sharePerMember
      });
    });

    await seller.save();

    // Update other 3 members' receivables
    const transactionPayments = [];
    
    for (const member of otherMembers) {
      // Add to paymentsReceivable
      member.paymentsReceivable.push({
        fromMember: seller._id,
        amount: sharePerMember
      });
      await member.save();

      // Prepare transaction payment record
      transactionPayments.push({
        fromMember: seller._id,
        toMember: member._id,
        amount: sharePerMember,
        status: 'pending'
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      productId: product._id,
      seller: seller._id,
      sellingPrice,
      profitPerMember: sharePerMember, // Rename for consistency in UI or keep as is
      payments: transactionPayments
    });

    // Update project's sold count
    const project = await Project.findById(product.projectId);
    project.productsSold += 1;

    // Auto-complete project if all products sold
    if (project.productsSold >= project.totalProducts) {
      project.status = 'completed';
    }

    await project.save();

    // Get updated data for response
    const updatedProduct = await Product.findById(product._id)
      .populate('projectId', 'projectName projectCode')
      .populate('soldBy', 'name email profileImage');

    const updatedUsers = await User.find()
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .select('-password');

    res.status(200).json({
      success: true,
      message: `Product sold! Profit: ₹${profit}. Each member gets ₹${sharePerMember}`,
      data: {
        product: updatedProduct,
        project,
        transaction,
        users: updatedUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
