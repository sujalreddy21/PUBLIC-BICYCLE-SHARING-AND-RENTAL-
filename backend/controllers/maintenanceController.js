const Maintenance = require('../models/Maintenance');
const Bicycle = require('../models/Bicycle');
const { syncStationStats } = require('./stationController');

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private (Admin, Operations Manager, Station Attendant)
exports.getMaintenanceList = async (req, res, next) => {
  try {
    const { status, priority, bicycle } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (bicycle) {
      query.bicycle = bicycle;
    }

    const records = await Maintenance.find(query)
      .populate('bicycle', 'bikeCode model currentStation status')
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Report damaged bicycle / Create maintenance request
// @route   POST /api/maintenance
// @access  Private
exports.createMaintenance = async (req, res, next) => {
  try {
    const { bicycleId, issueType, description, priority, assignedTo } = req.body;

    if (!bicycleId || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Bicycle ID, issue type and description are required'
      });
    }

    const bike = await Bicycle.findById(bicycleId);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bicycle not found'
      });
    }

    const maintenanceCode = 'MNT-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

    const maintenance = await Maintenance.create({
      maintenanceCode,
      bicycle: bike._id,
      reportedBy: req.user._id,
      issueType,
      description,
      priority: priority || 'Medium',
      assignedTo: assignedTo || 'Technical Support Team',
      status: 'Pending'
    });

    // Update bicycle status to Under Maintenance
    bike.status = 'Under Maintenance';
    bike.conditionNotes = `Under Maintenance: ${issueType}`;
    await bike.save();

    await syncStationStats(bike.currentStation);

    const populated = await Maintenance.findById(maintenance._id)
      .populate('bicycle', 'bikeCode model status')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Maintenance ticket created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update maintenance status / repair notes / cost
// @route   PUT /api/maintenance/:id
// @access  Private (Admin, Operations Manager)
exports.updateMaintenance = async (req, res, next) => {
  try {
    const { status, cost, repairNotes, assignedTo, priority } = req.body;

    let record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found'
      });
    }

    if (status) record.status = status;
    if (cost !== undefined) record.cost = Number(cost);
    if (repairNotes) record.repairNotes = repairNotes;
    if (assignedTo) record.assignedTo = assignedTo;
    if (priority) record.priority = priority;

    if (status === 'Completed') {
      record.completedAt = new Date();

      // Return bike to Available status
      const bike = await Bicycle.findById(record.bicycle);
      if (bike) {
        bike.status = 'Available';
        bike.lastMaintainedDate = new Date();
        bike.conditionNotes = 'Maintained & inspected on ' + new Date().toLocaleDateString();
        await bike.save();
        await syncStationStats(bike.currentStation);
      }
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: record
    });
  } catch (err) {
    next(err);
  }
};
