const User = require('../models/User');

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Private (Admin, Operations Manager)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status !== undefined && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('membership.plan')
      .populate('assignedStation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    // If not admin/ops, member can only see own profile
    if (
      !['admin', 'operations_manager'].includes(req.user.role) &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user profile'
      });
    }

    const user = await User.findById(req.params.id)
      .populate('membership.plan')
      .populate('assignedStation');

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
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, phone, assignedStation, isActive } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (assignedStation !== undefined) user.assignedStation = assignedStation || null;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Topup user wallet balance
// @route   POST /api/users/wallet-topup
// @access  Private
exports.topupWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const topupAmount = Number(amount);

    if (!topupAmount || topupAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid top-up amount'
      });
    }

    const user = await User.findById(req.user._id);
    user.walletBalance = (user.walletBalance || 0) + topupAmount;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully credited ₹${topupAmount} to wallet`,
      walletBalance: user.walletBalance
    });
  } catch (err) {
    next(err);
  }
};
