const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get all membership plans
// @route   GET /api/memberships
// @access  Public / Private
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find().sort({ price: 1 });
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single plan
// @route   GET /api/memberships/:id
// @access  Public / Private
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create membership plan
// @route   POST /api/memberships
// @access  Private (Admin only)
exports.createPlan = async (req, res, next) => {
  try {
    const { name, code, price, durationDays, freeMinutesPerRide, hourlyRateAfterFree, description, features } = req.body;

    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price and duration'
      });
    }

    const planCode = code || name.substring(0, 4).toUpperCase();

    const plan = await MembershipPlan.create({
      name,
      code: planCode,
      price: Number(price),
      durationDays: Number(durationDays),
      freeMinutesPerRide: freeMinutesPerRide !== undefined ? Number(freeMinutesPerRide) : 30,
      hourlyRateAfterFree: hourlyRateAfterFree !== undefined ? Number(hourlyRateAfterFree) : 20,
      description: description || '',
      features: features || []
    });

    res.status(201).json({
      success: true,
      message: 'Membership plan created successfully',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update membership plan
// @route   PUT /api/memberships/:id
// @access  Private (Admin only)
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Membership plan updated successfully',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete membership plan
// @route   DELETE /api/memberships/:id
// @access  Private (Admin only)
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Membership plan deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Subscribe / Purchase membership plan
// @route   POST /api/memberships/subscribe
// @access  Private (Member)
exports.subscribePlan = async (req, res, next) => {
  try {
    const { planId, paymentMethod } = req.body;

    const plan = await MembershipPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive membership plan'
      });
    }

    const user = await User.findById(req.user._id);

    // Calculate dates
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

    user.membership = {
      plan: plan._id,
      startDate,
      expiryDate,
      status: 'Active'
    };

    await user.save();

    // Create payment record
    const payment = await Payment.create({
      paymentId: 'PAY-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900),
      user: user._id,
      membershipPlan: plan._id,
      type: 'Membership',
      amount: plan.price,
      paymentMethod: paymentMethod || 'UPI',
      status: 'Success'
    });

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
      membership: user.membership,
      payment
    });
  } catch (err) {
    next(err);
  }
};
