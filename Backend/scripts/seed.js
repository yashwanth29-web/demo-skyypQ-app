/**
 * Seed Script — Full seed including Customers with dummy data
 *
 * Run: node scripts/seed.js
 *
 * Dummy customer credentials (all use password: skyyq@123):
 *   📱 9876543210 / skyyq@123  — Arjun Reddy
 *   📱 9123456780 / skyyq@123  — Priya Sharma
 *   📱 9988776655 / skyyq@123  — Rahul Verma
 *   📱 8877665544 / skyyq@123  — Sneha Patel
 *   📱 7766554433 / skyyq@123  — Karthik Rao
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const Customer = require('../src/models/Customer');

// Load mock data from User-Side
const restaurantsData = require(
  path.join(__dirname, '../../User-Side/src/mock/restaurants.json')
);
const menuData = require(
  path.join(__dirname, '../../User-Side/src/mock/menu.json')
);

// ── Dummy customers ───────────────────────────────────────────────────────────
const DUMMY_CUSTOMERS = [
  { name: 'Arjun Reddy',   email: 'arjun@demo.com',  phone: '9876543210' },
  { name: 'Priya Sharma',  email: 'priya@demo.com',  phone: '9123456780' },
  { name: 'Rahul Verma',   email: 'rahul@demo.com',  phone: '9988776655' },
  { name: 'Sneha Patel',   email: 'sneha@demo.com',  phone: '8877665544' },
  { name: 'Karthik Rao',   email: 'karthik@demo.com', phone: '7766554433' },
];

const seed = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // ── Clear existing data ───────────────────────────────────────────────────
    console.log('\n🗑️  Clearing existing data...');
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Customer.deleteMany({});
    console.log('   Cleared restaurants, menu items, and customers.');

    // ── Hash shared password once ─────────────────────────────────────────────
    const DEFAULT_PASSWORD = 'skyyq@123';
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    console.log('🔒 Password hashed.');

    // ── Seed Restaurants ──────────────────────────────────────────────────────
    console.log('\n🍽️  Seeding restaurants...');
    const restaurantDocs = restaurantsData.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine || 'Various',
      rating: parseFloat(r.rating) || 4.5,
      deliveryTime: r.eta || '20-30 min',
      minOrder: r.minOrder || 100,
      image: r.image || '',
      tags: r.tags || [],
      address: r.address || 'Hyderabad, Telangana',
      valetEnabled: r.valetEnabled !== undefined ? r.valetEnabled : true,
      featured: r.featured || false,
      coordinates: r.coordinates || { lat: 17.385, lng: 78.4867 },
      ownerUsername: `${r.id}_owner`,
      ownerPasswordHash: hashedPassword,  // pre-hashed (insertMany skips hooks)
    }));

    const inserted = await Restaurant.insertMany(restaurantDocs);
    console.log(`   ✅ Inserted ${inserted.length} restaurants`);
    console.log('\n   Owner credentials (all password: skyyq@123):');
    inserted.forEach((r) => {
      console.log(`   🏪 ${r.name.padEnd(30)} → ${r.ownerUsername}`);
    });

    // ── Seed Menu Items ───────────────────────────────────────────────────────
    console.log('\n🍜 Seeding menu items...');
    const menuDocs = menuData.map((item) => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      prepTime: item.prepTime || '10-15 min',
      category: item.category || 'Main Course',
      tags: item.tags || [],
      image: item.image || '',
      isVeg: item.type === 'veg',
      isAvailable: true,
      rating: item.rating || 4.0,
      reviewCount: item.votes || 0,
    }));

    const insertedMenu = await MenuItem.insertMany(menuDocs);
    console.log(`   ✅ Inserted ${insertedMenu.length} menu items`);

    // ── Seed Customers ────────────────────────────────────────────────────────
    console.log('\n👤 Seeding customers...');
    const customerDocs = DUMMY_CUSTOMERS.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      passwordHash: hashedPassword,  // pre-hashed
    }));

    const insertedCustomers = await Customer.insertMany(customerDocs);
    console.log(`   ✅ Inserted ${insertedCustomers.length} customers`);
    console.log('\n   Customer credentials (all password: skyyq@123):');
    insertedCustomers.forEach((c) => {
      console.log(`   👤 ${c.name.padEnd(20)} → phone: ${c.phone}  email: ${c.email}`);
    });

    console.log('\n🎉 Full seed complete! Database is ready.\n');
    console.log('━'.repeat(60));
    console.log('📋 QUICK LOGIN REFERENCE');
    console.log('━'.repeat(60));
    console.log('Customer App (User-Side)  — login with phone + password');
    console.log('   Phone: 9876543210  Password: skyyq@123  (Arjun Reddy)');
    console.log('   Phone: 9123456780  Password: skyyq@123  (Priya Sharma)');
    console.log('');
    console.log('Restaurant App (Owner)    — login with username + password');
    console.log('   User: r-chutneys_owner  Password: skyyq@123');
    console.log('   User: r-paradise_owner  Password: skyyq@123');
    console.log('━'.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
