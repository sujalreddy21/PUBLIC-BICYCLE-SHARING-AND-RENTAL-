const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');

dotenv.config();

const User = require('../models/User');
const Station = require('../models/Station');
const Bicycle = require('../models/Bicycle');
const MembershipPlan = require('../models/MembershipPlan');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');

const seedAllData = async () => {
  try {
    console.log('Seeding Public Bicycle Sharing System database...');

    // Clear existing collections
    await User.deleteMany();
    await Station.deleteMany();
    await Bicycle.deleteMany();
    await MembershipPlan.deleteMany();
    await Rental.deleteMany();
    await Maintenance.deleteMany();
    await Payment.deleteMany();
    await Reservation.deleteMany();

    console.log('Cleaned existing collections.');

    // 1. Seed Membership Plans
    const plans = await MembershipPlan.create([
      {
        name: 'Daily Pass',
        code: 'DAILY',
        price: 49,
        durationDays: 1,
        freeMinutesPerRide: 30,
        hourlyRateAfterFree: 15,
        description: 'Ideal for short commute and city visitors.',
        features: ['30 mins free per ride', 'Standard & Geared bikes', 'Instant unlock', 'Standard customer support']
      },
      {
        name: 'Weekly Pass',
        code: 'WEEKLY',
        price: 199,
        durationDays: 7,
        freeMinutesPerRide: 45,
        hourlyRateAfterFree: 12,
        description: 'Best for weekly commuters and project travelers.',
        features: ['45 mins free per ride', 'All bike types including Electric', 'Priority station reservations', 'Quick unlock']
      },
      {
        name: 'Monthly Pass',
        code: 'MONTHLY',
        price: 499,
        durationDays: 30,
        freeMinutesPerRide: 60,
        hourlyRateAfterFree: 10,
        description: 'Most popular! Perfect for regular daily commuters.',
        features: ['60 mins free per ride', 'Free reservation holds up to 45 mins', 'Electric bikes included', '15% ride discounts']
      },
      {
        name: 'Annual Pass',
        code: 'ANNUAL',
        price: 3499,
        durationDays: 365,
        freeMinutesPerRide: 90,
        hourlyRateAfterFree: 8,
        description: 'Ultimate convenience for year-round eco commuters.',
        features: ['90 mins free per ride', 'VIP priority reservations', 'All bike types & premium e-bikes', '24/7 dedicated support', 'Zero unlock fees']
      }
    ]);
    console.log(`Seeded ${plans.length} membership plans.`);

    // 2. Seed Stations (5 stations)
    const stations = await Station.create([
      {
        name: 'Central Metro Station Hub',
        code: 'STN-001',
        address: 'MG Road Metro Junction, Concourse Level',
        city: 'Metro City',
        coordinates: { lat: 17.3850, lng: 78.4867 },
        capacity: 15,
        contactPhone: '+91 98765 43211'
      },
      {
        name: 'Tech Park Cyber Gateway',
        code: 'STN-002',
        address: 'Hitech Boulevard, Phase 2 Entrance',
        city: 'Metro City',
        coordinates: { lat: 17.4485, lng: 78.3745 },
        capacity: 12,
        contactPhone: '+91 98765 43212'
      },
      {
        name: 'University Campus South',
        code: 'STN-003',
        address: 'Academic Complex, Main Library Circle',
        city: 'Metro City',
        coordinates: { lat: 17.4123, lng: 78.5284 },
        capacity: 10,
        contactPhone: '+91 98765 43213'
      },
      {
        name: 'Waterfront Lake Promenade',
        code: 'STN-004',
        address: 'Necklace Road, Boat Club Pier',
        city: 'Metro City',
        coordinates: { lat: 17.4239, lng: 78.4738 },
        capacity: 12,
        contactPhone: '+91 98765 43214'
      },
      {
        name: 'Green Valley Residential Park',
        code: 'STN-005',
        address: 'Jubilee Enclave, Sector 4 Community Center',
        city: 'Metro City',
        coordinates: { lat: 17.4319, lng: 78.4073 },
        capacity: 8,
        contactPhone: '+91 98765 43215'
      }
    ]);
    console.log(`Seeded ${stations.length} stations.`);

    // 3. Seed Users
    // Admin, Operations Manager, 2 Station Attendants, Members
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@pbs.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 99000 11223',
      walletBalance: 1000
    });

    const opsUser = await User.create({
      name: 'Operations Manager',
      email: 'ops@pbs.com',
      password: 'Ops@123',
      role: 'operations_manager',
      phone: '+91 99000 22334',
      walletBalance: 500
    });

    const attendant1 = await User.create({
      name: 'Ramesh Sharma (Attendant)',
      email: 'attendant1@pbs.com',
      password: 'Attendant@123',
      role: 'station_attendant',
      phone: '+91 99000 33445',
      assignedStation: stations[0]._id, // Central Metro Station
      walletBalance: 200
    });

    const attendant2 = await User.create({
      name: 'Sunita Verma (Attendant)',
      email: 'attendant2@pbs.com',
      password: 'Attendant@123',
      role: 'station_attendant',
      phone: '+91 99000 44556',
      assignedStation: stations[1]._id, // Tech Park
      walletBalance: 200
    });

    const monthlyPlan = plans.find(p => p.code === 'MONTHLY');
    const annualPlan = plans.find(p => p.code === 'ANNUAL');

    const member1 = await User.create({
      name: 'SUJAL REDDY',
      email: 'sujal@pbs.com',
      password: 'Member@123',
      role: 'member',
      phone: '+91 98765 12345',
      walletBalance: 450,
      membership: {
        plan: annualPlan._id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        status: 'Active'
      }
    });

    const member2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@pbs.com',
      password: 'Member@123',
      role: 'member',
      phone: '+91 98765 67890',
      walletBalance: 250,
      membership: {
        plan: monthlyPlan._id,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'Active'
      }
    });

    const member3 = await User.create({
      name: 'Rahul Varma',
      email: 'rahul@pbs.com',
      password: 'Member@123',
      role: 'member',
      phone: '+91 98765 99887',
      walletBalance: 150
    });

    console.log('Seeded users (Admin, Ops, 2 Attendants, 3 Members).');

    // 4. Seed 26 Bicycles across stations
    const bikeConfigs = [
      // Station 0: Central Metro Station (6 bikes)
      { bikeCode: 'BIK-101', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[0]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-102', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[0]._id, status: 'Available', batteryLevel: 94 },
      { bikeCode: 'BIK-103', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[0]._id, status: 'Available', batteryLevel: 88 },
      { bikeCode: 'BIK-104', model: 'UrbanSpeed 7-Gear', type: 'Geared', currentStation: stations[0]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-105', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[0]._id, status: 'Under Maintenance', batteryLevel: 100, conditionNotes: 'Chain slippage issue' },
      { bikeCode: 'BIK-106', model: 'Harbor Cruiser', type: 'Cruiser', currentStation: stations[0]._id, status: 'Reserved', batteryLevel: 100 },

      // Station 1: Tech Park Gateway (5 bikes)
      { bikeCode: 'BIK-201', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[1]._id, status: 'Available', batteryLevel: 98 },
      { bikeCode: 'BIK-202', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[1]._id, status: 'Available', batteryLevel: 75 },
      { bikeCode: 'BIK-203', model: 'UrbanSpeed 7-Gear', type: 'Geared', currentStation: stations[1]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-204', model: 'UrbanSpeed 7-Gear', type: 'Geared', currentStation: stations[1]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-205', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[1]._id, status: 'Available', batteryLevel: 100 },

      // Station 2: University Campus (5 bikes)
      { bikeCode: 'BIK-301', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[2]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-302', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[2]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-303', model: 'UrbanSpeed 7-Gear', type: 'Geared', currentStation: stations[2]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-304', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[2]._id, status: 'Under Maintenance', batteryLevel: 42, conditionNotes: 'Brake pad inspection' },
      { bikeCode: 'BIK-305', model: 'Harbor Cruiser', type: 'Cruiser', currentStation: stations[2]._id, status: 'Available', batteryLevel: 100 },

      // Station 3: Waterfront Promenade (5 bikes)
      { bikeCode: 'BIK-401', model: 'Harbor Cruiser', type: 'Cruiser', currentStation: stations[3]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-402', model: 'Harbor Cruiser', type: 'Cruiser', currentStation: stations[3]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-403', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[3]._id, status: 'Available', batteryLevel: 92 },
      { bikeCode: 'BIK-404', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[3]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-405', model: 'UrbanSpeed 7-Gear', type: 'Geared', currentStation: stations[3]._id, status: 'Available', batteryLevel: 100 },

      // Station 4: Green Valley Park (5 bikes)
      { bikeCode: 'BIK-501', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[4]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-502', model: 'VoltGlide E-Bike', type: 'Electric', currentStation: stations[4]._id, status: 'Available', batteryLevel: 85 },
      { bikeCode: 'BIK-503', model: 'UrbanSpeed 7-Gear', type: 'Geared', currentStation: stations[4]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-504', model: 'Harbor Cruiser', type: 'Cruiser', currentStation: stations[4]._id, status: 'Available', batteryLevel: 100 },
      { bikeCode: 'BIK-505', model: 'EcoRide Classic', type: 'Standard', currentStation: stations[4]._id, status: 'Available', batteryLevel: 100 }
    ];

    const bikes = await Bicycle.create(bikeConfigs);
    console.log(`Seeded ${bikes.length} bicycles.`);

    // 5. Update station inventories
    for (const stn of stations) {
      const bList = bikes.filter(b => b.currentStation.toString() === stn._id.toString());
      const avail = bList.filter(b => b.status === 'Available');
      await Station.findByIdAndUpdate(stn._id, {
        occupiedSlotsCount: bList.length,
        availableBikesCount: avail.length
      });
    }

    // 6. Seed Sample Active Reservation for BIK-106 by Priya
    const bike106 = bikes.find(b => b.bikeCode === 'BIK-106');
    await Reservation.create({
      reservationCode: 'RSV-202611-1001',
      user: member2._id,
      bicycle: bike106._id,
      station: stations[0]._id,
      reservedAt: new Date(Date.now() - 10 * 60 * 1000),
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      status: 'Active',
      notes: 'Commute reservation to Tech Park'
    });

    // 7. Seed Sample Historical Rentals & Active Rental
    const rentals = await Rental.create([
      {
        rentalId: 'RNT-20261101-1001',
        user: member1._id,
        bicycle: bikes[0]._id,
        pickupStation: stations[0]._id,
        returnStation: stations[1]._id,
        checkoutTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        returnTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        durationMinutes: 45,
        baseFare: 20,
        durationFare: 10,
        discountAmount: 10,
        totalCharge: 20,
        paymentStatus: 'Paid',
        rentalStatus: 'Completed'
      },
      {
        rentalId: 'RNT-20261103-1002',
        user: member1._id,
        bicycle: bikes[1]._id,
        pickupStation: stations[1]._id,
        returnStation: stations[2]._id,
        checkoutTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        returnTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        durationMinutes: 30,
        baseFare: 20,
        durationFare: 0,
        discountAmount: 10,
        totalCharge: 10,
        paymentStatus: 'Paid',
        rentalStatus: 'Completed'
      },
      {
        rentalId: 'RNT-20261105-1003',
        user: member2._id,
        bicycle: bikes[2]._id,
        pickupStation: stations[3]._id,
        returnStation: stations[0]._id,
        checkoutTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        returnTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000),
        durationMinutes: 75,
        baseFare: 20,
        durationFare: 20,
        discountAmount: 10,
        totalCharge: 30,
        paymentStatus: 'Paid',
        rentalStatus: 'Completed'
      },
      {
        rentalId: 'RNT-20261108-1004',
        user: member3._id,
        bicycle: bikes[3]._id,
        pickupStation: stations[2]._id,
        returnStation: stations[4]._id,
        checkoutTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        returnTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
        durationMinutes: 50,
        baseFare: 20,
        durationFare: 20,
        discountAmount: 0,
        totalCharge: 40,
        paymentStatus: 'Paid',
        rentalStatus: 'Completed'
      },
      {
        rentalId: 'RNT-20261111-1005',
        user: member2._id,
        bicycle: bikes[4]._id,
        pickupStation: stations[1]._id,
        returnStation: stations[3]._id,
        checkoutTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        returnTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        durationMinutes: 60,
        baseFare: 20,
        durationFare: 15,
        discountAmount: 10,
        totalCharge: 25,
        paymentStatus: 'Paid',
        rentalStatus: 'Completed'
      }
    ]);
    console.log(`Seeded ${rentals.length} sample rental records.`);

    // 8. Seed Maintenance Tickets
    const bike105 = bikes.find(b => b.bikeCode === 'BIK-105');
    const bike304 = bikes.find(b => b.bikeCode === 'BIK-304');

    await Maintenance.create([
      {
        maintenanceCode: 'MNT-202611-101',
        bicycle: bike105._id,
        reportedBy: attendant1._id,
        assignedTo: 'Rapid Mechanics Unit 1',
        issueType: 'Chain Broken',
        description: 'Rear derailleur chain slipped and jammed during morning check.',
        priority: 'High',
        status: 'In Progress',
        cost: 350
      },
      {
        maintenanceCode: 'MNT-202611-102',
        bicycle: bike304._id,
        reportedBy: opsUser._id,
        assignedTo: 'ElectroTech Diagnostics',
        issueType: 'Battery Drain',
        description: 'Battery capacity dropping rapidly below 45% within short distance.',
        priority: 'Medium',
        status: 'Pending',
        cost: 0
      },
      {
        maintenanceCode: 'MNT-202611-100',
        bicycle: bikes[0]._id,
        reportedBy: adminUser._id,
        assignedTo: 'Fleet Care Team',
        issueType: 'Routine Inspection',
        description: 'Quarterly brake pads, tyre pressure and gear alignment tuning.',
        priority: 'Low',
        status: 'Completed',
        cost: 200,
        repairNotes: 'Complete tune-up performed. All tests passed smoothly.',
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('Seeded maintenance records.');

    // 9. Seed Payments
    await Payment.create([
      {
        paymentId: 'PAY-202611-001',
        user: member1._id,
        membershipPlan: annualPlan._id,
        type: 'Membership',
        amount: annualPlan.price,
        paymentMethod: 'UPI',
        status: 'Success'
      },
      {
        paymentId: 'PAY-202611-002',
        user: member2._id,
        membershipPlan: monthlyPlan._id,
        type: 'Membership',
        amount: monthlyPlan.price,
        paymentMethod: 'Credit Card',
        status: 'Success'
      },
      {
        paymentId: 'PAY-202611-003',
        user: member1._id,
        rental: rentals[0]._id,
        type: 'Rental',
        amount: 20,
        paymentMethod: 'Wallet',
        status: 'Success'
      },
      {
        paymentId: 'PAY-202611-004',
        user: member2._id,
        rental: rentals[2]._id,
        type: 'Rental',
        amount: 30,
        paymentMethod: 'UPI',
        status: 'Success'
      },
      {
        paymentId: 'PAY-202611-005',
        user: member3._id,
        rental: rentals[3]._id,
        type: 'Rental',
        amount: 40,
        paymentMethod: 'Debit Card',
        status: 'Success'
      }
    ]);
    console.log('Seeded payment records.');

    console.log('Database seeding successfully completed!');
    return true;
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
};

// If run directly via CLI
if (require.main === module) {
  connectDB().then(async () => {
    try {
      await seedAllData();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}

module.exports = seedAllData;
