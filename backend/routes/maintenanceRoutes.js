const express = require('express');
const router = express.Router();
const {
  getMaintenanceList,
  createMaintenance,
  updateMaintenance
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMaintenanceList);
router.post('/', createMaintenance);
router.put('/:id', authorize('admin', 'operations_manager', 'station_attendant'), updateMaintenance);

module.exports = router;
