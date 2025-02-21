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
    pinMode(sensorPin, INPUT_PULLUP); // Dahili pull-up direnci aktif
    vehiclePresent = (digitalRead(sensorPin) == LOW);
    lastState = vehiclePresent;
}

void VehicleSensor::update() {
    bool currentReading = (digitalRead(sensorPin) == LOW); // LOW = araç var
    
    // Son 5 okumanın ortalamasini al
    static bool lastReadings[5] = {currentReading};
    static uint8_t index = 0;
    lastReadings[index] = currentReading;
    index = (index + 1) % 5;
    
    // Tutarli okuma kontrolu (5 okumanın en az 4'u ayni olmali)
    uint8_t sameCount = 0;
    for(bool val : lastReadings) {
        if(val == currentReading) sameCount++;
    }
    
    if(sameCount >= 4) { // Tutarli bir durum degisikligi
        if(currentReading != vehiclePresent) {
            vehiclePresent = currentReading;
            
            // 200ms ek gecikme
            unsigned long start = millis();
            while(millis() - start < 200) {
                // Sensoru tekrar oku
                bool confirmReading = (digitalRead(sensorPin) == LOW);
                if(confirmReading != currentReading) break;
            }
            
            if((digitalRead(sensorPin) == LOW) == currentReading) {
                // Gercek degisiklik onaylandi
                if(onStateChange != nullptr) {
                    onStateChange(vehiclePresent);
                }
            }
        }
    }
    
    lastState = currentReading;
}