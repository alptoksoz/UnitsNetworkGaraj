const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Kullanıcı ID'si
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true }, // İstasyon ID'si
    type: { type: String, enum: ["deposit", "reservation", "charging"], required: true }, // İşlem türü
    amount: { type: Number, required: true }, // İşlem miktarı (TL)
    date: { type: Date, default: Date.now } // İşlem tarihi
});

module.exports = mongoose.model("Transaction", TransactionSchema);
