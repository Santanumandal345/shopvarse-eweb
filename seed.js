const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
    {
        name: "iPhone 15 Pro Max",
        description: "Latest Apple smartphone with A17 Pro chip, 48MP camera, and titanium design",
        price: 1199.99,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300"],
        stock: 50,
        isFeatured: true,
        rating: 4.8
    },
    {
        name: "MacBook Pro 16-inch",
        description: "Apple M3 Pro chip with 12-core CPU, 18-core GPU, 36GB RAM, 1TB SSD",
        price: 2499.99,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300"],
        stock: 30,
        isFeatured: true,
        rating: 4.9
    },
    {
        
        name: "Airbot",
        description: "TECHIO AirBeats Wireless Earbuds with Dual Mic ENC for Clear Calls, 50H Playback Bluetooth Headset (Golden, True Wireless)",
        price: 299.99,
        category: "Electronics",
        images: ["https://rukminim1.flixcart.com/image/1536/1536/xif0q/headphone/s/k/s/airbeats-wireless-earbuds-with-dual-mic-enc-for-clear-calls-50h-original-imahm5bysqt4uggg.jpeg?q=90"],
        stock: 30,
        isFeatured: true,
        rating: 4.9
    
    },
    {
        name: "Sony WH-1000XM5 Headphones",
        description: "Premium noise-canceling headphones with 30-hour battery life",
        price: 399.99,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300"],
        stock: 100,
        isFeatured: false,
        rating: 4.7
    },
    {
        name: "Nike Air Max 270",
        description: "Comfortable running shoes with visible Air cushioning, breathable mesh upper",
        price: 149.99,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"],
        stock: 200,
        isFeatured: false,
        rating: 4.5
    },
    {
        name: "Levi's 501 Original Jeans",
        description: "Classic straight-fit jeans with iconic button fly, 100% cotton denim",
        price: 89.99,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300"],
        stock: 150,
        isFeatured: false,
        rating: 4.3
    },
    {
        name: "The Pragmatic Programmer",
        description: "Your journey to mastery. 20th Anniversary Edition - essential reading for developers",
        price: 39.99,
        category: "Books",
        images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300"],
        stock: 200,
        isFeatured: false,
        rating: 4.9
    },
    {
        name: "Clean Code by Robert C. Martin",
        description: "A handbook of agile software craftsmanship - learn to write clean, maintainable code",
        price: 45.99,
        category: "Books",
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300"],
        stock: 180,
        isFeatured: false,
        rating: 4.8
    },
    {
        name: "Dyson V15 Vacuum Cleaner",
        description: "Cordless vacuum with laser detection, powerful suction, and intelligent optimization",
        price: 699.99,
        category: "Home & Garden",
        images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300"],
        stock: 40,
        isFeatured: true,
        rating: 4.6
    },
    {
        name: "Instant Pot Duo 7-in-1",
        description: "Electric pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer",
        price: 99.99,
        category: "Home & Garden",
        images: ["https://images.unsplash.com/photo-1585664819516-4c87b0f2a86b?w=300"],
        stock: 120,
        isFeatured: false,
        rating: 4.4
    },
    {
        name: "YETI Rambler 20 oz Tumbler",
        description: "Stainless steel vacuum insulated tumbler with MagSlider lid, keeps drinks hot or cold",
        price: 34.99,
        category: "Home & Garden",
        images: ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300"],
        stock: 250,
        isFeatured: false,
        rating: 4.7
    },
    {
        name: "LEGO Star Wars Millennium Falcon",
        description: "Build the fastest hunk of junk in the galaxy with 1,351 pieces, includes 7 minifigures",
        price: 159.99,
        category: "Toys",
        images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300"],
        stock: 60,
        isFeatured: false,
        rating: 4.8
    },
    {
        name: "Nerf Elite 2.0 Commander",
        description: "Motorized dart blaster with 36-dart drum, rapid-fire action, and tactical rail",
        price: 49.99,
        category: "Toys",
        images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300"],
        stock: 80,
        isFeatured: false,
        rating: 4.2
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Delete existing products
        await Product.deleteMany({});
        console.log('🗑️  Deleted existing products');
        
        // Insert new products
        const result = await Product.insertMany(sampleProducts);
        console.log(`✅ Added ${result.length} sample products successfully!`);
        
        // List all products
        const products = await Product.find({});
        console.log('\n📦 Products in database:');
        products.forEach(p => {
            console.log(`   - ${p.name} ($${p.price})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();