// ChargerScreen.h
#ifndef CHARGER_SCREEN_H
#define CHARGER_SCREEN_H

#include <TFT_eSPI.h>
#include "qrcode.h"

class ChargerScreen {
public:
  ChargerScreen(TFT_eSPI& tft);
  void begin();
  void showCharging(float progress);
  void showError(const String& message);
  void showCustomQR(const String& title, const String& qrData);
  void showConnectionPending(); 
  void showConnectionPendingLoadingBar();
  void showChargingStarting();
  void showChargingDetails(float progress, int watt, float totalKWh, float energyToken, const String& tokenAddress);
  void clearScreen();
  void updateChargingStatus(bool isCharging, float current);

private:
  TFT_eSPI& _tft;
  void drawProgressBar(int x, int y, int width, int height, float progress);
  void drawQRCode(QRCode& qrcode);
};

#endif