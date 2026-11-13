const mongoose = require('mongoose');

const BicycleSchema = new mongoose.Schema(
  {
    bikeCode: {
      type: String,
      required: [true, 'Bike code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model name is required'],
      default: 'Urban Cruiser Pro'
    },
    type: {
      type: String,
      enum: ['Standard', 'Electric', 'Geared', 'Cruiser'],
      default: 'Standard'
    },
    currentStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Bicycle must belong to a station']
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Rented', 'Under Maintenance', 'Inactive'],
      default: 'Available'
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    totalRides: {
      type: Number,
      default: 0
    },
    totalDistanceKm: {
      type: Number,
      default: 0
    },
    lastMaintainedDate: {
      type: Date,
      default: Date.now
    },
    conditionNotes: {
      type: String,
      default: 'Good condition'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bicycle', BicycleSchema);
