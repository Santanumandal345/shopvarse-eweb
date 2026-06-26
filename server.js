// // const express = require('express');
// // const cors = require('cors');
// // const dotenv = require('dotenv');
// // const connectDB = require('./config/database');

// // // Load environment variables
// // dotenv.config();

// // // Connect to database
// // connectDB();

// // const app = express();

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Routes
// // app.use('/api/auth', require('./routes/auth'));
// // app.use('/api/products', require('./routes/products'));
// // app.use('/api/cart', require('./routes/cart'));
// // app.use('/api/payment', require('./routes/payment'));
// // app.use('/api/orders', require('./routes/orders'));
// // app.use('/api/admin', require('./routes/admin'));

// // // Health check route
// // app.get('/api/health', (req, res) => {
// //     res.json({
// //         status: 'OK',
// //         message: 'Server is running',
// //         timestamp: new Date().toISOString(),
// //         environment: process.env.NODE_ENV || 'development'
// //     });
// // });

// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //     console.error('Error:', err.stack);
// //     res.status(500).json({
// //         message: 'Something went wrong!',
// //         error: process.env.NODE_ENV === 'development' ? err.message : undefined
// //     });
// // });

// // // 404 handler
// // app.use((req, res) => {
// //     res.status(404).json({
// //         message: 'Route not found',
// //         path: req.originalUrl
// //     });
// // });

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`🚀 Server running on http://localhost:${PORT}`);
// //     console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
// //     console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
// //     console.log(`📊 Database: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Not configured'}`);
// // });



// // const express = require('express');
// // const cors = require('cors');
// // const dotenv = require('dotenv');
// // const path = require('path'); // ✅ Add this
// // const connectDB = require('./config/database');

// // // Load environment variables
// // dotenv.config();

// // // Connect to database
// // connectDB();

// // const app = express();

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // ✅ Serve static files from frontend folder
// // app.use(express.static(path.join(__dirname, '../frontend')));

// // // Routes
// // app.use('/api/auth', require('./routes/auth'));
// // app.use('/api/products', require('./routes/products'));
// // app.use('/api/cart', require('./routes/cart'));
// // app.use('/api/payment', require('./routes/payment'));
// // app.use('/api/orders', require('./routes/orders'));
// // app.use('/api/admin', require('./routes/admin'));

// // // Health check route
// // app.get('/api/health', (req, res) => {
// //     res.json({
// //         status: 'OK',
// //         message: 'Server is running',
// //         timestamp: new Date().toISOString(),
// //         environment: process.env.NODE_ENV || 'development'
// //     });
// // });

// // // ✅ Serve index.html for root route
// // app.get('/', (req, res) => {
// //     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// // });

// // // ✅ Serve admin.html
// // app.get('/admin.html', (req, res) => {
// //     res.sendFile(path.join(__dirname, '../frontend/admin.html'));
// // });

// // // ✅ Serve orders.html
// // app.get('/orders.html', (req, res) => {
// //     res.sendFile(path.join(__dirname, '../frontend/orders.html'));
// // });

// // // ✅ Serve profile.html
// // app.get('/profile.html', (req, res) => {
// //     res.sendFile(path.join(__dirname, '../frontend/profile.html'));
// // });

// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //     console.error('Error:', err.stack);
// //     res.status(500).json({
// //         message: 'Something went wrong!',
// //         error: process.env.NODE_ENV === 'development' ? err.message : undefined
// //     });
// // });

// // // 404 handler for API routes
// // app.use('/api/*', (req, res) => {
// //     res.status(404).json({
// //         message: 'API route not found',
// //         path: req.originalUrl
// //     });
// // });

// // // ✅ 404 handler for HTML pages - redirect to index
// // app.use((req, res) => {
// //     // If it's an HTML request, serve index.html (SPA behavior)
// //     if (req.accepts('html')) {
// //         res.sendFile(path.join(__dirname, '../frontend/index.html'));
// //     } else {
// //         res.status(404).json({
// //             message: 'Route not found',
// //             path: req.originalUrl
// //         });
// //     }
// // });

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`🚀 Server running on http://localhost:${PORT}`);
// //     console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
// //     console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
// //     console.log(`📊 Database: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Not configured'}`);
// //     console.log(`📁 Frontend: http://localhost:${PORT}/admin.html`);
// // });



// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const connectDB = require('./config/database');

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Serve static files from frontend folder
// app.use(express.static(path.join(__dirname, '../frontend')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/cart', require('./routes/cart'));
// app.use('/api/payment', require('./routes/payment'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/admin', require('./routes/admin'));

// // Health check
// app.get('/api/health', (req, res) => {
//     res.json({
//         status: 'OK',
//         message: 'Server is running',
//         timestamp: new Date().toISOString()
//     });
// });

// // ✅ Serve HTML pages
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// app.get('/admin.html', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/admin.html'));
// });

// app.get('/orders.html', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/orders.html'));
// });

// app.get('/profile.html', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/profile.html'));
// });

// // Error handling
// app.use((err, req, res, next) => {
//     console.error('Error:', err.stack);
//     res.status(500).json({
//         message: 'Something went wrong!',
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//     console.log(`📁 Admin Panel: http://localhost:${PORT}/admin.html`);
// });




const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes ONLY (No frontend static files)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ✅ Root route - API info
app.get('/', (req, res) => {
    res.json({
        name: 'ShopVerse API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            payment: '/api/payment',
            orders: '/api/orders',
            admin: '/api/admin',
            health: '/api/health'
        }
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        message: 'API route not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📝 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});