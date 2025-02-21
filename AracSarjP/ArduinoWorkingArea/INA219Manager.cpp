#include "INA219Manager.h"

INA219Manager::INA219Manager() : 
    isInitialized(false),
    busVoltage(0),
    current(0),
    power(0)
{
}

bool INA219Manager::begin() {
    if (!ina219.begin()) {
        return false;
    }
    
    isInitialized = true;
    setCalibration32V2A();
    return true;
}

void INA219Manager::setCalibration32V2A() {
    if (isInitialized) {
        ina219.setCalibration_32V_2A();
    }
}

bool INA219Manager::readValues() {
    if (!isInitialized) {
        return false;
    }

    // Read values
    busVoltage = ina219.getBusVoltage_V();
    float currentmA = ina219.getCurrent_mA();
    
    // Convert current to Amperes and make it positive
    current = abs(currentmA) / 1000.0;
    
    // Calculate power
    power = busVoltage * current;
    
    return true;
}