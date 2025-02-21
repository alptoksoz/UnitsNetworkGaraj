// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddress: { type: String, unique: true, sparse: true }, // Ethereum adresi
  balance: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalCharged: { type: Number, default: 0 },
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);