#include "SystemManager.h"

SystemManager* SystemManager::instance = nullptr;

SystemManager::SystemManager(uint8_t relayPin, uint8_t vehicleSensorPin) :
    chargeRelay(relayPin),
    vehicleSensor(vehicleSensorPin),
    isInitialized(false),
    isPaired(false)
{
    instance = this;
}

bool SystemManager::begin() {
    // Initialize I2C sensors
    if (!powerSensor.begin()) {
        Serial.println("Failed to initialize INA219!");
        return false;
    }
    
    if (!tempSensor.begin()) {
        Serial.println("Failed to initialize SHT30!");
        return false;
    }
    
    // Initialize relay and vehicle sensor
    chargeRelay.begin();
    vehicleSensor.begin();
    
    // Set up vehicle detection callback
    vehicleSensor.setOnStateChangeCallback(onVehicleDetection);
    
    // Set default temperature thresholds
    tempSensor.setWarningTemperature(45.0);
    tempSensor.setCriticalTemperature(50.0);
    
    // Initialize system status
    currentStatus = {
        false,  // chargingEnabled
        false,  // vehicleDetected
        false,  // autoChargingEnabled
        0.0f,   // voltage
        0.0f,   // current
        0.0f,   // power
        0.0f,   // totalEnergyWh
        0.0f,   // temperature
        0.0f,   // humidity
        false,  // tempWarning
        false   // tempCritical
    };
    
    isInitialized = true;
    return true;
}

void SystemManager::update() {
    if (!isInitialized) return;
    
    updateSensors();
    checkSafety();
    vehicleSensor.update();
    
    if (isPaired && screen) {
        static float progress = 0.0;
        static float totalEnergyWh = 0.0;
        static unsigned long lastUpdate = 0;
        
        if (millis() - lastUpdate > 1000) {
            progress = min(100.0f, progress + 0.3f);
            
            // Anlık güç değeri (Watt)
            float currentWatt = currentStatus.power;
            
            // Toplam enerjiyi Watt-saat cinsinden hesapla
            // (Watt * saat)
            // 1 saat = 3600 saniye
            // Her saniye için: Watt * (1/3600)
            totalEnergyWh += (currentWatt * (1.0/3600.0) * 1000);  // Wh olarak enerji biriktir
            
            // Token miktarını Wh üzerinden hesapla
            float tokenAmount = totalEnergyWh * 0.01;  // Her Wh başına 0.01 token
            
            Serial.println("Display Values:");
            Serial.print("Progress: "); Serial.println(progress);
            Serial.print("Current Watt: "); Serial.println(currentWatt);
            Serial.print("Total Wh: "); Serial.println(totalEnergyWh, 1);
            Serial.print("Token Amount: "); Serial.println(tokenAmount, 2);
            
            screen->showChargingDetails(
                progress,
                currentWatt,
                totalEnergyWh,    // Watt-saat cinsinden enerji
                tokenAmount,      // Token miktarı
                "0x1234...5678"
            );
            
            currentStatus.totalEnergyWh = totalEnergyWh;
            
            lastUpdate = millis();
        }
    }
    
    // Araç varlığını sürekli kontrol et
    if(isPaired && !currentStatus.vehicleDetected) {
        handleVehicleDetection(false); // Araç ayrıldıysa işle
    }
}

void SystemManager::updateSensors() {
    // Güç sensörü okuma
    if (powerSensor.readValues()) {
        currentStatus.voltage = powerSensor.getVoltage();
        currentStatus.current = powerSensor.getCurrent();
        currentStatus.power = powerSensor.getPower();
        
        // Debug için seri porta yazdır
        Serial.println("Power Sensor Readings:");
        Serial.print("Voltage: "); Serial.print(currentStatus.voltage); Serial.println("V");
        Serial.print("Current: "); Serial.print(currentStatus.current); Serial.println("A");
        Serial.print("Power: "); Serial.print(currentStatus.power); Serial.println("W");
    } else {
        Serial.println("Failed to read power sensor!");
    }
    
    // Sıcaklık sensörü okuma
    if (tempSensor.readValues()) {
        currentStatus.temperature = tempSensor.getTemperature();
        currentStatus.humidity = tempSensor.getHumidity();
        currentStatus.tempWarning = tempSensor.isTemperatureWarning();
        currentStatus.tempCritical = tempSensor.isTemperatureCritical();
    }
    
    // Update system state
    currentStatus.chargingEnabled = chargeRelay.isCharging();
    currentStatus.vehicleDetected = vehicleSensor.isVehiclePresent();
    currentStatus.autoChargingEnabled = chargeRelay.isAutoChargingEnabled();
}

void SystemManager::checkSafety() {
    // Set safety lock if temperature is critical
    chargeRelay.setSafetyLock(currentStatus.tempCritical);
}

bool SystemManager::setChargingState(bool state) {
    if (!isInitialized) return false;
    return chargeRelay.setState(state);
}

void SystemManager::setAutoCharging(bool state) {
    if (!isInitialized) return;
    chargeRelay.setAutoCharging(state);
    currentStatus.autoChargingEnabled = state;
}

SystemStatus SystemManager::getSystemStatus() const {
    return currentStatus;
}

TemperatureStatus SystemManager::getTemperatureStatus() const {
    return {
        currentStatus.temperature,
        currentStatus.humidity,
        currentStatus.tempWarning,
        currentStatus.tempCritical
    };
}

void SystemManager::onVehicleDetection(bool detected) {
    if (instance) {
        instance->handleVehicleDetection(detected);
    }
}

void SystemManager::handleVehicleDetection(bool detected) {
    currentStatus.vehicleDetected = detected;
    
    // Araç ayrıldığında şarjı durdur ve sıfırla
    if (!detected && isPaired) {
        Serial.println("Araç ayrıldı! Şarj durduruluyor...");
        
        // Şarjı durdur
        chargeRelay.disable();
        isPaired = false;
        
        // Ekranı QR kod ekranına döndür
        if(screen) {
            screen->clearScreen();
            screen->showCustomQR("GARAJ NISANTASI", "GarajNisantasi0000000"); 
        }
        
        // Sistem durumunu sıfırla
        currentStatus.chargingEnabled = false;
        currentStatus.autoChargingEnabled = false;
    }
}

void SystemManager::handlePairing() {
    isPaired = true;
    
    if (screen) {
        screen->showConnectionPending();
        screen->showConnectionPendingLoadingBar();
        screen->showChargingStarting();
        
        // Şarjı başlat
        chargeRelay.enable();  // Şarj rölesini aktif et
        
        // Başlangıç değerleriyle şarj ekranını göster
        screen->showChargingDetails(
            0.0,    // progress
            0,      // watt
            0.0,    // totalKWh
            0.0,    // energyToken
            "0x1234...5678"  // tokenAddress
        );
    }
}