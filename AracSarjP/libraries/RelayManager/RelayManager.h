#ifndef RELAY_MANAGER_H
#define RELAY_MANAGER_H

#include <Arduino.h>

class RelayManager {
private:
    uint8_t relayPin;
    bool isEnabled;
    bool autoChargingEnabled;
    bool safetyLockEnabled;  // For temperature or other safety conditions

public:
    RelayManager(uint8_t pin);
    
    // Initialization
    void begin();
    
    // Basic control methods
    void enable();
    void disable();
    bool isCharging() const { return isEnabled; }
    
    // Auto charging control
    void setAutoCharging(bool state);
    bool isAutoChargingEnabled() const { return autoChargingEnabled; }
    
    // Safety methods
    void setSafetyLock(bool state);
    bool isSafetyLocked() const { return safetyLockEnabled; }
    
    // State control with safety check
    bool setState(bool state);
    
    // Auto charging logic
    void handleAutoCharging(bool vehiclePresent);
};

#endif // RELAY_MANAGER_H