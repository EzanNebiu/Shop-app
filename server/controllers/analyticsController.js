const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get analytics dashboard data
// @route   GET /api/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        // Total counts
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Revenue calculation
        const revenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$cmimi_total' }
                }
            }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        
        // Orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Recent orders
        const recentOrders = await Order.find({})
            .populate('perdoruesi_id', 'emri email')
            .populate('produkti_id', 'emri')
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Top selling products
        const topProducts = await Order.aggregate([
            {
                $group: {
                    _id: '$produkti_id',
                    totalSold: { $sum: '$sasia' },
                    totalRevenue: { $sum: '$cmimi_total' }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            }
        ]);
        
        // Sales over time (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const salesOverTime = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$cmimi_total' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Low stock products (stoku < 10)
        const lowStockProducts = await Product.find({ stoku: { $lt: 10 } })
            .sort({ stoku: 1 })
            .limit(5);
        
        res.json({
            error: false,
            analytics: {
                summary: {
                    totalProducts,
                    totalUsers,
                    totalOrders,
                    totalRevenue
                },
                ordersByStatus,
                recentOrders,
                topProducts,
                salesOverTime,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};
