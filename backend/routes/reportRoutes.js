const express = require('express');
const router = express.Router();
const {
  getAvailabilityReport,
  getRentalsReport,
  getStationUtilizationReport,
  getRevenueReport,
  getDashboardStats
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.get('/availability', authorize('admin', 'operations_manager'), getAvailabilityReport);
router.get('/rentals', authorize('admin', 'operations_manager'), getRentalsReport);
router.get('/stations', authorize('admin', 'operations_manager'), getStationUtilizationReport);
router.get('/revenue', authorize('admin', 'operations_manager'), getRevenueReport);

module.exports = router;
