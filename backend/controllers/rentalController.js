const Rental = require('../models/Rental');
const Bicycle = require('../models/Bicycle');
const Station = require('../models/Station');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const { syncStationStats } = require('./stationController');

// Helper to calculate rental fare
const calculateFare = (durationMinutes, userMembershipPlan) => {
  const baseFare = 20; // Default flat unlocked base fare
  let freeMinutes = 0;
  let hourlyRate = 20;
  let discountAmount = 0;

  if (userMembershipPlan && userMembershipPlan.isActive) {
    freeMinutes = userMembershipPlan.freeMinutesPerRide || 30;
    hourlyRate = userMembershipPlan.hourlyRateAfterFree || 15;
    discountAmount = 10; // Member base discount
  }

  const billableMinutes = Math.max(0, durationMinutes - freeMinutes);
  const durationFare = Math.ceil(billableMinutes / 30) * (hourlyRate / 2);
  const total = Math.max(0, baseFare + durationFare - discountAmount);

  return {
    baseFare,
    durationFare,
    discountAmount,
    totalCharge: total
  };
};

// @desc    Get all rentals with filters
// @route   GET /api/rentals
// @access  Private
exports.getRentals = async (req, res, next) => {
  try {
    const { status, bicycle, station, search } = req.query;
    let query = {};

    // Members can only see their own rentals
    if (req.user.role === 'member') {
      query.user = req.user._id;
    } else if (req.user.role === 'station_attendant' && req.user.assignedStation) {
      // Attendants see rentals picked up or returned at their station
      query.$or = [
        { pickupStation: req.user.assignedStation },
        { returnStation: req.user.assignedStation }
      ];
    }

    if (status && status !== 'all') {
      query.rentalStatus = status;
    }

    if (bicycle) {
      query.bicycle = bicycle;
    }

    if (station && station !== 'all') {
      query.$or = [
        { pickupStation: station },
        { returnStation: station }
      ];
    }

    let rentals = await Rental.find(query)
      .populate('user', 'name email phone role')
      .populate('bicycle', 'bikeCode model type batteryLevel')
      .populate('pickupStation', 'name code address city')
      .populate('returnStation', 'name code address city')
      .sort({ checkoutTime: -1 });

    if (search) {
      rentals = rentals.filter(r =>
        (r.rentalId && r.rentalId.toLowerCase().includes(search.toLowerCase())) ||
        (r.user && r.user.name && r.user.name.toLowerCase().includes(search.toLowerCase())) ||
        (r.bicycle && r.bicycle.bikeCode && r.bicycle.bikeCode.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single rental details
// @route   GET /api/rentals/:id
// @access  Private
exports.getRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('user', 'name email phone role membership')
      .populate('bicycle', 'bikeCode model type batteryLevel')
      .populate('pickupStation', 'name code address city')
      .populate('returnStation', 'name code address city');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental record not found'
      });
    }

    // Role check: Member can only view own rental
    if (
      req.user.role === 'member' &&
      rental.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this rental record'
      });
    }

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Checkout bicycle
// @route   POST /api/rentals/checkout
// @access  Private (Member, Station Attendant, Admin)
exports.checkoutRental = async (req, res, next) => {
  try {
    const { bicycleId, memberId } = req.body;

    // Target user is memberId if checked out by attendant/admin, otherwise logged-in user
    const targetUserId = (memberId && ['admin', 'operations_manager', 'station_attendant'].includes(req.user.role))
      ? memberId
      : req.user._id;

    const user = await User.findById(targetUserId).populate('membership.plan');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if user already has an active rental
    const activeRental = await Rental.findOne({
      user: targetUserId,
      rentalStatus: 'Active'
    });

    if (activeRental) {
      return res.status(400).json({
        success: false,
        message: `Member already has an active rental (${activeRental.rentalId}). Please return it first.`
      });
    }

    const bike = await Bicycle.findById(bicycleId).populate('currentStation');
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bicycle not found'
      });
    }

    // If attendant, verify if bike is at their assigned station
    if (req.user.role === 'station_attendant' && req.user.assignedStation) {
      if (bike.currentStation._id.toString() !== req.user.assignedStation.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Attendant can only issue bicycles from their assigned station'
        });
      }
    }

    // Check bike availability
    if (bike.status === 'Reserved') {
      // Allowed if this specific user holds the active reservation
      const userReservation = await Reservation.findOne({
        bicycle: bike._id,
        user: targetUserId,
        status: 'Active'
      });

      if (!userReservation) {
        return res.status(400).json({
          success: false,
          message: 'This bicycle is currently reserved by another member.'
        });
      }

      // Mark reservation as fulfilled
      userReservation.status = 'Fulfilled';
      await userReservation.save();
    } else if (bike.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Bicycle is currently ${bike.status} and cannot be rented.`
      });
    }

    // Generate unique Rental ID: RNT-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    const rentalId = `RNT-${dateStr}-${randStr}`;

    const rental = await Rental.create({
      rentalId,
      user: targetUserId,
      bicycle: bike._id,
      pickupStation: bike.currentStation._id,
      checkoutTime: new Date(),
      baseFare: 20,
      rentalStatus: 'Active',
      paymentStatus: 'Pending'
    });

    // Update bike status to Rented
    bike.status = 'Rented';
    bike.totalRides = (bike.totalRides || 0) + 1;
    await bike.save();

    // Increment user rides
    user.totalRides = (user.totalRides || 0) + 1;
    await user.save();

    await syncStationStats(bike.currentStation._id);

    const populatedRental = await Rental.findById(rental._id)
      .populate('user', 'name email phone')
      .populate('bicycle', 'bikeCode model type batteryLevel')
      .populate('pickupStation', 'name code address city');

    res.status(201).json({
      success: true,
      message: `Bicycle ${bike.bikeCode} checked out successfully! Rental ID: ${rentalId}`,
      data: populatedRental
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Return bicycle and process charges
// @route   POST /api/rentals/return
// @access  Private (Member, Station Attendant, Admin)
exports.returnRental = async (req, res, next) => {
  try {
    const { rentalId, returnStationId, paymentMethod, conditionNotes } = req.body;

    let rental;
    if (rentalId) {
      rental = await Rental.findOne({ rentalId, rentalStatus: 'Active' });
    } else {
      // Find user's active rental
      rental = await Rental.findOne({ user: req.user._id, rentalStatus: 'Active' });
    }

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'No active rental found to return.'
      });
    }

    // If attendant, default return station to their assigned station
    const targetStationId = returnStationId ||
      (req.user.role === 'station_attendant' ? req.user.assignedStation : rental.pickupStation);

    if (!targetStationId) {
      return res.status(400).json({
        success: false,
        message: 'Return station is required'
      });
    }

    const returnStation = await Station.findById(targetStationId);
    if (!returnStation) {
      return res.status(404).json({
        success: false,
        message: 'Return station not found'
      });
    }

    // Check station capacity constraint: Station must not exceed max capacity!
    const currentOccupancy = await Bicycle.countDocuments({ currentStation: returnStation._id });
    if (currentOccupancy >= returnStation.capacity) {
      return res.status(400).json({
        success: false,
        message: `Station '${returnStation.name}' is full (${currentOccupancy}/${returnStation.capacity} docks occupied). Please choose another nearby station.`
      });
    }

    const bike = await Bicycle.findById(rental.bicycle);
    const user = await User.findById(rental.user).populate('membership.plan');

    const returnTime = new Date();
    const durationMinutes = Math.max(1, Math.round((returnTime - new Date(rental.checkoutTime)) / (1000 * 60)));

    // Calculate fare based on membership
    const { baseFare, durationFare, discountAmount, totalCharge } = calculateFare(
      durationMinutes,
      user.membership && user.membership.status === 'Active' ? user.membership.plan : null
    );

    // Update rental record
    rental.returnStation = returnStation._id;
    rental.returnTime = returnTime;
    rental.durationMinutes = durationMinutes;
    rental.baseFare = baseFare;
    rental.durationFare = durationFare;
    rental.discountAmount = discountAmount;
    rental.totalCharge = totalCharge;
    rental.paymentStatus = 'Paid';
    rental.rentalStatus = 'Completed';
    await rental.save();

    // Create payment transaction
    if (totalCharge > 0) {
      await Payment.create({
        paymentId: 'PAY-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900),
        user: user._id,
        rental: rental._id,
        type: 'Rental',
        amount: totalCharge,
        paymentMethod: paymentMethod || 'Wallet',
        status: 'Success'
      });

      // Deduct from wallet if available
      if (paymentMethod === 'Wallet' && user.walletBalance >= totalCharge) {
        user.walletBalance = Math.max(0, user.walletBalance - totalCharge);
        await user.save();
      }
    }

    // Update bicycle status and station
    if (bike) {
      bike.status = 'Available';
      bike.currentStation = returnStation._id;
      // Add simulated distance ~ 12km/hr
      const distanceAdded = Number(((durationMinutes / 60) * 12).toFixed(1));
      bike.totalDistanceKm = (bike.totalDistanceKm || 0) + distanceAdded;
      if (conditionNotes) {
        bike.conditionNotes = conditionNotes;
      }
      await bike.save();
    }

    // Sync station inventories
    await syncStationStats(rental.pickupStation);
    await syncStationStats(returnStation._id);

    const receipt = await Rental.findById(rental._id)
      .populate('user', 'name email phone')
      .populate('bicycle', 'bikeCode model type')
      .populate('pickupStation', 'name code address')
      .populate('returnStation', 'name code address');

    res.status(200).json({
      success: true,
      message: `Bicycle successfully returned to ${returnStation.name}! Total charge: ₹${totalCharge}`,
      data: receipt
    });
  } catch (err) {
    next(err);
  }
};
