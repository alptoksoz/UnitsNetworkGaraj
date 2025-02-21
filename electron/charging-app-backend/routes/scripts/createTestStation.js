require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('../models/Station');

// MongoDB'ye bağlan
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Test istasyonları
const testStations = [
  {
    name: "Kızılay Charging Station",
    maxPowerOutput: 50,
    pricePerKw: 2.2,
    location: {
      latitude: 39.92077,
      longitude: 32.85411
    },
    status: "available"
  },
  {
    name: "Çankaya Charging Station",
    maxPowerOutput: 30,
    pricePerKw: 1.8,
    location: {
      latitude: 39.91077,
      longitude: 32.85211
    },
    status: "available"
  },
  {
    name: "Eryaman Charging Station",
    maxPowerOutput: 40,
    pricePerKw: 2.5,
    location: {
      latitude: 39.97667,
      longitude: 32.67942
    },
    status: "available"
  }
];

// İstasyonları kaydet
async function createStations() {
  try {
    // Önce tüm istasyonları sil (test için)
    await Station.deleteMany({});
    console.log('Existing stations deleted');

    // Yeni istasyonları oluştur
    for (const station of testStations) {
      const newStation = new Station(station);
      await newStation.save();
      console.log(`Station created: ${station.name}`);
    }

    console.log('All test stations created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating stations:', error);
    process.exit(1);
  }
}

createStations();