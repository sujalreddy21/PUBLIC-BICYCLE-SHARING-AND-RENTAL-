const Bicycle = require('../models/Bicycle');
const Station = require('../models/Station');
const Rental = require('../models/Rental');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');

// @desc    1. Bike Availability Report
// @route   GET /api/reports/availability
// @access  Private (Admin, Operations Manager)
exports.getAvailabilityReport = async (req, res, next) => {
  try {
    const totalBikes = await Bicycle.countDocuments();
    const available = await Bicycle.countDocuments({ status: 'Available' });
    const rented = await Bicycle.countDocuments({ status: 'Rented' });
    const reserved = await Bicycle.countDocuments({ status: 'Reserved' });
    const maintenance = await Bicycle.countDocuments({ status: 'Under Maintenance' });
    const inactive = await Bicycle.countDocuments({ status: 'Inactive' });

    // Station-wise breakdown
    const stations = await Station.find().sort({ name: 1 });
    const stationBreakdown = await Promise.all(
      stations.map(async (stn) => {
        const stationBikes = await Bicycle.find({ currentStation: stn._id });
        return {
          stationId: stn._id,
          stationName: stn.name,
          stationCode: stn.code,
          capacity: stn.capacity,
          totalBikes: stationBikes.length,
          available: stationBikes.filter(b => b.status === 'Available').length,
          rented: stationBikes.filter(b => b.status === 'Rented').length,
          reserved: stationBikes.filter(b => b.status === 'Reserved').length,
          maintenance: stationBikes.filter(b => b.status === 'Under Maintenance').length,
          availableDocks: Math.max(0, stn.capacity - stationBikes.length)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBikes,
          available,
          rented,
          reserved,
          maintenance,
          inactive,
          availabilityRate: totalBikes > 0 ? Math.round((available / totalBikes) * 100) : 0
        },
        stationBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    2. Rental History Report
// @route   GET /api/reports/rentals
// @access  Private (Admin, Operations Manager)
exports.getRentalsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter.checkoutTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const rentals = await Rental.find(dateFilter)
      .populate('user', 'name email phone')
      .populate('bicycle', 'bikeCode model')
      .populate('pickupStation', 'name code')
      .populate('returnStation', 'name code')
      .sort({ checkoutTime: -1 });

    const totalRentals = rentals.length;
    const completedRentals = rentals.filter(r => r.rentalStatus === 'Completed').length;
    const activeRentals = rentals.filter(r => r.rentalStatus === 'Active').length;
    const totalDurationMinutes = rentals.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
    const totalRentalRevenue = rentals.reduce((acc, r) => acc + (r.totalCharge || 0), 0);
    const avgDuration = completedRentals > 0 ? Math.round(totalDurationMinutes / completedRentals) : 0;

    // Day-wise grouping for trend chart
    const dailyMap = {};
    rentals.forEach(r => {
      const day = new Date(r.checkoutTime).toISOString().slice(0, 10);
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, count: 0, revenue: 0 };
      }
      dailyMap[day].count += 1;
      dailyMap[day].revenue += r.totalCharge || 0;
    });

    const dailyTrends = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRentals,
          completedRentals,
          activeRentals,
          totalDurationMinutes,
          avgDurationMinutes: avgDuration,
          totalRentalRevenue
        },
        dailyTrends,
        rentals
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    3. Station Utilization Report
// @route   GET /api/reports/stations
// @access  Private (Admin, Operations Manager)
exports.getStationUtilizationReport = async (req, res, next) => {
  try {
    const stations = await Station.find();
    const rentals = await Rental.find();

    const stationStats = await Promise.all(
      stations.map(async (stn) => {
        const bikesCount = await Bicycle.countDocuments({ currentStation: stn._id });
        const pickups = rentals.filter(r => r.pickupStation && r.pickupStation.toString() === stn._id.toString()).length;
        const dropoffs = rentals.filter(r => r.returnStation && r.returnStation.toString() === stn._id.toString()).length;
        const totalTurnover = pickups + dropoffs;
        const occupancyRate = stn.capacity > 0 ? Math.round((bikesCount / stn.capacity) * 100) : 0;

        return {
          id: stn._id,
          name: stn.name,
          code: stn.code,
          capacity: stn.capacity,
          currentBikes: bikesCount,
          occupancyRate,
          pickups,
          dropoffs,
          totalTurnover
        };
      })
    );

    // Sort by turnover
    const sorted = [...stationStats].sort((a, b) => b.totalTurnover - a.totalTurnover);
    const mostUtilized = sorted.slice(0, 3);
    const leastUtilized = [...sorted].reverse().slice(0, 3);

    const overallAvgUtilization =
      stationStats.length > 0
        ? Math.round(stationStats.reduce((sum, s) => sum + s.occupancyRate, 0) / stationStats.length)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        overallAvgUtilization,
        mostUtilized,
        leastUtilized,
        stationStats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    4. Revenue Summary Report
// @route   GET /api/reports/revenue
// @access  Private (Admin, Operations Manager)
exports.getRevenueReport = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'Success' }).populate('user', 'name email');
    const rentals = await Rental.find({ paymentStatus: 'Paid' });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const membershipRevenue = payments
      .filter(p => p.type === 'Membership')
      .reduce((sum, p) => sum + p.amount, 0);
    const rentalRevenue = payments
      .filter(p => p.type === 'Rental')
      .reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyRevenue = payments
      .filter(p => new Date(p.createdAt) >= oneDayAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    const weeklyRevenue = payments
      .filter(p => new Date(p.createdAt) >= oneWeekAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = payments
      .filter(p => new Date(p.createdAt) >= oneMonthAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    // Monthly breakdown for bar chart
    const monthlyDataMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    payments.forEach(p => {
      const d = new Date(p.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: key, rental: 0, membership: 0, total: 0 };
      }
      if (p.type === 'Rental') monthlyDataMap[key].rental += p.amount;
      if (p.type === 'Membership') monthlyDataMap[key].membership += p.amount;
      monthlyDataMap[key].total += p.amount;
    });

    const monthlyBreakdown = Object.values(monthlyDataMap);

    // Payment method breakdown
    const methodBreakdown = {};
    payments.forEach(p => {
      const m = p.paymentMethod || 'Other';
      methodBreakdown[m] = (methodBreakdown[m] || 0) + p.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          dailyRevenue,
          weeklyRevenue,
          monthlyRevenue,
          membershipRevenue,
          rentalRevenue
        },
        monthlyBreakdown,
        paymentMethodBreakdown: Object.keys(methodBreakdown).map(k => ({
          method: k,
          amount: methodBreakdown[k]
        })),
        recentTransactions: payments.slice(-10).reverse()
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Summary Stats (for Admin Dashboard)
// @route   GET /api/reports/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalBikes = await Bicycle.countDocuments();
    const availableBikes = await Bicycle.countDocuments({ status: 'Available' });
    const rentedBikes = await Bicycle.countDocuments({ status: 'Rented' });
    const totalStations = await Station.countDocuments();
    const registeredMembers = await User.countDocuments({ role: 'member' });
    const activeRentals = await Rental.countDocuments({ rentalStatus: 'Active' });
    const maintenanceRequests = await Maintenance.countDocuments({ status: { $ne: 'Completed' } });

    const payments = await Payment.find({ status: 'Success' });
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    // Recent 7 days rentals
    const recentRentals = await Rental.find()
      .populate('user', 'name email')
      .populate('bicycle', 'bikeCode model')
      .populate('pickupStation', 'name')
      .populate('returnStation', 'name')
      .sort({ checkoutTime: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalBikes,
        availableBikes,
        rentedBikes,
        totalStations,
        registeredMembers,
        activeRentals,
        totalRevenue,
        maintenanceRequests,
        recentRentals
      }
    });
  } catch (err) {
    next(err);
  }
};
