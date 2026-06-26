const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const carts = require('../utils/cartStore');

// ===== CONFIRM ORDER =====
router.post('/confirm-order', auth, async (req, res) => {
    try {
        const { paymentId, paymentMethod, paymentStatus, shippingAddress } = req.body;
        const userId = req.user._id.toString();
        
        console.log(`📦 Confirming order for user: ${userId}`);
        
        const cart = carts.get(userId);
        
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ 
                message: 'Cart is empty. Please add items to your cart first.' 
            });
        }
        
        console.log(`✅ Cart found with ${cart.items.length} items, total: $${cart.total}`);
        
        // Create order WITHOUT orderNumber - it will be generated in pre-save
        const order = new Order({
            user: req.user._id,
            items: cart.items.map(item => ({
                product: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            shippingAddress: shippingAddress || {
                street: 'No address provided',
                city: 'N/A',
                state: 'N/A',
                zipCode: 'N/A',
                country: 'N/A'
            },
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentStatus || 'pending',
            paymentId: paymentId || `order_${Date.now()}`,
            totalAmount: cart.total,
            subtotal: cart.total,
            tax: 0,
            shippingCost: 0,
            discount: 0,
            // Initialize with pending status
            orderStatus: 'pending',
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order created',
                updatedBy: req.user.name || 'Customer'
            }]
        });
        
        // Log before save
        console.log('📝 Order object before save:', {
            user: order.user,
            items: order.items.length,
            totalAmount: order.totalAmount,
            orderNumber: order.orderNumber // Will be undefined until pre-save runs
        });
        
        // Save the order - this will trigger pre-save middleware
        await order.save();
        console.log(`✅ Order saved successfully!`);
        console.log(`📦 Order Number: ${order.orderNumber}`);
        console.log(`🆔 Order ID: ${order._id}`);
        
        // Update product stock
        for (const item of cart.items) {
            try {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: -item.quantity }
                });
                console.log(`✅ Stock updated for product: ${item.productId}`);
            } catch (stockError) {
                console.error(`❌ Failed to update stock:`, stockError);
            }
        }
        
        // Clear cart
        carts.delete(userId);
        console.log(`🗑️ Cart cleared for user: ${userId}`);
        
        res.json({
            success: true,
            message: 'Order confirmed successfully! 🎉',
            orderId: order._id,
            orderNumber: order.orderNumber,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.totalAmount,
                items: order.items.length,
                status: order.orderStatus,
                createdAt: order.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ Order confirmation error:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        // Send more detailed error for debugging
        res.status(500).json({ 
            message: 'Error confirming order: ' + error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ===== MOCK PAYMENT ENDPOINTS =====
router.post('/create-payment-intent', auth, (req, res) => {
    const userId = req.user._id.toString();
    const cart = carts.get(userId);
    
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    
    res.json({
        clientSecret: 'mock_secret_' + Date.now(),
        amount: cart.total,
        currency: 'usd'
    });
});

router.post('/create-razorpay-order', auth, (req, res) => {
    const userId = req.user._id.toString();
    const cart = carts.get(userId);
    
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    
    res.json({
        orderId: 'mock_order_' + Date.now(),
        amount: Math.round(cart.total * 100),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'mock_key_id'
    });
});

module.exports = router;