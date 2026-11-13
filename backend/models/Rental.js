const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema(
  {
    rentalId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bicycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bicycle',
      required: true
    },
    pickupStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    returnStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      default: null
    },
    checkoutTime: {
      type: Date,
      default: Date.now,
      required: true
    },
    returnTime: {
      type: Date,
      default: null
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    baseFare: {
      type: Number,
      default: 20
    },
    durationFare: {
      type: Number,
      default: 0
    },
    lateOrExtraFee: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    totalCharge: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Waived'],
      default: 'Pending'
    },
    rentalStatus: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rental', RentalSchema);
