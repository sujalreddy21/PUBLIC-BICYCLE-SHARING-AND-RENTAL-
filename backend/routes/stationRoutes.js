const express = require('express');
const router = express.Router();
const {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getStations);
router.get('/:id', getStation);

// Protected routes
router.use(protect);
router.post('/', authorize('admin'), createStation);
router.put('/:id', authorize('admin', 'operations_manager'), updateStation);
router.delete('/:id', authorize('admin'), deleteStation);

module.exports = router;
