#include "VehicleSensor.h"

VehicleSensor::VehicleSensor(uint8_t pin) :
    sensorPin(pin),
    vehiclePresent(false),
    lastState(false),
    debounceDelay(50),  // 50ms default debounce
    lastDebounceTime(0),
    onStateChange(nullptr)
{
}

void VehicleSensor::begin() {
    pinMode(sensorPin, INPUT);
    vehiclePresent = (digitalRead(sensorPin) == LOW); // LOW = detected
    lastState = vehiclePresent;
}

void VehicleSensor::update() {
    bool currentReading = (digitalRead(sensorPin) == LOW);
    
    // Check if state has changed
    if (currentReading != lastState) {
        lastDebounceTime = millis();
    }
    
    // Check if enough time has passed since last change
    if ((millis() - lastDebounceTime) > debounceDelay) {
        // If the state has changed and is stable
        if (currentReading != vehiclePresent) {
            vehiclePresent = currentReading;
            
            // Call the callback if it exists
            if (onStateChange != nullptr) {
                onStateChange(vehiclePresent);
            }
        }
    }
    
    lastState = currentReading;
}