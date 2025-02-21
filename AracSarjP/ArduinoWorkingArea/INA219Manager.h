#ifndef INA219_MANAGER_H
#define INA219_MANAGER_H

#include <Wire.h>
#include <Adafruit_INA219.h>

class INA219Manager {
private:
    Adafruit_INA219 ina219;
    bool isInitialized;

    // Measurement values
    float busVoltage;
    float current;
    float power;

public:
    INA219Manager();
    
    // Initialization
    bool begin();
    bool isReady() const { return isInitialized; }
    
    // Read methods
    bool readValues();
    float getVoltage() const { return busVoltage; }
    float getCurrent() const { return current; }
    float getPower() const { return power; }
    
    // Calibration method
    void setCalibration32V2A();
};

#endif // INA219_MANAGER_H