const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Kullanıcı Kaydı
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.json({ message: "Kullanıcı başarıyla kaydedildi!", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Kullanıcı Bakiyesi Güncelleme
router.post("/update-balance", async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı!" });

        user.balance += amount;
        await user.save();
        res.json({ message: "Bakiye güncellendi!", balance: user.balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
