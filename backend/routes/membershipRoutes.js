const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  subscribePlan
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.get('/:id', getPlan);

router.use(protect);
router.post('/subscribe', subscribePlan);
router.post('/', authorize('admin'), createPlan);
router.put('/:id', authorize('admin'), updatePlan);
router.delete('/:id', authorize('admin'), deletePlan);

module.exports = router;
