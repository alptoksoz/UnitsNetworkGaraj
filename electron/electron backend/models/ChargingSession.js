const mongoose = require("mongoose");

const chargingSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Kullanıcı ID
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true }, // İstasyon ID
  startedAt: { type: Date, default: Date.now }, // Şarjın başladığı zaman
  realTimePower: { type: Number, default: 0 }, // Anlık güç çıkışı (W)
  batteryPercentage: { type: Number, default: 0 }, // Arabanın anlık batarya yüzdesi
  totalChargedMah: { type: Number, default: 0 }, // Kaç mAh doldu
  totalEnergyTokenUsed: { type: Number, default: 0 }, // Harcanan enerji token
  estimatedCompletionTime: { type: Number, default: 0 }, // Tahmini bitiş süresi (dakika)
  batteryTemperature: { type: Number, default: 0 }, // Batarya sıcaklığı (°C)
  humidity: { type: Number, default: 0 }, // Ortam nemi (%)
  status: { type: String, enum: ["active", "completed"], default: "active" }, // Aktif mi tamamlandı mı
});

module.exports = mongoose.model("ChargingSession", chargingSessionSchema);
