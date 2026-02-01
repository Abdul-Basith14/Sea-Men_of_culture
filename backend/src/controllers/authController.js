import User from '../models/User.js';

// @desc    Register new user (admin only for now)
// @route   POST /api/auth/register
// @access  Public (will be protected later)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isFirstLogin: user.isFirstLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user (passwordless - only first 4 emails allowed)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Check for user
    let user = await User.findOne({ email });

    if (!user) {
      // Check if we have less than 4 allowed users
      const allowedCount = await User.countDocuments({ isAllowed: true });
      
      if (allowedCount >= 4) {
        return res.status(403).json({
          success: false,
          message: 'Maximum number of users reached. Only the first 4 registered emails are allowed.'
        });
      }

      // Create new user (first 4 are automatically allowed)
      user = await User.create({
        name: email.split('@')[0],
        email,
        isAllowed: true,
        isFirstLogin: true
      });
    } else if (!user.isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the first 4 registered emails are allowed.'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isFirstLogin: user.isFirstLogin,
        isAllowed: user.isAllowed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password on first login
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);

    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isFirstLogin: user.isFirstLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('paymentsDue.toMember', 'name email profileImage')
      .populate('paymentsReceivable.fromMember', 'name email profileImage')
      .populate('pendingPaymentApprovals.fromMember', 'name email profileImage');

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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
