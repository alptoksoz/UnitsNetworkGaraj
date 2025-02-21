#include "SHT30Manager.h"

SHT30Manager::SHT30Manager(uint8_t address) : 
    sht30(address),
    isInitialized(false),
    temperature(0),
    humidity(0),
    warningTemp(45.0),    // Default warning temperature
    criticalTemp(50.0),   // Default critical temperature
    tempWarningFlag(false),
    tempCriticalFlag(false)
{
}

bool SHT30Manager::begin() {
    isInitialized = true;  // SHT30 doesn't have a begin method
    return true;
}

bool SHT30Manager::readValues() {
    if (!isInitialized) {
        return false;
    }

    if (sht30.get() == 0) {  // 0 means successful reading
        temperature = sht30.cTemp;
        humidity = sht30.humidity;
        updateStatus();
        return true;
    }
    
    return false;
}

void SHT30Manager::updateStatus() {
    // Update warning and critical flags based on current temperature
    tempWarningFlag = (temperature >= warningTemp);
    tempCriticalFlag = (temperature >= criticalTemp);
}