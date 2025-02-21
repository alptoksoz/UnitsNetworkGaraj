#include "RelayManager.h"

RelayManager::RelayManager(uint8_t pin) :
    relayPin(pin),
    isEnabled(false),
    autoChargingEnabled(false),
    safetyLockEnabled(false)
{
}

void RelayManager::begin() {
    pinMode(relayPin, OUTPUT);
    disable();  // Start with charging disabled
}

void RelayManager::enable() {
    if (!safetyLockEnabled) {
        digitalWrite(relayPin, LOW);  // Active LOW relay
        isEnabled = true;
    }
}

void RelayManager::disable() {
    digitalWrite(relayPin, HIGH);  // Inactive HIGH
    isEnabled = false;
}

void RelayManager::setAutoCharging(bool state) {
    autoChargingEnabled = state;
}

void RelayManager::setSafetyLock(bool state) {
    safetyLockEnabled = state;
    if (safetyLockEnabled) {
        disable();  // Force disable when safety lock is enabled
    }
}

bool RelayManager::setState(bool state) {
    if (state && safetyLockEnabled) {
        return false;  // Can't enable if safety locked
    }
    
    if (state) {
        enable();
    } else {
        disable();
    }
    
    return true;
}

void RelayManager::handleAutoCharging(bool vehiclePresent) {
    if (autoChargingEnabled && !safetyLockEnabled) {
        setState(vehiclePresent);
    }
}