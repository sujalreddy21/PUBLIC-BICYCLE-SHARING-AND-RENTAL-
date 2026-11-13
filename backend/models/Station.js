const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Station code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      default: 'Metro City',
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        default: 17.3850
      },
      lng: {
        type: Number,
        default: 78.4867
      }
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    availableBikesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    occupiedSlotsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Inactive'],
      default: 'Active'
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for available parking slots
StationSchema.virtual('availableSlots').get(function () {
  return Math.max(0, this.capacity - this.occupiedSlotsCount);
});

StationSchema.set('toJSON', { virtuals: true });
StationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Station', StationSchema);
