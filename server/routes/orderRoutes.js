const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getUserOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id', protect, admin, updateOrderStatus);
router.get('/user/:userId', protect, getUserOrders);

module.exports = router;
