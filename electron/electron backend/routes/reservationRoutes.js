const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Station = require("../models/Station");
const Reservation = require("../models/Reservation");

const router = express.Router();

// Station durumunu otomatik güncellemek için yardımcı fonksiyon
const scheduleStationStatusUpdate = async (stationId, endTime, reservationId) => {
  const updateTime = new Date(endTime).getTime() - new Date().getTime();
  
  if (updateTime > 0) {
    setTimeout(async () => {
      try {
        // Rezervasyonun hala aktif olup olmadığını kontrol et
        const reservation = await Reservation.findById(reservationId);
        const station = await Station.findById(stationId);
        
        // Eğer rezervasyon hala varsa ve station hala reserved durumundaysa
        if (reservation && station.status === "reserved") {
          station.status = "available";
          station.nextAvailableTime = null;
          await station.save();
        }
      } catch (error) {
        console.error("Station status auto-update error:", error);
      }
    }, updateTime);
  }
};

router.post("/create", async (req, res) => {
  try {
    const { userId, stationId, endTime } = req.body;
    const startTime = new Date(); // Şu anki zaman

    // endTime'ı Date objesine çevir
    const endTimeDate = new Date(endTime);

    // Bitiş zamanının şu andan sonra olup olmadığını kontrol et
    if (endTimeDate <= startTime) {
      return res.status(400).json({ 
        error: "Bitiş zamanı şu andan sonra olmalıdır!" 
      });
    }

    // Kullanıcı ve istasyon kontrolü
    const user = await User.findById(userId);
    const station = await Station.findById(stationId);

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı!" });
    }

    if (!station) {
      return res.status(404).json({ error: "İstasyon bulunamadı!" });
    }

    if (station.status !== "available") {
      return res.status(400).json({ error: "Bu istasyon şu anda rezerve edilemez!" });
    }

    // Rezervasyon ücretini hesapla
    const durationInMinutes = (endTimeDate - startTime) / 60000;
    const amountPaid = durationInMinutes * station.pricePerKw * 0.5;

    // Kullanıcının bakiyesi yeterli mi?
    if (user.balance < amountPaid) {
      return res.status(400).json({ error: "Yetersiz bakiye!" });
    }

    // Transaction oluştur
    const transaction = new Transaction({
      userId: user._id,
      stationId: station._id,
      type: "reservation",
      amount: -amountPaid,
      date: startTime
    });
    await transaction.save();

    // Kullanıcının transactions dizisine ekle
    user.transactions.push(transaction._id);
    
    // Kullanıcının bakiyesini güncelle
    user.balance -= amountPaid;
    user.totalSpent += amountPaid;

    // Yeni rezervasyon oluştur
    const newReservation = new Reservation({
      userId,
      stationId,
      startTime,
      endTime: endTimeDate,
      amountPaid
    });
    await newReservation.save();

    // Kullanıcının reservations dizisine ekle
    user.reservations.push(newReservation._id);
    await user.save();

    // İstasyonu reserved olarak güncelle
    station.status = "reserved";
    station.nextAvailableTime = endTimeDate;
    await station.save();

    // Otomatik station durumu güncelleme zamanlaması yap
    scheduleStationStatusUpdate(stationId, endTimeDate, newReservation._id);

    res.json({
      message: "Rezervasyon başarıyla oluşturuldu!",
      reservation: newReservation,
      transaction: transaction
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Kullanıcının yaklaşan rezervasyonlarını getir
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const now = new Date();
        const reservations = await Reservation.find({
            userId,
            endTime: { $gte: now } // Şu andan sonrası için rezervasyonları getir
        }).populate("stationId");

        res.json(reservations.map(res => ({
            stationName: res.stationId.name,
            startTime: res.startTime,
            endTime: res.endTime,
            duration: (res.endTime - now) / 60000 + " dakika kaldı",
            resid: res._id

        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Rezervasyonu iptal et
router.post("/cancel", async (req, res) => {
    try {
        const { reservationId } = req.body;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ error: "Rezervasyon bulunamadı!" });
        }

        const station = await Station.findById(reservation.stationId);
        if (station) {
            station.status = "available";
            station.nextAvailableTime = null;
            await station.save();
        }

        await Reservation.findByIdAndDelete(reservationId);

        res.json({ message: "Rezervasyon başarıyla iptal edildi!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
