const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from frontend folder
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// ===== API ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ===== FRONTEND ROUTES =====
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/orders.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'orders.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'profile.html'));
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).json({
            message: 'Route not found',
            path: req.originalUrl
        });
    }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}`);
    console.log(`📁 Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`📝 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});