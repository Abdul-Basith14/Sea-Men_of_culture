import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

// @desc    Request payment approval (Payer marks as paid, creates approval request)
// @route   POST /api/payments/request-approval
// @access  Private
export const requestPaymentApproval = async (req, res) => {
  try {
    const { toMemberId, amount } = req.body;
    const fromMemberId = req.user._id;

    // Validate inputs
    if (!toMemberId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient and amount'
      });
    }

    // Get payer (current user)
    const payer = await User.findById(fromMemberId);
    if (!payer) {
      return res.status(404).json({
        success: false,
        message: 'Payer not found'
      });
    }

    // Get receiver
    const receiver = await User.findById(toMemberId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if payer actually owes this amount to receiver
    const paymentDue = payer.paymentsDue.find(
      payment => payment.toMember.toString() === toMemberId.toString() && payment.amount === amount
    );

    if (!paymentDue) {
      return res.status(400).json({
        success: false,
        message: 'Payment obligation not found'
      });
    }

    // Add to receiver's pending approvals
    receiver.pendingPaymentApprovals.push({
      fromMember: fromMemberId,
      amount: amount,
      requestedAt: new Date()
    });
    await receiver.save();

    // Update transaction status to 'approval_requested'
    const transaction = await Transaction.findOne({
      'payments.fromMember': fromMemberId,
      'payments.toMember': toMemberId,
      'payments.amount': amount,
      'payments.status': 'pending'
    });

    if (transaction) {
      const payment = transaction.payments.find(
        p => p.fromMember.toString() === fromMemberId.toString() && 
             p.toMember.toString() === toMemberId.toString() && 
             p.amount === amount &&
             p.status === 'pending'
      );
      
      if (payment) {
        payment.status = 'approval_requested';
        payment.requestedDate = new Date();
        await transaction.save();
      }
    }

    // Get updated users
    const updatedPayer = await User.findById(fromMemberId)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .select('-password');

    const updatedReceiver = await User.findById(toMemberId)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Payment approval request sent',
      data: {
        payer: updatedPayer,
        receiver: updatedReceiver
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve payment (Receiver approves the payment)
// @route   POST /api/payments/approve
// @access  Private
export const approvePayment = async (req, res) => {
  try {
    const { fromMemberId, amount } = req.body;
    const toMemberId = req.user._id;

    // Validate inputs
    if (!fromMemberId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payer and amount'
      });
    }

    // Get receiver (current user)
    const receiver = await User.findById(toMemberId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Get payer
    const payer = await User.findById(fromMemberId);
    if (!payer) {
      return res.status(404).json({
        success: false,
        message: 'Payer not found'
      });
    }

    // Check if approval request exists
    const approvalIndex = receiver.pendingPaymentApprovals.findIndex(
      approval => approval.fromMember.toString() === fromMemberId.toString() && approval.amount === amount
    );

    if (approvalIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Remove from pending approvals
    receiver.pendingPaymentApprovals.splice(approvalIndex, 1);

    // Remove from receiver's paymentsReceivable
    const receivableIndex = receiver.paymentsReceivable.findIndex(
      payment => payment.fromMember.toString() === fromMemberId.toString() && payment.amount === amount
    );
    if (receivableIndex !== -1) {
      receiver.paymentsReceivable.splice(receivableIndex, 1);
    }

    // Add amount to receiver's total profit
    receiver.totalProfit += amount;
    await receiver.save();

    // Remove from payer's paymentsDue
    const dueIndex = payer.paymentsDue.findIndex(
      payment => payment.toMember.toString() === toMemberId.toString() && payment.amount === amount
    );
    if (dueIndex !== -1) {
      payer.paymentsDue.splice(dueIndex, 1);
    }
    await payer.save();

    // Update transaction status to 'paid'
    const transaction = await Transaction.findOne({
      'payments.fromMember': fromMemberId,
      'payments.toMember': toMemberId,
      'payments.amount': amount,
      'payments.status': 'approval_requested'
    });

    if (transaction) {
      const payment = transaction.payments.find(
        p => p.fromMember.toString() === fromMemberId.toString() && 
             p.toMember.toString() === toMemberId.toString() && 
             p.amount === amount &&
             p.status === 'approval_requested'
      );
      
      if (payment) {
        payment.status = 'paid';
        payment.paidDate = new Date();
        await transaction.save();
      }
    }

    // Get updated users
    const updatedPayer = await User.findById(fromMemberId)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .select('-password');

    const updatedReceiver = await User.findById(toMemberId)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('-password');

    res.status(200).json({
      success: true,
      message: `Payment of ₹${amount} approved and added to your profit`,
      data: {
        payer: updatedPayer,
        receiver: updatedReceiver
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject payment approval
// @route   POST /api/payments/reject
// @access  Private
export const rejectPayment = async (req, res) => {
  try {
    const { fromMemberId, amount } = req.body;
    const toMemberId = req.user._id;

    // Get receiver (current user)
    const receiver = await User.findById(toMemberId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if approval request exists
    const approvalIndex = receiver.pendingPaymentApprovals.findIndex(
      approval => approval.fromMember.toString() === fromMemberId.toString() && approval.amount === amount
    );

    if (approvalIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Remove from pending approvals
    receiver.pendingPaymentApprovals.splice(approvalIndex, 1);
    await receiver.save();

    // Update transaction status back to 'pending'
    const transaction = await Transaction.findOne({
      'payments.fromMember': fromMemberId,
      'payments.toMember': toMemberId,
      'payments.amount': amount,
      'payments.status': 'approval_requested'
    });

    if (transaction) {
      const payment = transaction.payments.find(
        p => p.fromMember.toString() === fromMemberId.toString() && 
             p.toMember.toString() === toMemberId.toString() && 
             p.amount === amount &&
             p.status === 'approval_requested'
      );
      
      if (payment) {
        payment.status = 'pending';
        payment.requestedDate = null;
        await transaction.save();
      }
    }

    const updatedReceiver = await User.findById(toMemberId)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Payment approval rejected',
      data: updatedReceiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all pending payment approvals for current user
// @route   GET /api/payments/pending-approvals
// @access  Private
export const getPendingApprovals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage')
      .select('pendingPaymentApprovals');

    res.status(200).json({
      success: true,
      count: user.pendingPaymentApprovals.length,
      data: user.pendingPaymentApprovals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
