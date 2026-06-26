const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const carts = require('../utils/cartStore'); // ✅ Import shared cart

// ===== GET CART =====
router.get('/', auth, (req, res) => {
    try {
        const userId = req.user._id.toString();
        const cart = carts.get(userId) || { items: [], total: 0 };
        console.log(`📦 Cart loaded for user ${userId}:`, cart);
        res.json(cart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== ADD TO CART =====
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id.toString();
        
        console.log(`🛒 Adding to cart: user=${userId}, product=${productId}, qty=${quantity}`);
        
        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }
        
        // Get or create cart
        let cart = carts.get(userId);
        if (!cart) {
            cart = { items: [], total: 0 };
        }
        
        // Check if item already in cart
        const existingItem = cart.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                name: product.name,
                price: product.price,
                image: product.images && product.images.length > 0 ? product.images[0] : '',
                quantity
            });
        }
        
        // Calculate total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save cart
        carts.set(userId, cart);
        
        console.log(`✅ Cart updated:`, cart);
        
        res.json({ 
            message: 'Item added to cart', 
            cart 
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== UPDATE CART ITEM =====
router.put('/update', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id.toString();
        
        console.log(`🔄 Updating cart: user=${userId}, product=${productId}, qty=${quantity}`);
        
        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity must be at least 0' });
        }
        
        const cart = carts.get(userId);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not in cart' });
        }
        
        if (quantity === 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }
        
        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        carts.set(userId, cart);
        
        console.log(`✅ Cart updated:`, cart);
        
        res.json({ message: 'Cart updated', cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== REMOVE FROM CART =====
router.delete('/remove/:productId', auth, (req, res) => {
    try {
        const userId = req.user._id.toString();
        const productId = req.params.productId;
        
        console.log(`🗑️ Removing from cart: user=${userId}, product=${productId}`);
        
        const cart = carts.get(userId);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        carts.set(userId, cart);
        
        console.log(`✅ Item removed:`, cart);
        
        res.json({ message: 'Item removed from cart', cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== CLEAR CART =====
router.delete('/clear', auth, (req, res) => {
    try {
        const userId = req.user._id.toString();
        carts.delete(userId);
        console.log(`🗑️ Cart cleared for user: ${userId}`);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== DEBUG: Get all carts =====
router.get('/debug', (req, res) => {
    const allCarts = {};
    for (const [key, value] of carts.entries()) {
        allCarts[key] = value;
    }
    res.json(allCarts);
});

module.exports = router;