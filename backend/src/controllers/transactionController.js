import Transaction from '../models/Transaction.js';

// @desc    Get all transactions (Ledger)
// @route   GET /api/transactions
// @access  Private
export const getAllTransactions = async (req, res) => {
  try {
    const { sellerId, productId, status } = req.query;
    
    const query = {};
    if (sellerId) query.seller = sellerId;
    if (productId) query.productId = productId;
    if (status) query['payments.status'] = status;

    const transactions = await Transaction.find(query)
      .populate('productId', 'projectName projectCode')
      .populate('seller', 'name email profileImage')
      .populate('payments.fromMember', 'name')
      .populate('payments.toMember', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transactions for a specific member
// @route   GET /api/transactions/member/:id
// @access  Private
export const getMemberTransactions = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    const transactions = await Transaction.find({
      $or: [
        { seller: memberId },
        { 'payments.fromMember': memberId },
        { 'payments.toMember': memberId }
      ]
    })
    .populate('productId', 'projectName projectCode')
    .populate('seller', 'name email profileImage')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
