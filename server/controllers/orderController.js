const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('perdoruesi_id', 'emri email')
            .populate('produkti_id', 'emri foto')
            .sort({ createdAt: -1 });
        
        res.json({ error: false, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('perdoruesi_id', 'emri email')
            .populate('produkti_id', 'emri pershkrimi cmimi foto');
        
        if (!order) {
            return res.status(404).json({ error: true, mesazhi: 'Blerja nuk u gjet' });
        }
        
        res.json({ error: false, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: true, mesazhi: 'Blerja nuk u gjet' });
        }
        
        order.status = status || order.status;
        await order.save();
        
        res.json({ error: false, mesazhi: 'Statusi u perditesua me sukses', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Private
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ perdoruesi_id: req.params.userId })
            .populate('produkti_id', 'emri foto')
            .sort({ createdAt: -1 });
        
        res.json({ error: false, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};
