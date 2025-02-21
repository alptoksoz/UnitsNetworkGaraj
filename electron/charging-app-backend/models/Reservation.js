const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Kullanıcı ID'si
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true }, // İstasyon ID'si
    startTime: { type: Date, required: true }, // Rezervasyon başlangıç saati
    endTime: { type: Date, required: true }, // Rezervasyon bitiş saati
    amountPaid: { type: Number, required: true }, // Ödenen ücret
    createdAt: { type: Date, default: Date.now } // Oluşturulma tarihi
});

module.exports = mongoose.model("Reservation", ReservationSchema);
