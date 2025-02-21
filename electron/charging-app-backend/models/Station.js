const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema({
    name: { type: String, required: true }, // İstasyon adı
    maxPowerOutput: { type: Number, required: true }, // Maksimum güç çıkışı (kW)
    pricePerKw: { type: Number, required: true }, // kW başına ücret (TL)
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    status: { type: String, enum: ["available", "occupied", "reserved"], default: "available" }, // Meşguliyet durumu
    nextAvailableTime: { type: Date, default: null }, // Eğer doluysa ne zaman boşalacağı
    createdAt: { type: Date, default: Date.now } // Oluşturulma tarihi
});

module.exports = mongoose.model("Station", StationSchema);
