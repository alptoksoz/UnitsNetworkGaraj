#include "SystemManager.h"

SystemManager* SystemManager::instance = nullptr;

SystemManager::SystemManager(uint8_t relayPin, uint8_t vehicleSensorPin) :
    chargeRelay(relayPin),
    vehicleSensor(vehicleSensorPin),
    isInitialized(false)
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
    
    // Update all sensors
    updateSensors();
    
    // Check safety conditions
    checkSafety();
    
    // Update vehicle sensor
    vehicleSensor.update();
    
    // Handle auto-charging if enabled
    if (currentStatus.autoChargingEnabled) {
        chargeRelay.handleAutoCharging(currentStatus.vehicleDetected);
    }
}

void SystemManager::updateSensors() {
    // Update power measurements
    if (powerSensor.readValues()) {
        currentStatus.voltage = powerSensor.getVoltage();
        currentStatus.current = powerSensor.getCurrent();
        currentStatus.power = powerSensor.getPower();
    }
    
    // Update temperature measurements
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
    if (currentStatus.autoChargingEnabled) {
        setChargingState(detected);
    }
}