const express = require('express');
const router = express.Router();
const {
  getBikes,
  getBike,
  createBike,
  updateBike,
  deleteBike
} = require('../controllers/bikeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getBikes);
router.get('/:id', getBike);

// Protected routes
router.use(protect);
router.post('/', authorize('admin', 'operations_manager'), createBike);
router.put('/:id', authorize('admin', 'operations_manager', 'station_attendant'), updateBike);
router.delete('/:id', authorize('admin'), deleteBike);

module.exports = router;
