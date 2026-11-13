const Bicycle = require('../models/Bicycle');
const Station = require('../models/Station');
const { syncStationStats } = require('./stationController');

// @desc    Get all bicycles with filtering and search
// @route   GET /api/bikes
// @access  Public / Private
exports.getBikes = async (req, res, next) => {
  try {
    const { station, status, type, search } = req.query;
    let query = {};

    if (station && station !== 'all') {
      query.currentStation = station;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { bikeCode: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { conditionNotes: { $regex: search, $options: 'i' } }
      ];
    }

    const bikes = await Bicycle.find(query)
      .populate('currentStation', 'name code address capacity city')
      .sort({ bikeCode: 1 });

    res.status(200).json({
      success: true,
      count: bikes.length,
      data: bikes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single bicycle
// @route   GET /api/bikes/:id
// @access  Public / Private
exports.getBike = async (req, res, next) => {
  try {
    const bike = await Bicycle.findById(req.params.id)
      .populate('currentStation', 'name code address capacity city');

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bicycle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bike
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new bicycle
// @route   POST /api/bikes
// @access  Private (Admin, Operations Manager)
exports.createBike = async (req, res, next) => {
  try {
    const { bikeCode, model, type, currentStation, batteryLevel, conditionNotes } = req.body;

    if (!currentStation) {
      return res.status(400).json({
        success: false,
        message: 'A bicycle must belong to a valid station'
      });
    }

    const targetStation = await Station.findById(currentStation);
    if (!targetStation) {
      return res.status(404).json({
        success: false,
        message: 'Target station does not exist'
      });
    }

    // Check station capacity constraint
    const currentOccupancy = await Bicycle.countDocuments({ currentStation: targetStation._id });
    if (currentOccupancy >= targetStation.capacity) {
      return res.status(400).json({
        success: false,
        message: `Station capacity exceeded! Station '${targetStation.name}' has capacity ${targetStation.capacity} and currently holds ${currentOccupancy} bicycles.`
      });
    }

    const generatedCode = bikeCode || 'BIK-' + Math.floor(100 + Math.random() * 900);

    const bike = await Bicycle.create({
      bikeCode: generatedCode,
      model: model || 'Urban Cruiser 2.0',
      type: type || 'Standard',
      currentStation,
      status: 'Available',
      batteryLevel: batteryLevel !== undefined ? Number(batteryLevel) : 100,
      conditionNotes: conditionNotes || 'Brand new condition'
    });

    await syncStationStats(currentStation);

    res.status(201).json({
      success: true,
      message: 'Bicycle added successfully',
      data: bike
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update bicycle
// @route   PUT /api/bikes/:id
// @access  Private (Admin, Operations Manager, Station Attendant)
exports.updateBike = async (req, res, next) => {
  try {
    const { model, type, currentStation, status, batteryLevel, conditionNotes } = req.body;

    let bike = await Bicycle.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bicycle not found'
      });
    }

    const oldStationId = bike.currentStation;

    // If changing station, check capacity of new station
    if (currentStation && currentStation.toString() !== oldStationId.toString()) {
      const newStation = await Station.findById(currentStation);
      if (!newStation) {
        return res.status(404).json({
          success: false,
          message: 'Selected target station does not exist'
        });
      }

      const newStationOccupancy = await Bicycle.countDocuments({ currentStation: newStation._id });
      if (newStationOccupancy >= newStation.capacity) {
        return res.status(400).json({
          success: false,
          message: `Station '${newStation.name}' is already at maximum capacity (${newStation.capacity})`
        });
      }

      bike.currentStation = currentStation;
    }

    if (model) bike.model = model;
    if (type) bike.type = type;
    if (status) bike.status = status;
    if (batteryLevel !== undefined) bike.batteryLevel = Number(batteryLevel);
    if (conditionNotes) bike.conditionNotes = conditionNotes;

    await bike.save();

    await syncStationStats(oldStationId);
    if (currentStation && currentStation.toString() !== oldStationId.toString()) {
      await syncStationStats(currentStation);
    }

    res.status(200).json({
      success: true,
      message: 'Bicycle updated successfully',
      data: bike
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete bicycle
// @route   DELETE /api/bikes/:id
// @access  Private (Admin only)
exports.deleteBike = async (req, res, next) => {
  try {
    const bike = await Bicycle.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bicycle not found'
      });
    }

    if (['Rented', 'Reserved'].includes(bike.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete bicycle currently in '${bike.status}' status`
      });
    }

    const stationId = bike.currentStation;
    await Bicycle.findByIdAndDelete(req.params.id);
    await syncStationStats(stationId);

    res.status(200).json({
      success: true,
      message: 'Bicycle deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
