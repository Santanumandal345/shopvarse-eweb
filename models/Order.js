const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        // Remove 'required: true' since we generate it in pre-save
        sparse: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: String
    }],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'razorpay', 'cod'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: String,
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: String
    }],
    tracking: {
        courier: String,
        trackingNumber: String,
        trackingUrl: String,
        estimatedDelivery: Date
    },
    totalAmount: {
        type: Number,
        required: true
    },
    subtotal: Number,
    tax: Number,
    shippingCost: Number,
    discount: Number,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: Date,
    cancelledAt: Date
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
    console.log('🔄 Pre-save middleware running for order');
    
    // Generate order number if not set
    if (!this.orderNumber) {
        const date = new Date();
        const dateStr = date.getFullYear() +
            String(date.getMonth() + 1).padStart(2, '0') +
            String(date.getDate()).padStart(2, '0');
        const random = String(Math.floor(1000 + Math.random() * 9000));
        this.orderNumber = `ORD-${dateStr}-${random}`;
        console.log(`✅ Generated order number: ${this.orderNumber}`);
    }
    
    this.updatedAt = new Date();
    next();
});

// Method to add status history
orderSchema.methods.addStatusHistory = function(status, note = '', updatedBy = 'system') {
    this.statusHistory.push({
        status,
        timestamp: new Date(),
        note,
        updatedBy
    });
    this.orderStatus = status;
    this.updatedAt = new Date();
    
    if (status === 'delivered') {
        this.deliveredAt = new Date();
    }
    if (status === 'cancelled') {
        this.cancelledAt = new Date();
    }
    
    console.log(`📝 Status history added: ${status} - ${note}`);
};

module.exports = mongoose.model('Order', orderSchema);