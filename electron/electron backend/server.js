require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require("./routes/userRoutes");
const stationRoutes = require("./routes/stationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const chargingSessionRoutes = require("./routes/chargingSessionRoutes");

const pageApis = require('./routes/pageApis');

const app = express(); // ✅ `app` önce tanımlandı!

app.use(express.json());
app.use(cors());

// MongoDB'ye Bağlan
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// 📌 Route'ları dahil et
app.use("/users", userRoutes);
app.use("/stations", stationRoutes);
app.use("/transactions", transactionRoutes);
app.use("/reservations", reservationRoutes);
app.use("/charging-sessions", chargingSessionRoutes);

app.use("/pages", pageApis);

// Sunucuyu Başlat
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
