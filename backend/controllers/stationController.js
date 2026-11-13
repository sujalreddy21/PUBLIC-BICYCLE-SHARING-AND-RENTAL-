const Station = require('../models/Station');
const Bicycle = require('../models/Bicycle');

// Helper to sync station bicycle counts
const syncStationStats = async (stationId) => {
  if (!stationId) return;
  const totalBikes = await Bicycle.countDocuments({ currentStation: stationId });
  const availableBikes = await Bicycle.countDocuments({
    currentStation: stationId,
    status: 'Available'
  });
  await Station.findByIdAndUpdate(stationId, {
    occupiedSlotsCount: totalBikes,
    availableBikesCount: availableBikes
  });
};

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public / Private
exports.getStations = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const stations = await Station.find(query).sort({ name: 1 });

    // Sync stats dynamically for accuracy
    const updatedStations = await Promise.all(
      stations.map(async (stn) => {
        const totalBikes = await Bicycle.countDocuments({ currentStation: stn._id });
        const availableBikes = await Bicycle.countDocuments({
          currentStation: stn._id,
          status: 'Available'
        });
        const rentedFromHere = await Bicycle.countDocuments({
          currentStation: stn._id,
          status: 'Rented'
        });

        const stnObj = stn.toObject();
        stnObj.occupiedSlotsCount = totalBikes;
        stnObj.availableBikesCount = availableBikes;
        stnObj.availableSlots = Math.max(0, stn.capacity - totalBikes);
        stnObj.rentedBikesCount = rentedFromHere;
        return stnObj;
      })
    );

    res.status(200).json({
      success: true,
      count: updatedStations.length,
      data: updatedStations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public / Private
exports.getStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    const bikes = await Bicycle.find({ currentStation: station._id });
    const availableBikes = bikes.filter(b => b.status === 'Available');

    res.status(200).json({
      success: true,
      data: {
        ...station.toObject(),
        bikes,
        availableBikesCount: availableBikes.length,
        occupiedSlotsCount: bikes.length,
        availableSlots: Math.max(0, station.capacity - bikes.length)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new station
// @route   POST /api/stations
// @access  Private (Admin only)
exports.createStation = async (req, res, next) => {
  try {
    const { name, code, address, city, capacity, coordinates, contactPhone } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide station name and capacity'
      });
    }

    const stationCode = code || 'STN-' + Math.floor(100 + Math.random() * 900);

    const station = await Station.create({
      name,
      code: stationCode,
      address: address || `${name}, Central Hub`,
      city: city || 'Metro City',
      capacity: Number(capacity),
      coordinates: coordinates || { lat: 17.3850, lng: 78.4867 },
      contactPhone: contactPhone || '+91 98765 43210'
    });

    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      data: station
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private (Admin, Operations Manager)
exports.updateStation = async (req, res, next) => {
  try {
    const { name, code, address, city, capacity, status, coordinates, contactPhone } = req.body;

    let station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    if (capacity) {
      const currentBikeCount = await Bicycle.countDocuments({ currentStation: station._id });
      if (Number(capacity) < currentBikeCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below current bike count (${currentBikeCount})`
        });
      }
      station.capacity = Number(capacity);
    }

    if (name) station.name = name;
    if (code) station.code = code;
    if (address) station.address = address;
    if (city) station.city = city;
    if (status) station.status = status;
    if (coordinates) station.coordinates = coordinates;
    if (contactPhone) station.contactPhone = contactPhone;

    await station.save();
    await syncStationStats(station._id);

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private (Admin only)
exports.deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    const bikesCount = await Bicycle.countDocuments({ currentStation: station._id });
    if (bikesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete station. It currently has ${bikesCount} assigned bicycle(s). Please reassign them first.`
      });
    }

    await Station.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.syncStationStats = syncStationStats;
