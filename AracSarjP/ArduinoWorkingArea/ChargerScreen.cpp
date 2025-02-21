// ChargerScreen.cpp
#include "ChargerScreen.h"
#include <SPI.h>
#include "qrcode.h"
#include <math.h>


ChargerScreen::ChargerScreen(TFT_eSPI& tft) : _tft(tft) {}

void ChargerScreen::begin() {
  _tft.init();
  _tft.setRotation(3);
  _tft.setTextSize(1);
  clearScreen();
}

void ChargerScreen::clearScreen() {
  _tft.fillScreen(TFT_BLACK);
}

// Ana QR Ekranı (Gerçek QR Kodu)
void ChargerScreen::showCustomQR(const String& title, const String& qrData) {
  clearScreen();
  
  // Başlık
  _tft.setTextColor(TFT_WHITE, TFT_BLACK);
  _tft.setTextSize(2);
  _tft.setCursor(40, 10);
  _tft.println(title);

  // QR Kodu Oluştur
  QRCode qrcode;
  uint8_t qrVersion = 3;
  uint8_t qrErrorLevel = ECC_LOW;
  uint8_t qrBuffer[qrcode_getBufferSize(qrVersion)];
  qrcode_initText(&qrcode, qrBuffer, qrVersion, qrErrorLevel, qrData.c_str());
  
  drawQRCode(qrcode);
}

void ChargerScreen::drawQRCode(QRCode& qrcode) {
  const int qrSize = qrcode.size;
  const int displayWidth = _tft.width();
  const int scale = min(6, displayWidth / (qrSize + 8)); // Maksimum 3x ölçek

  int startX = (displayWidth - (qrSize * scale)) / 2;
  int startY = 60;

  for (uint8_t y = 0; y < qrSize; y++) {
    for (uint8_t x = 0; x < qrSize; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        _tft.fillRect(startX + x * scale, startY + y * scale, scale, scale, TFT_BLACK);
      } else {
        _tft.fillRect(startX + x * scale, startY + y * scale, scale, scale, TFT_WHITE);
      }
    }
  }
}




void ChargerScreen::showConnectionPending() {
  clearScreen();
  
  // Başlık
  _tft.setTextColor(TFT_GREEN, TFT_BLACK);
  _tft.setTextSize(2);
  _tft.setCursor(
    (_tft.width() - _tft.textWidth("Eslesme Basarili")) / 2, // Ortala
    80
  );
  _tft.println("Eslesme Basarili");

  // Alt metin
  _tft.setTextColor(TFT_WHITE, TFT_BLACK);
  _tft.setTextSize(2);
  _tft.setCursor(
    (_tft.width() - _tft.textWidth("Onay bekleniyor")) / 2,
    130
  );
  _tft.println("Onay bekleniyor");


  
}

void ChargerScreen::showConnectionPendingLoadingBar() {
  // Animasyon için yükleniyor çubuğu
  
    for(int i=0; i<5; i++) {
      _tft.fillCircle(60 + i*40, 200, 10, TFT_WHITE);
      delay(300);
      _tft.fillCircle(60 + i*40, 200, 10, TFT_BLACK);
    }
  

}

void ChargerScreen::showChargingStarting() {
  clearScreen();
  
  // Ana başlık
  _tft.setTextColor(TFT_CYAN, TFT_BLACK);
  _tft.setTextSize(2);
  _tft.setCursor(
    (_tft.width() - _tft.textWidth("SARJ BASLATILIYOR")) / 2,
    80
  );
  _tft.println("SARJ BASLATILIYOR");

  // Alt açıklama
  _tft.setTextColor(TFT_WHITE, TFT_BLACK);
  _tft.setTextSize(1);
  _tft.setCursor(
    (_tft.width() - _tft.textWidth("Lutfen bekleyiniz...")) / 2,
    120
  );
  _tft.println("Lutfen bekleyiniz...");

  // Daire animasyonu (Basit çember)
  int centerX = _tft.width() / 2;
  int centerY = 180;
  int radius = 20;
  
  for(int i=0; i<360; i+=30) {
    _tft.drawCircle(centerX, centerY, radius, TFT_BLACK);
    _tft.drawCircle(centerX, centerY, radius, TFT_CYAN);
    _tft.fillCircle(
      centerX + radius * cos(i * DEG_TO_RAD),
      centerY + radius * sin(i * DEG_TO_RAD),
      3, TFT_YELLOW
    );
    delay(150);
  }
}

void ChargerScreen::showChargingDetails(float progress, int watt, float totalKWh, float energyToken, const String& tokenAddress) {
  clearScreen();

  // Başlık
  _tft.setTextColor(TFT_CYAN, TFT_BLACK);
  _tft.drawString("SARJ ISTASYONU", 50, 10);

  // 1. Dairesel Progress Bar (%)
  int centerX = 60;
  int centerY = 80;
  int radius = 40;
  // Dış çember
  _tft.drawCircle(centerX, centerY, radius, TFT_WHITE);
  // Doluluk yayı
  _tft.drawArc(centerX, centerY, radius, 5, 0, progress*3.6, TFT_BLUE, TFT_BLACK, true);
  // Ortadaki yüzde
  _tft.setTextColor(TFT_WHITE);
  _tft.setTextSize(2);
  _tft.setCursor(centerX-15, centerY-10);
  _tft.printf("%.0f%%", progress);

  // 2. Watt ve Toplam Enerji
  _tft.setTextColor(TFT_GREEN);
  _tft.drawString("Guncel:", 130, 50);
  _tft.setTextColor(TFT_WHITE);
  _tft.drawString(String(watt)+" W", 130, 70);

  _tft.setTextColor(TFT_CYAN);
  _tft.drawString("Toplam:", 130, 100);
  _tft.setTextColor(TFT_WHITE);
  _tft.drawString(String(totalKWh,1)+" kWh", 130, 120);

  // 3. EnergyToken 
  _tft.setTextColor(TFT_GOLD);
  _tft.drawString("Ucret:", 130, 150);
  _tft.setTextColor(TFT_WHITE);
  _tft.drawString(String(energyToken,2)+" ET", 130, 170);

  // 4. Token Adresi (Alt kısım)
  _tft.setTextColor(TFT_DARKGREY);
  _tft.setTextSize(1);
  _tft.drawString(tokenAddress, (240-_tft.textWidth(tokenAddress))/2, 220);
}

void ChargerScreen::updateChargingStatus(bool isCharging, float current) {
    _tft.setTextColor(TFT_WHITE, TFT_BLACK);
    _tft.setTextSize(2);
    _tft.setCursor(10, 200);
    _tft.printf("Akim: %.2fA  ", current);
    
    _tft.setCursor(10, 220);
    if(isCharging) {
        _tft.setTextColor(TFT_GREEN, TFT_BLACK);
        _tft.print("SARJ AKTIF ");
    } else {
        _tft.setTextColor(TFT_RED, TFT_BLACK);
        _tft.print("SARJ BEKLENIYOR");
    }
}