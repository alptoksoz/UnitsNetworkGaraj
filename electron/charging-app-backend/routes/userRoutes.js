const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Kullanıcı Kaydı
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, walletAddress, balance } = req.body;
    
    // Önce wallet adresi ile kullanıcı var mı kontrol et
    let user = await User.findOne({ walletAddress });
    
    if (user) {
      // Kullanıcı varsa bilgilerini güncelle
      user.balance = balance || user.balance;
      await user.save();
    } else {
      // Yeni kullanıcı oluştur
      user = new User({
        name,
        email,
        password,
        walletAddress,
        balance: balance || 0
      });
      await user.save();
    }

    res.json({
      message: "Kullanıcı işlemi başarılı!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        balance: user.balance
      }
    });
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


// Mevcut userRoutes.js dosyasına ekleyin
router.post("/update-wallet", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      // Wallet adresi ile kullanıcıyı bul veya oluştur
      let user = await User.findOne({ walletAddress });
      
      if (!user) {
        // Yeni kullanıcı oluştur
        user = new User({
          walletAddress,
          name: `User-${walletAddress.slice(0, 6)}`,
          email: `${walletAddress.slice(0, 6)}@example.com`,
          password: 'wallet-auth' // Bu kısmı daha güvenli bir şekilde yönetebilirsiniz
        });
      }
  
      await user.save();
      
      res.json({
        message: "Wallet address updated successfully",
        user: {
          id: user._id,
          address: user.walletAddress,
          balance: user.balance
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // Test endpoint'i ekle
router.get("/test", (req, res) => {
    res.json({ message: "Backend connection successful!" });
  });
  
  // Update wallet endpoint'ini güncelle
  router.post("/update-wallet", async (req, res) => {
    try {
      const { walletAddress, chainId } = req.body;
      console.log('Wallet update request:', { walletAddress, chainId });
  
      // Wallet adresi ile kullanıcıyı bul veya oluştur
      let user = await User.findOne({ walletAddress });
      
      if (!user) {
        // Yeni kullanıcı oluştur
        user = new User({
          walletAddress,
          name: `User-${walletAddress.slice(0, 6)}`,
          email: `${walletAddress.slice(0, 6)}@example.com`,
          password: 'wallet-auth'
        });
      }
  
      await user.save();
      
      res.json({
        message: "Wallet address updated successfully",
        user: {
          id: user._id,
          address: user.walletAddress,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Wallet update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Wallet adresi ile kullanıcı bulma
router.post("/find-by-wallet", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const user = await User.findOne({ walletAddress });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({
        message: "User found",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
          balance: user.balance
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
