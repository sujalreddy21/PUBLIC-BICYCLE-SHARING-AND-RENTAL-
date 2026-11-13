const express = require('express');
const router = express.Router();
const {
  getReservations,
  createReservation,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getReservations);
router.post('/', createReservation);
router.put('/:id/cancel', cancelReservation);

module.exports = router;
