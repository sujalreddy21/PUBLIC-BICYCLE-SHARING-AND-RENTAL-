const Reservation = require('../models/Reservation');
const Bicycle = require('../models/Bicycle');
const Rental = require('../models/Rental');
const { syncStationStats } = require('./stationController');

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    // Members can only see their own reservations
    if (req.user.role === 'member') {
      query.user = req.user._id;
    } else if (req.user.role === 'station_attendant' && req.user.assignedStation) {
      query.station = req.user.assignedStation;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .populate('bicycle', 'bikeCode model type batteryLevel')
      .populate('station', 'name code address city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create bicycle reservation
// @route   POST /api/reservations
// @access  Private (Member, Attendant, Admin)
exports.createReservation = async (req, res, next) => {
  try {
    const { bicycleId, notes } = req.body;
    const targetUserId = req.body.userId && ['admin', 'station_attendant'].includes(req.user.role)
      ? req.body.userId
      : req.user._id;

    // Check if user has an existing active reservation
    const existingActiveReservation = await Reservation.findOne({
      user: targetUserId,
      status: 'Active'
    });

    if (existingActiveReservation) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active bicycle reservation. Please fulfill or cancel it first.'
      });
    }

    // Check if user has an existing active rental
    const activeRental = await Rental.findOne({
      user: targetUserId,
      rentalStatus: 'Active'
    });

    if (activeRental) {
      return res.status(400).json({
        success: false,
        message: 'You currently have an ongoing bicycle rental. Please return it before making a new reservation.'
      });
    }

    const bike = await Bicycle.findById(bicycleId);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bicycle not found'
      });
    }

    if (bike.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Bicycle is currently ${bike.status} and cannot be reserved.`
      });
    }

    const reservationCode = 'RSV-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
    const reservedAt = new Date();
    const expiresAt = new Date(reservedAt.getTime() + 30 * 60 * 1000); // 30 minutes validity

    const reservation = await Reservation.create({
      reservationCode,
      user: targetUserId,
      bicycle: bike._id,
      station: bike.currentStation,
      reservedAt,
      expiresAt,
      status: 'Active',
      notes: notes || ''
    });

    // Mark bike as Reserved
    bike.status = 'Reserved';
    await bike.save();
    await syncStationStats(bike.currentStation);

    const populated = await Reservation.findById(reservation._id)
      .populate('user', 'name email phone')
      .populate('bicycle', 'bikeCode model type batteryLevel')
      .populate('station', 'name code address');

    res.status(201).json({
      success: true,
      message: 'Bicycle reserved successfully! Please unlock within 30 minutes.',
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Member can only cancel their own reservation
    if (
      req.user.role === 'member' &&
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    if (reservation.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel reservation in '${reservation.status}' status`
      });
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    // Release bicycle back to Available
    const bike = await Bicycle.findById(reservation.bicycle);
    if (bike && bike.status === 'Reserved') {
      bike.status = 'Available';
      await bike.save();
      await syncStationStats(bike.currentStation);
    }

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};
