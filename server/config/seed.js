require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});

        console.log('Cleared existing data');

        // Create admin user
        const admin = await User.create({
            emri: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@shop.com',
            fjalekalimi: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin'
        });

        console.log('Admin user created:', admin.email);

        // Create sample user
        const user = await User.create({
            emri: 'Test User',
            email: 'user@shop.com',
            fjalekalimi: 'user123',
            role: 'user'
        });

        console.log('Test user created:', user.email);

        // Create sample products
        const products = await Product.create([
            {
                emri: 'Laptop Dell XPS 15',
                pershkrimi: 'High-performance laptop with 16GB RAM and 512GB SSD',
                cmimi: 1299.99,
                stoku: 15,
                foto: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-gray-gallery-4.psd?fmt=png-alpha',
                kategoria: 'Electronics'
            },
            {
                emri: 'iPhone 15 Pro',
                pershkrimi: 'Latest iPhone with A17 Pro chip and titanium design',
                cmimi: 999.99,
                stoku: 25,
                foto: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
                kategoria: 'Electronics'
            },
            {
                emri: 'Sony WH-1000XM5',
                pershkrimi: 'Premium noise canceling headphones',
                cmimi: 399.99,
                stoku: 8,
                foto: 'https://m.media-amazon.com/images/I/61vJU-A7hjL._AC_SL1500_.jpg',
                kategoria: 'Audio'
            },
            {
                emri: 'Samsung 4K Monitor 32"',
                pershkrimi: '32-inch 4K UHD monitor with HDR support',
                cmimi: 449.99,
                stoku: 12,
                foto: 'https://images.samsung.com/is/image/samsung/p6pim/levant/lu32j590uqmxue/gallery/levant-uhd-monitor-with-metallic-design-lu32j590uqmxue-409766885?$650_519_PNG$',
                kategoria: 'Electronics'
            },
            {
                emri: 'Logitech MX Master 3S',
                pershkrimi: 'Wireless mouse with ergonomic design',
                cmimi: 99.99,
                stoku: 30,
                foto: 'https://resource.logitech.com/w_800,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png?v=1',
                kategoria: 'Accessories'
            },
            {
                emri: 'Mechanical Keyboard RGB',
                pershkrimi: 'Mechanical gaming keyboard with RGB lighting',
                cmimi: 129.99,
                stoku: 20,
                foto: 'https://m.media-amazon.com/images/I/71WxRjBxfPL._AC_SL1500_.jpg',
                kategoria: 'Accessories'
            },
            {
                emri: 'USB-C Hub 7-in-1',
                pershkrimi: 'Multiport adapter with HDMI, USB 3.0, SD card reader',
                cmimi: 49.99,
                stoku: 5,
                foto: 'https://m.media-amazon.com/images/I/61IJvH9Z-LL._AC_SL1500_.jpg',
                kategoria: 'Accessories'
            },
            {
                emri: 'Webcam 1080p HD',
                pershkrimi: 'Full HD webcam with auto-focus and built-in microphone',
                cmimi: 79.99,
                stoku: 18,
                foto: 'https://m.media-amazon.com/images/I/61x3GQn7FML._AC_SL1500_.jpg',
                kategoria: 'Electronics'
            },
        ]);

        console.log(`${products.length} products created`);

        console.log('\n=== Seed Data Summary ===');
        console.log('Admin Email:', admin.email);
        console.log('Admin Password:', process.env.ADMIN_PASSWORD || 'admin123');
        console.log('Test User Email:', user.email);
        console.log('Test User Password: user123');
        console.log(`Total Products: ${products.length}`);
        console.log('========================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
