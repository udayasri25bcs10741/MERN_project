/**
 * FoodBridge Development Seed Script
 * DEMO DATA ONLY — Do not use in production.
 * Run: cd server && npm run seed
 */
require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const FoodListing = require('../src/models/FoodListing');
const DonationRequest = require('../src/models/DonationRequest');

const SALT_ROUNDS = 12;

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in server/.env. Please configure your database connection string.');
    process.exit(1);
  }
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'Atlas Cloud' : 'Local'})...`);
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB successfully for seeding.');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    FoodListing.deleteMany({}),
    DonationRequest.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  const passwordHash = await bcrypt.hash('Demo@1234', SALT_ROUNDS);

  // ── Users ──────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@foodbridge.demo',
    passwordHash,
    role: 'admin',
    accountStatus: 'active',
    verificationStatus: 'not_required',
    isDemoAccount: true,
  });

  const householdDonor = await User.create({
    name: 'Priya Sharma',
    email: 'priya@foodbridge.demo',
    passwordHash,
    role: 'household_donor',
    phone: '+91 98765 00001',
    address: 'Koramangala, Bengaluru',
    accountStatus: 'active',
    verificationStatus: 'not_required',
    isDemoAccount: true,
  });

  const orgDonor = await User.create({
    name: 'Ravi Kumar',
    email: 'ravi@foodbridge.demo',
    passwordHash,
    role: 'organization_donor',
    organizationName: 'Sunrise Bakery',
    organizationDescription: 'Artisan bakery in Indiranagar',
    phone: '+91 98765 00002',
    address: 'Indiranagar, Bengaluru',
    accountStatus: 'active',
    verificationStatus: 'not_required',
    isDemoAccount: true,
  });

  const approvedNGO = await User.create({
    name: 'Meena Nair',
    email: 'meena@foodbridge.demo',
    passwordHash,
    role: 'ngo',
    organizationName: 'Hope Foundation',
    organizationDescription: 'Supporting underprivileged communities in Bengaluru',
    contactPerson: 'Meena Nair',
    phone: '+91 98765 00003',
    address: 'Jayanagar, Bengaluru',
    accountStatus: 'active',
    verificationStatus: 'approved',
    isDemoAccount: true,
  });

  const pendingNGO = await User.create({
    name: 'Arjun Patel',
    email: 'arjun@foodbridge.demo',
    passwordHash,
    role: 'ngo',
    organizationName: 'Community Care Trust',
    contactPerson: 'Arjun Patel',
    phone: '+91 98765 00004',
    address: 'Whitefield, Bengaluru',
    accountStatus: 'active',
    verificationStatus: 'pending',
    isDemoAccount: true,
  });

  const volunteer = await User.create({
    name: 'Divya Reddy',
    email: 'divya@foodbridge.demo',
    passwordHash,
    role: 'volunteer',
    phone: '+91 98765 00005',
    address: 'BTM Layout, Bengaluru',
    accountStatus: 'active',
    verificationStatus: 'approved',
    isDemoAccount: true,
  });

  console.log('✅ Users seeded.');

  // ── Food Listings ──────────────────────────────────────
  const deadline1 = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hrs
  const deadline2 = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs
  const deadline3 = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hrs
  const pastDeadline = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hrs ago

  const listing1 = await FoodListing.create({
    donor: householdDonor._id,
    donorType: 'household_donor',
    title: 'Home-cooked Dal and Rice',
    description: 'Freshly prepared dal tadka and basmati rice for 10 people. Prepared at 6 AM today, stored in airtight containers.',
    category: 'cooked_meals',
    quantity: 10,
    unit: 'meals',
    availableFrom: new Date(),
    collectionDeadline: deadline1,
    storageCondition: 'Keep refrigerated. Best collected within 4 hours.',
    allergenInformation: 'Contains gluten (rice), lentils. No nuts.',
    allergenStatus: 'contains_allergens',
    pickupAddress: '12, Rose Garden Apartments, Koramangala, Bengaluru 560034',
    location: { type: 'Point', coordinates: [77.6278, 12.9352] },
    status: 'available',
  });

  const listing2 = await FoodListing.create({
    donor: orgDonor._id,
    donorType: 'organization_donor',
    title: 'Assorted Bakery Items',
    description: 'End-of-day bread loaves, croissants, and pastries from Sunrise Bakery. Baked fresh this morning.',
    category: 'bakery',
    quantity: 5,
    unit: 'packages',
    availableFrom: new Date(),
    collectionDeadline: deadline2,
    storageCondition: 'Room temperature is fine. Consume within 24 hours.',
    allergenInformation: 'Contains wheat, eggs, dairy (butter). May contain nuts.',
    allergenStatus: 'contains_allergens',
    pickupAddress: '45, CMH Road, Indiranagar, Bengaluru 560038',
    location: { type: 'Point', coordinates: [77.6408, 12.9784] },
    status: 'available',
  });

  const listing3 = await FoodListing.create({
    donor: householdDonor._id,
    donorType: 'household_donor',
    title: 'Fresh Vegetables',
    description: 'Seasonal vegetables including tomatoes, spinach, and carrots. From our garden, organic.',
    category: 'fruits_vegetables',
    quantity: 3,
    unit: 'kilograms',
    availableFrom: new Date(),
    collectionDeadline: deadline3,
    storageCondition: 'Keep cool. Will last 3–4 days in refrigerator.',
    allergenInformation: 'No known allergens.',
    allergenStatus: 'allergen_free',
    pickupAddress: '12, Rose Garden Apartments, Koramangala, Bengaluru 560034',
    location: { type: 'Point', coordinates: [77.6278, 12.9352] },
    status: 'available',
  });

  // Reserved listing
  const listing4 = await FoodListing.create({
    donor: orgDonor._id,
    donorType: 'organization_donor',
    title: 'Packaged Snacks',
    description: 'Unopened biscuit and namkeen packets, well within expiry date.',
    category: 'packaged_food',
    quantity: 20,
    unit: 'packages',
    availableFrom: new Date(Date.now() - 12 * 60 * 60 * 1000),
    collectionDeadline: deadline2,
    allergenStatus: 'unknown',
    pickupAddress: '45, CMH Road, Indiranagar, Bengaluru 560038',
    location: { type: 'Point', coordinates: [77.6408, 12.9784] },
    status: 'reserved',
  });

  // Expired listing
  const listing5 = await FoodListing.create({
    donor: householdDonor._id,
    donorType: 'household_donor',
    title: 'Cooked Biryani (Expired)',
    description: '[DEMO - EXPIRED] This listing is past its collection deadline.',
    category: 'cooked_meals',
    quantity: 15,
    unit: 'meals',
    availableFrom: new Date(Date.now() - 10 * 60 * 60 * 1000),
    collectionDeadline: pastDeadline,
    allergenStatus: 'unknown',
    pickupAddress: 'Koramangala, Bengaluru',
    location: { type: 'Point', coordinates: [77.6278, 12.9352] },
    status: 'expired',
  });

  console.log('✅ Food listings seeded.');

  // ── Donation Requests ──────────────────────────────────
  // Pending request
  await DonationRequest.create({
    listing: listing1._id,
    recipient: approvedNGO._id,
    requestedQuantity: 10,
    unit: 'meals',
    message: 'We serve lunch to 10 elderly residents daily. This would be very helpful!',
    status: 'pending',
  });

  // Accepted request with assigned volunteer (on reserved listing)
  const acceptedRequest = await DonationRequest.create({
    listing: listing4._id,
    recipient: approvedNGO._id,
    requestedQuantity: 20,
    unit: 'packages',
    message: 'For our weekly food drive.',
    status: 'accepted',
    decisionAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    decidedBy: orgDonor._id,
    assignedVolunteer: volunteer._id,
    scheduledPickupAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    pickupStatus: 'awaiting_pickup',
  });

  // Completed donation
  const completedListing = await FoodListing.create({
    donor: orgDonor._id,
    donorType: 'organization_donor',
    title: 'Bread Loaves (Completed)',
    description: '[DEMO - COMPLETED] A successfully completed donation.',
    category: 'bakery',
    quantity: 10,
    unit: 'packages',
    availableFrom: new Date(Date.now() - 48 * 60 * 60 * 1000),
    collectionDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
    allergenStatus: 'contains_allergens',
    pickupAddress: '45, CMH Road, Indiranagar, Bengaluru',
    location: { type: 'Point', coordinates: [77.6408, 12.9784] },
    status: 'collected',
  });

  await DonationRequest.create({
    listing: completedListing._id,
    recipient: approvedNGO._id,
    requestedQuantity: 10,
    unit: 'packages',
    status: 'completed',
    decisionAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
    decidedBy: orgDonor._id,
    pickupStatus: 'collected',
    completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    confirmationActor: approvedNGO._id,
  });

  console.log('✅ Donation requests seeded.');

  console.log('\n========================================');
  console.log('🌱 FoodBridge seed complete!');
  console.log('========================================');
  console.log('DEMO ACCOUNTS (all use password: Demo@1234):');
  console.log('  Admin:          admin@foodbridge.demo');
  console.log('  Household:      priya@foodbridge.demo');
  console.log('  Org Donor:      ravi@foodbridge.demo');
  console.log('  Approved NGO:   meena@foodbridge.demo');
  console.log('  Pending NGO:    arjun@foodbridge.demo');
  console.log('  Volunteer:      divya@foodbridge.demo');
  console.log('========================================');
  console.log('⚠️  These are demo accounts — do not use in production!');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
