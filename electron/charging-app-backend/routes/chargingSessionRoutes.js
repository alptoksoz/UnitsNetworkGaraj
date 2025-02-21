const express = require("express");
const ChargingSession = require("../models/ChargingSession");
const User = require("../models/User");
const Station = require("../models/Station");
const Transaction = require("../models/Transaction");
const router = express.Router();

// Kullanıcının aktif şarj bilgilerini getir
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const session = await ChargingSession.findOne({ 
      user: userId, 
      status: "active" 
    }).populate("station");

    if (!session) {
      return res.status(404).json({ message: "Aktif şarj işlemi bulunamadı!" });
    }

    res.json({
      stationName: session.station.name,
      power: session.realTimePower,
      batteryPercentage: session.batteryPercentage,
      totalMah: session.totalChargedMah,
      cost: session.totalEnergyTokenUsed,
      remainingTime: session.estimatedCompletionTime,
      batteryTemperature: session.batteryTemperature,
      humidity: session.humidity,
      seId: session._id,
      startedAt: session.startedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Şarj başlatma
router.post("/start", async (req, res) => {
  try {
    const { user, station } = req.body;

    // Kullanıcı ve istasyon kontrolü
    const existingUser = await User.findById(user);
    const existingStation = await Station.findById(station);

    if (!existingUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı!" });
    }
    if (!existingStation) {
      return res.status(404).json({ error: "İstasyon bulunamadı!" });
    }
    if (existingStation.status !== "available") {
      return res.status(400).json({ error: "Bu istasyon şu anda uygun değil!" });
    }

    // Minimum bakiye kontrolü (örneğin 10 TL)
    const minBalance = 10;
    if (existingUser.balance < minBalance) {
      return res.status(400).json({ error: "Yetersiz bakiye! Minimum 10 TL bakiye gerekli." });
    }

    // Yeni şarj oturumu başlat
    const session = new ChargingSession({
      user,
      station,
      realTimePower: existingStation.maxPowerOutput,
      batteryPercentage: 0,
      totalChargedMah: 0,
      totalEnergyTokenUsed: 0,
      estimatedCompletionTime: 60,
      batteryTemperature: 25,
      humidity: 50,
      status: "active"
    });

    // Başlangıç transaction'ı oluştur (Depozito için)
    const startTransaction = new Transaction({
      userId: user,
      stationId: station,
      type: "charging",
      amount: -minBalance, // Başlangıç rezervasyonu için bloke edilen miktar
      date: new Date()
    });

    // İstasyon durumunu güncelle
    existingStation.status = "occupied";
    
    // Kullanıcı bakiyesini güncelle
    existingUser.balance -= minBalance;
    existingUser.transactions.push(startTransaction._id);

    // Tüm değişiklikleri kaydet
    await session.save();
    await startTransaction.save();
    await existingStation.save();
    await existingUser.save();

    res.json({ 
      message: "Şarj başlatıldı!", 
      session,
      transaction: startTransaction 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Şarjı durdurma
router.post("/stop", async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await ChargingSession.findById(sessionId)
      .populate('user')
      .populate('station');

    if (!session || session.status !== "active") {
      return res.status(400).json({ message: "Şarj işlemi aktif değil!" });
    }

    // Şarj süresini hesapla (dakika)
    const chargingTime = (new Date() - session.startedAt) / (1000 * 60);
    
    // Toplam ücreti hesapla (örnek hesaplama)
    const totalCost = (session.realTimePower * chargingTime * session.station.pricePerKw) / 60;
    
    // Final transaction'ı oluştur
    const stopTransaction = new Transaction({
      userId: session.user._id,
      stationId: session.station._id,
      type: "charging",
      amount: -totalCost,
      date: new Date()
    });

    // Session'ı güncelle
    session.status = "completed";
    session.totalEnergyTokenUsed = totalCost;
    
    // Kullanıcı bilgilerini güncelle
    const user = session.user;
    user.balance -= totalCost;
    user.totalSpent += totalCost;
    user.totalCharged += chargingTime / 60; // Saate çevir
    user.transactions.push(stopTransaction._id);

    // İstasyonu güncelle
    const station = session.station;
    station.status = "available";
    station.nextAvailableTime = null;

    // Tüm değişiklikleri kaydet
    await stopTransaction.save();
    await session.save();
    await user.save();
    await station.save();

    res.json({ 
      message: "Şarj işlemi durduruldu!", 
      session,
      transaction: stopTransaction,
      totalCost,
      chargingTime: Math.round(chargingTime)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;