const express = require("express");
const User = require("../models/User");
const Station = require("../models/Station");
const Transaction = require("../models/Transaction");
const ChargingSession = require("../models/ChargingSession");
const Reservation = require("../models/Reservation");
const router = express.Router();

// Ana Sayfa API'si
router.get("/main/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Kullanıcı bilgilerini getir
    const user = await User.findById(userId).select('name balance');
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı!" });
    }

    // Tüm istasyonların bilgilerini getir
    const stations = await Station.find().select(
      'name maxPowerOutput pricePerKw status nextAvailableTime location'
    );

    res.json({
      user: {
        name: user.name,
        balance: user.balance
      },
      stations: stations.map(station => ({
        id: station._id,
        name: station.name,
        maxPowerOutput: station.maxPowerOutput,
        pricePerKw: station.pricePerKw,
        status: station.status,
        nextAvailableTime: station.nextAvailableTime,
        location: station.location
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// İşlem Geçmişi Sayfası API'si
router.get("/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Kullanıcının tüm işlemlerini getir
    const transactions = await Transaction.find({ userId })
      .populate('stationId', 'name')
      .sort({ date: -1 });

    // Toplam harcama ve şarj süresi hesapla
    let totalSpent = 0;
    let totalCharged = 0;

    transactions.forEach(tx => {
      if (tx.type === "charging" || tx.type === "reservation") {
        totalSpent += Math.abs(tx.amount);
      }
      if (tx.type === "charging") {
        totalCharged += Math.abs(tx.amount) / tx.stationId.pricePerKw; // Yaklaşık şarj süresi
      }
    });

    res.json({
      summary: {
        totalSpent: totalSpent.toFixed(2),
        totalCharged: totalCharged.toFixed(2)
      },
      transactions: transactions.map(tx => ({
        id: tx._id,
        stationName: tx.stationId ? tx.stationId.name : 'Sistem',
        type: tx.type,
        amount: tx.amount,
        date: tx.date
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktif İşlemler Sayfası API'si
router.get("/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    // Aktif rezervasyonları getir
    const activeReservations = await Reservation.find({
      userId,
      endTime: { $gt: now }
    }).populate('stationId', 'name maxPowerOutput pricePerKw');

    // Aktif şarj işlemini getir
    const activeCharging = await ChargingSession.findOne({
      user: userId,
      status: "active"
    }).populate('station', 'name maxPowerOutput pricePerKw');

    // Response objesi
    const response = {
      activeReservations: activeReservations.map(res => ({
        id: res._id,
        stationName: res.stationId.name,
        startTime: res.startTime,
        endTime: res.endTime,
        remainingTime: Math.round((res.endTime - now) / 60000), // Dakika cinsinden
        amount: res.amountPaid
      })),
      activeCharging: activeCharging ? {
        id: activeCharging._id,
        stationName: activeCharging.station.name,
        power: activeCharging.realTimePower,
        elapsedTime: Math.round((now - activeCharging.startedAt) / 60000), // Dakika
        pricePerKw: activeCharging.station.pricePerKw,
        batteryPercentage: activeCharging.batteryPercentage,
        totalChargedMah: activeCharging.totalChargedMah,
        estimatedCompletionTime: activeCharging.estimatedCompletionTime,
        batteryTemperature: activeCharging.batteryTemperature,
        humidity: activeCharging.humidity,
        currentCost: (activeCharging.totalEnergyTokenUsed * activeCharging.station.pricePerKw).toFixed(2)
      } : null
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;