const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema(
  {
    maintenanceCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    bicycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bicycle',
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedTo: {
      type: String,
      default: 'Technical Support Team'
    },
    issueType: {
      type: String,
      enum: [
        'Brake Issue',
        'Flat Tyre',
        'Gear Malfunction',
        'Battery Drain',
        'Chain Broken',
        'Frame Damage',
        'Routine Inspection',
        'Other'
      ],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    repairNotes: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
