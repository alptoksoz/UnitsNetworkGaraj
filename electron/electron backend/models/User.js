const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Kullanıcının adı
    email: { type: String, required: true, unique: true }, // Kullanıcının email adresi
    password: { type: String, required: true }, // Şifre (hashlenecek)
    balance: { type: Number, default: 0 }, // Kullanıcının bakiyesi (TL veya kredi)
    totalSpent: { type: Number, default: 0 }, // Kullanıcının toplam harcadığı miktar
    totalCharged: { type: Number, default: 0 }, // Kullanıcının toplam şarj süresi (saat)
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }], // Kullanıcının rezervasyonları
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }], // Kullanıcının yaptığı işlemler
    createdAt: { type: Date, default: Date.now } // Kullanıcının oluşturulma tarihi
});

module.exports = mongoose.model("User", UserSchema);
