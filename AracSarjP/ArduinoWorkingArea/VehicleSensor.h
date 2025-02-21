#ifndef VEHICLE_SENSOR_H
#define VEHICLE_SENSOR_H

#include <Arduino.h>

class VehicleSensor {
private:
    uint8_t sensorPin;
    bool vehiclePresent;
    bool lastState;
    unsigned long debounceDelay;
    unsigned long lastDebounceTime;

    // Callback function type for state change events
    typedef void (*StateChangeCallback)(bool);
    StateChangeCallback onStateChange;

public:
    VehicleSensor(uint8_t pin);
    
    // Initialization
    void begin();
    
    // Main methods
    void update();
    bool isVehiclePresent() const { return vehiclePresent; }
    bool hasStateChanged() const { return vehiclePresent != lastState; }
    
    // Settings
    void setDebounceDelay(unsigned long delay) { debounceDelay = delay; }
    
    // Event handling
    void setOnStateChangeCallback(StateChangeCallback callback) { onStateChange = callback; }
};

#endif // VEHICLE_SENSOR_H