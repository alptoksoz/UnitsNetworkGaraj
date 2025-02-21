#include <WiFi.h>
#include <Wire.h>
#include "INA219Manager.h"
#include "SHT30Manager.h"
#include "RelayManager.h"
#include "VehicleSensor.h"
#include "WebServerManager.h"
#include "SystemManager.h"
#include "ChargerScreen.h"
#include <TFT_eSPI.h>
#include "ChargerScreen.h"
// Pin definitions
#define RELAY_PIN 27      // GPIO23
#define SENSOR_PIN 19     // GPIO22
#define SDA_PIN 21        // GPIO21
#define SCL_PIN 22        // GPIO19

// WiFi settings
const char* ssid = "Ev Modem";
const char* password = "3908802z.";

// System managers
SystemManager systemManager(RELAY_PIN, SENSOR_PIN);
WebServerManager webManager(&systemManager);
TFT_eSPI tft;
ChargerScreen screen(tft);

void setup() {
    Serial.begin(115200);
    Serial.println("\nStarting system...");
    
    // Initialize screen
    screen.begin();
    screen.showCustomQR("GARAJ NISANTASI", "exp://172.18.6.217:8081");
    
    // Initialize I2C
    Wire.begin(SDA_PIN, SCL_PIN);
    
    // Connect to WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    // Initialize system
    if (!systemManager.begin()) {
        Serial.println("Failed to initialize system!");
        while(1) delay(1000);
    }
    
    // Initialize web server
    webManager.begin();
    
    // Ekranı SystemManager'a bağla
    systemManager.setScreen(&screen);
    
    // QR kodu göster
    screen.showCustomQR("GARAJ NISANTASI", "exp://172.18.6.217:8081");
    
    Serial.println("System initialized successfully");
}

void loop() {
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Reconnecting...");
        WiFi.begin(ssid, password);
        delay(5000);
        return;
    }
    
    // Update system and web server
    systemManager.update();
    webManager.update();
    
    // Broadcast state every second
    static unsigned long lastUpdate = 0;
    if (millis() - lastUpdate > 1000) {
        webManager.broadcastState();
        lastUpdate = millis();
    }
}