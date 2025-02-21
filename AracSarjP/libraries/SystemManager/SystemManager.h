#ifndef SYSTEM_MANAGER_H
#define SYSTEM_MANAGER_H

#include "INA219Manager.h"
#include "SHT30Manager.h"
#include "RelayManager.h"
#include "VehicleSensor.h"

// Structure to hold system status
struct SystemStatus {
    bool chargingEnabled;
    bool vehicleDetected;
    bool autoChargingEnabled;
    float voltage;
    float current;
    float power;
    float temperature;
    float humidity;
    bool tempWarning;
    bool tempCritical;
};

// Structure for temperature status
struct TemperatureStatus {
    float temperature;
    float humidity;
    bool warning;
    bool critical;
};

class SystemManager {
private:
    INA219Manager powerSensor;
    SHT30Manager tempSensor;
    RelayManager chargeRelay;
    VehicleSensor vehicleSensor;
    
    // System state
    bool isInitialized;
    SystemStatus currentStatus;
    
    // Internal methods
    void updateSensors();
    void checkSafety();
    
    // Static callback for vehicle detection
    static void onVehicleDetection(bool detected);
    static SystemManager* instance;

public:
    SystemManager(uint8_t relayPin, uint8_t vehicleSensorPin);
    
    // Initialization
    bool begin();
    bool isReady() const { return isInitialized; }
    
    // Main update loop
    void update();
    
    // System control
    bool setChargingState(bool state);
    void setAutoCharging(bool state);
    
    // Status getters
    SystemStatus getSystemStatus() const;
    TemperatureStatus getTemperatureStatus() const;
    
    // Event handlers
    void handleVehicleDetection(bool detected);
};

#endif // SYSTEM_MANAGER_H