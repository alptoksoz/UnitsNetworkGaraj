#ifndef WEB_SERVER_MANAGER_H
#define WEB_SERVER_MANAGER_H

#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include "SystemManager.h"

class WebServerManager {
private:
    ESP8266WebServer server;
    WebSocketsServer webSocket;
    SystemManager* systemManager;
    
    // JSON handling
    StaticJsonDocument<512> jsonBuffer;
    char buffer[512];
    
    // Internal methods for handling requests
    void handleNotFound();
    void handleStatus();
    void handleCharging();
    void handleAutoCharging();
    void handleTemperature();
    
    // WebSocket event handler
    void handleWebSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length);
    
    // Callback wrapper for WebSocket events
    static void webSocketEventCallback(uint8_t num, WStype_t type, uint8_t* payload, size_t length);
    
    // Static instance pointer for callback
    static WebServerManager* instance;

public:
    WebServerManager(SystemManager* sysMgr);
    
    // Initialization
    void begin();
    
    // Server management
    void update();
    
    // WebSocket broadcast
    void broadcastState();
};

#endif // WEB_SERVER_MANAGER_H