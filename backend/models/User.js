const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'operations_manager', 'station_attendant', 'member'],
      default: 'member'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    assignedStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      default: null
    },
    membership: {
      plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        default: null
      },
      startDate: {
        type: Date,
        default: null
      },
      expiryDate: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        enum: ['Active', 'Expired', 'None'],
        default: 'None'
      }
    },
    totalRides: {
      type: Number,
      default: 0
    },
    walletBalance: {
      type: Number,
      default: 100.00
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
