const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Plan code is required'],
      unique: true,
      uppercase: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: 1
    },
    freeMinutesPerRide: {
      type: Number,
      default: 30,
      min: 0
    },
    hourlyRateAfterFree: {
      type: Number,
      default: 20,
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    features: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
