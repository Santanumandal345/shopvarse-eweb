const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@shopverse.com' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists:');
            console.log('📧 Email:', existingAdmin.email);
            console.log('👤 Role:', existingAdmin.role);
            console.log('📝 Name:', existingAdmin.name);
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Admin',
            email: 'admin@shopverse.com',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin',
            isActive: true,
            profile: {
                avatar: '',
                phone: '',
                bio: 'Store Administrator'
            }
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@shopverse.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔗 Admin Panel: http://localhost:5000/admin.html');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createAdmin();