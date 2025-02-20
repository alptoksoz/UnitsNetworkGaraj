const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Kullanıcının tüm işlemlerini getir
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });

        let totalSpent = 0;
        let totalCharged = 0;

        transactions.forEach(tx => {
            if (tx.type === "charging") {
                totalSpent += tx.amount;
                totalCharged += tx.amount / 5; // Farazi olarak 1 TL = 5 dk şarj
            }
        });

        res.json({
            totalSpent,
            totalCharged,
            transactions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
