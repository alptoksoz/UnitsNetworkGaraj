#include "WebServerManager.h"

WebServerManager* WebServerManager::instance = nullptr;

WebServerManager::WebServerManager(SystemManager* sysMgr) : 
    server(80),
    webSocket(81),
    systemManager(sysMgr)
{
    instance = this;
}

void WebServerManager::begin() {
    // Setup HTTP routes
    server.on("/state", HTTP_GET, [this]() { handleStatus(); });
    server.on("/charging", HTTP_GET, [this]() { handleCharging(); });
    server.on("/autocharging", HTTP_GET, [this]() { handleAutoCharging(); });
    server.on("/temperature", HTTP_GET, [this]() { handleTemperature(); });
    server.onNotFound([this]() { handleNotFound(); });
    
    // Start server and WebSocket
    server.begin();
    webSocket.begin();
    webSocket.onEvent(webSocketEventCallback);
}

void WebServerManager::update() {
    server.handleClient();
    webSocket.loop();
}

void WebServerManager::handleNotFound() {
    jsonBuffer.clear();
    jsonBuffer["error"] = "Not found";
    serializeJson(jsonBuffer, buffer);
    server.send(404, "application/json", buffer);
}

void WebServerManager::handleStatus() {
    jsonBuffer.clear();
    
    // Get system status
    auto status = systemManager->getSystemStatus();
    
    // Fill JSON with system status
    jsonBuffer["charging_enabled"] = status.chargingEnabled;
    jsonBuffer["vehicle_detected"] = status.vehicleDetected;
    jsonBuffer["auto_charging"] = status.autoChargingEnabled;
    jsonBuffer["voltage"] = status.voltage;
    jsonBuffer["current"] = status.current;
    jsonBuffer["power"] = status.power;
    jsonBuffer["temperature"] = status.temperature;
    jsonBuffer["humidity"] = status.humidity;
    jsonBuffer["temp_warning"] = status.tempWarning;
    jsonBuffer["temp_critical"] = status.tempCritical;
    
    serializeJson(jsonBuffer, buffer);
    server.send(200, "application/json", buffer);
}

void WebServerManager::handleCharging() {
    if (server.hasArg("state")) {
        String state = server.arg("state");
        bool success = systemManager->setChargingState(state == "on");
        
        jsonBuffer.clear();
        if (success) {
            jsonBuffer["status"] = state == "on" ? "Charging enabled" : "Charging disabled";
        } else {
            jsonBuffer["error"] = "Could not change charging state";
        }
    } else {
        jsonBuffer.clear();
        jsonBuffer["error"] = "Missing state parameter";
    }
    
    serializeJson(jsonBuffer, buffer);
    server.send(200, "application/json", buffer);
}

void WebServerManager::handleAutoCharging() {
    if (server.hasArg("state")) {
        String state = server.arg("state");
        systemManager->setAutoCharging(state == "on");
        
        jsonBuffer.clear();
        jsonBuffer["auto_charging"] = (state == "on");
        jsonBuffer["status"] = state == "on" ? "Auto charging enabled" : "Auto charging disabled";
    } else {
        jsonBuffer.clear();
        jsonBuffer["error"] = "Missing state parameter";
    }
    
    serializeJson(jsonBuffer, buffer);
    server.send(200, "application/json", buffer);
}

void WebServerManager::handleTemperature() {
    jsonBuffer.clear();
    
    auto tempStatus = systemManager->getTemperatureStatus();
    jsonBuffer["temperature"] = tempStatus.temperature;
    jsonBuffer["humidity"] = tempStatus.humidity;
    jsonBuffer["temp_warning"] = tempStatus.warning;
    jsonBuffer["temp_critical"] = tempStatus.critical;
    
    serializeJson(jsonBuffer, buffer);
    server.send(200, "application/json", buffer);
}

void WebServerManager::broadcastState() {
    auto status = systemManager->getSystemStatus();
    
    jsonBuffer.clear();
    jsonBuffer["type"] = "system_update";
    jsonBuffer["charging_enabled"] = status.chargingEnabled;
    jsonBuffer["vehicle_detected"] = status.vehicleDetected;
    jsonBuffer["auto_charging"] = status.autoChargingEnabled;
    jsonBuffer["voltage"] = status.voltage;
    jsonBuffer["current"] = status.current;
    jsonBuffer["power"] = status.power;
    jsonBuffer["temperature"] = status.temperature;
    jsonBuffer["humidity"] = status.humidity;
    jsonBuffer["temp_warning"] = status.tempWarning;
    jsonBuffer["temp_critical"] = status.tempCritical;
    
    serializeJson(jsonBuffer, buffer);
    webSocket.broadcastTXT(buffer);
}

void WebServerManager::webSocketEventCallback(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    if (instance) {
        instance->handleWebSocketEvent(num, type, payload, length);
    }
}

void WebServerManager::handleWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
            
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
                
                // Send initial state
                auto status = systemManager->getSystemStatus();
                jsonBuffer.clear();
                jsonBuffer["type"] = "initial_state";
                jsonBuffer["vehicle_detected"] = status.vehicleDetected;
                jsonBuffer["charging_enabled"] = status.chargingEnabled;
                jsonBuffer["auto_charging"] = status.autoChargingEnabled;
                
                serializeJson(jsonBuffer, buffer);
                webSocket.sendTXT(num, buffer);
            }
            break;
            
        case WStype_TEXT:
            {
                DynamicJsonDocument doc(200);
                DeserializationError error = deserializeJson(doc, payload);
                
                if (error) {
                    Serial.println("JSON parsing failed");
                    return;
                }
                
                const char* command = doc["command"];
                if (command) {
                    if (strcmp(command, "getState") == 0) {
                        auto status = systemManager->getSystemStatus();
                        
                        jsonBuffer.clear();
                        jsonBuffer["type"] = "system_state";
                        jsonBuffer["charging_enabled"] = status.chargingEnabled;
                        jsonBuffer["vehicle_detected"] = status.vehicleDetected;
                        jsonBuffer["auto_charging"] = status.autoChargingEnabled;
                        jsonBuffer["voltage"] = status.voltage;
                        jsonBuffer["current"] = status.current;
                        jsonBuffer["power"] = status.power;
                        jsonBuffer["temperature"] = status.temperature;
                        jsonBuffer["humidity"] = status.humidity;
                        
                        serializeJson(jsonBuffer, buffer);
                        webSocket.sendTXT(num, buffer);
                    }
                    else if (strcmp(command, "setCharging") == 0) {
                        bool state = doc["state"] | false;
                        systemManager->setChargingState(state);
                        
                        jsonBuffer.clear();
                        jsonBuffer["type"] = "charging_state";
                        jsonBuffer["charging_enabled"] = systemManager->getSystemStatus().chargingEnabled;
                        
                        serializeJson(jsonBuffer, buffer);
                        webSocket.sendTXT(num, buffer);
                    }
                    else if (strcmp(command, "setAutoCharging") == 0) {
                        bool state = doc["state"] | false;
                        systemManager->setAutoCharging(state);
                        
                        jsonBuffer.clear();
                        jsonBuffer["type"] = "auto_charging_state";
                        jsonBuffer["auto_charging"] = systemManager->getSystemStatus().autoChargingEnabled;
                        
                        serializeJson(jsonBuffer, buffer);
                        webSocket.sendTXT(num, buffer);
                    }
                }
            }
            break;
    }
}