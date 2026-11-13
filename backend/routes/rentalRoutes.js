const express = require('express');
const router = express.Router();
const {
  getRentals,
  getRental,
  checkoutRental,
  returnRental
} = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRentals);
router.get('/:id', getRental);
router.post('/checkout', checkoutRental);
router.post('/return', returnRental);

module.exports = router;
