const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, topupWallet } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'operations_manager'), getUsers);
router.post('/wallet-topup', topupWallet);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
