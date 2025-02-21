const express = require("express");
const Station = require("../models/Station");
const router = express.Router();

// Tüm istasyonları getir
router.get("/", async (req, res) => {
    try {
        const stations = await Station.find();
        res.json(stations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Yeni istasyon ekleme
router.post("/add", async (req, res) => {
    try {
        const { name, maxPowerOutput, pricePerKw, latitude, longitude } = req.body;
        const newStation = new Station({ name, maxPowerOutput, pricePerKw, location: { latitude, longitude } });
        await newStation.save();
        res.json({ message: "İstasyon başarıyla eklendi!", station: newStation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Backend'de bir yerde çalıştırın

const testStation = new Station({
  name: "Test Charging Station",
  maxPowerOutput: 50,
  pricePerKw: 2.5,
  location: {
    latitude: 39.92077,
    longitude: 32.85411
  },
  status: "available"
});

testStation.save().then(() => console.log('Test station created'));

module.exports = router;
