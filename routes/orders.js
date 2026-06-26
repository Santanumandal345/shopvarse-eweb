const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ===== GET ALL ORDERS (User) =====
router.get('/', auth, async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        
        let query = { user: req.user._id };
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Order.countDocuments(query);
        
        res.json({
            orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== GET SINGLE ORDER =====
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== GET ORDER BY ORDER NUMBER =====
router.get('/number/:orderNumber', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.orderNumber,
            user: req.user._id
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== CANCEL ORDER =====
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if order can be cancelled
        const cancellableStatuses = ['pending', 'confirmed', 'processing'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({ 
                message: `Order cannot be cancelled. Current status: ${order.orderStatus}` 
            });
        }
        
        // Add cancellation to history
        order.addStatusHistory('cancelled', reason || 'Cancelled by user', req.user.name || 'User');
        
        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }
        
        await order.save();
        
        res.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== ADMIN: UPDATE ORDER STATUS =====
router.put('/:id/status', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const { status, note, tracking } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Add status history
        order.addStatusHistory(status, note || '', req.user.name || 'Admin');
        
        // Update tracking info if provided
        if (tracking) {
            order.tracking = {
                ...order.tracking,
                ...tracking
            };
        }
        
        await order.save();
        
        res.json({
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== ADMIN: GET ALL ORDERS =====
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const { status, search, limit = 20, page = 1 } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'items.name': { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Order.countDocuments(query);
        
        res.json({
            orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== ADMIN: GET ORDER STATISTICS =====
router.get('/admin/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
        const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
        const outForDeliveryOrders = await Order.countDocuments({ orderStatus: 'out_for_delivery' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
        
        // Revenue stats
        const revenueAgg = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' } } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' }
            }}
        ]);
        
        const revenue = revenueAgg[0] || { totalRevenue: 0, averageOrderValue: 0 };
        
        res.json({
            totalOrders,
            pendingOrders,
            confirmedOrders,
            processingOrders,
            shippedOrders,
            outForDeliveryOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue: revenue.totalRevenue,
            averageOrderValue: revenue.averageOrderValue
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;