#ifndef SHT30_MANAGER_H
#define SHT30_MANAGER_H

#include <Wire.h>
#include <WEMOS_SHT3X.h>

class SHT30Manager {
private:
    SHT3X sht30;
    bool isInitialized;
    
    // Measurement values
    float temperature;
    float humidity;
    
    // Temperature thresholds
    float warningTemp;
    float criticalTemp;
    
    // Status flags
    bool tempWarningFlag;
    bool tempCriticalFlag;

public:
    SHT30Manager(uint8_t address = 0x44);
    
    // Initialization
    bool begin();
    bool isReady() const { return isInitialized; }
    
    // Read methods
    bool readValues();
    float getTemperature() const { return temperature; }
    float getHumidity() const { return humidity; }
    
    // Temperature threshold methods
    void setWarningTemperature(float temp) { warningTemp = temp; }
    void setCriticalTemperature(float temp) { criticalTemp = temp; }
    float getWarningTemperature() const { return warningTemp; }
    float getCriticalTemperature() const { return criticalTemp; }
    
    // Status methods
    bool isTemperatureWarning() const { return tempWarningFlag; }
    bool isTemperatureCritical() const { return tempCriticalFlag; }
    
    // Update status
    void updateStatus();
};

#endif // SHT30_MANAGER_H