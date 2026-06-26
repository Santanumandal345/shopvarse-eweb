const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ===== MIDDLEWARE: Check if user is admin =====
const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ===== GET ADMIN DASHBOARD STATS =====
router.get('/dashboard/stats', auth, isAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
        const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
        const rejectedOrders = await Order.countDocuments({ orderStatus: 'rejected' });
        
        const revenueAgg = await Order.aggregate([
            { $match: { orderStatus: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' }
            }}
        ]);
        
        const revenue = revenueAgg[0] || { totalRevenue: 0, averageOrderValue: 0 };
        
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            stats: {
                totalOrders,
                totalUsers,
                totalProducts,
                pendingOrders,
                confirmedOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                rejectedOrders,
                totalRevenue: revenue.totalRevenue,
                averageOrderValue: revenue.averageOrderValue
            },
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== GET ALL ORDERS (Admin) =====
router.get('/orders', auth, isAdmin, async (req, res) => {
    try {
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
        console.error('Admin orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== GET SINGLE ORDER =====
router.get('/orders/:id', auth, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email profile');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Admin order detail error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== APPROVE ORDER =====
router.put('/orders/:id/approve', auth, isAdmin, async (req, res) => {
    try {
        const { note } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({ 
                message: `Order cannot be approved. Current status: ${order.orderStatus}` 
            });
        }
        
        order.addStatusHistory('confirmed', note || 'Order approved by admin', req.user.name || 'Admin');
        await order.save();
        
        res.json({
            message: 'Order approved successfully',
            order
        });
    } catch (error) {
        console.error('Approve order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== REJECT ORDER =====
router.put('/orders/:id/reject', auth, isAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({ 
                message: `Order cannot be rejected. Current status: ${order.orderStatus}` 
            });
        }
        
        order.addStatusHistory('rejected', reason || 'Order rejected by admin', req.user.name || 'Admin');
        
        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }
        
        await order.save();
        
        res.json({
            message: 'Order rejected successfully',
            order
        });
    } catch (error) {
        console.error('Reject order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== UPDATE ORDER STATUS =====
router.put('/orders/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status, note, tracking } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.addStatusHistory(status, note || `Status updated to ${status}`, req.user.name || 'Admin');
        
        if (tracking) {
            order.tracking = {
                ...order.tracking,
                ...tracking
            };
        }
        
        await order.save();
        
        res.json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== BULK ORDER ACTIONS =====
router.post('/orders/bulk-action', auth, isAdmin, async (req, res) => {
    try {
        const { orderIds, action, note } = req.body;
        
        if (!orderIds || orderIds.length === 0) {
            return res.status(400).json({ message: 'No orders selected' });
        }
        
        const results = [];
        
        for (const orderId of orderIds) {
            const order = await Order.findById(orderId);
            if (!order) continue;
            
            if (action === 'approve' && order.orderStatus === 'pending') {
                order.addStatusHistory('confirmed', note || 'Bulk approved by admin', req.user.name || 'Admin');
                await order.save();
                results.push({ orderId, status: 'approved' });
            } else if (action === 'reject' && order.orderStatus === 'pending') {
                order.addStatusHistory('rejected', note || 'Bulk rejected by admin', req.user.name || 'Admin');
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity }
                    });
                }
                await order.save();
                results.push({ orderId, status: 'rejected' });
            }
        }
        
        res.json({
            message: `Bulk action completed: ${results.length} orders processed`,
            results
        });
    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== GET ALL PRODUCTS =====
router.get('/products', auth, isAdmin, async (req, res) => {
    try {
        const { search, limit = 20, page = 1 } = req.query;
        
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Product.countDocuments(query);
        
        res.json({
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Admin products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== CREATE PRODUCT =====
router.post('/products', auth, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, images, stock, isFeatured } = req.body;
        
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const product = new Product({
            name,
            description,
            price,
            category,
            images: images || ['https://via.placeholder.com/300x300/e9ecef/6c757d?text=Product'],
            stock: stock || 0,
            isFeatured: isFeatured || false
        });
        
        await product.save();
        
        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== UPDATE PRODUCT =====
router.put('/products/:id', auth, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== DELETE PRODUCT =====
router.delete('/products/:id', auth, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== GET ALL USERS =====
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const { search, limit = 20, page = 1 } = req.query;
        
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await User.countDocuments(query);
        
        res.json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== UPDATE USER =====
router.put('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        
        user.updatedAt = new Date();
        await user.save();
        
        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;