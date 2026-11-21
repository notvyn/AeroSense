/*
 * AeroSense - Autonomous Multi-Gas Leak Detection & Life-Safety Hub
 * Target Microcontroller: ESP32-WROOM-32 / ESP32 Dev Module (240MHz, Dual Core)
 * Author: Research and Development Team
 * Academic Year: 2024-2025 / 2026
 *
 * Description:
 * Autonomous ceiling-mounted gas detection firmware interfacing MQ-2, MQ-8,
 * and MQ-7 sensors. Dispatches telemetry and emergency broadcasts via local
 * HTTP server (/telemetry), LAN UDP Multicast, and Direct BLE beacons.
 *
 * Safety & Architecture Compliance:
 * - Analog acquisition is strictly assigned to ADC1 (GPIOs 32, 34, 35) to prevent
 *   conflicts with the active Wi-Fi radio (ADC2 is disabled during Wi-Fi operations).
 * - Direct 5V USB power telemetry ("USB / MAINS", 100% battery).
 * - Built-in Power-On Self Test (POST) for visual verification of LEDs and buzzer.
 * - Interactive Serial Monitor command parser with echo and periodic live status.
 */

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiUdp.h>
#include <WebServer.h>

/* Safe BLE Inclusion - Auto-detects if Espressif BLEDevice.h is present */
#if defined(__has_include) && __has_include(<BLEDevice.h>)
  #include <BLEDevice.h>
  #include <BLEUtils.h>
  #include <BLEServer.h>
  #include <BLEAdvertising.h>
  #define HAS_BLE_DEVICE 1
#else
  #define HAS_BLE_DEVICE 0
#endif

/* Hardware Pin Definitions (Configured for your exact physical wiring) */
const int PIN_MQ2_ADC     = 34; // MQ-2: Combustible / Methane / LPG (ADC1_CH6)
const int PIN_MQ8_ADC     = 32; // MQ-8: Hydrogen H2 (ADC1_CH4)
const int PIN_MQ7_ADC     = 35; // MQ-7: Carbon Monoxide CO (ADC1_CH7)

const int PIN_LED_RED     = 25; // Red Alert / Alarm LED (Active HIGH)
const int PIN_LED_GREEN   = 27; // Green Safe / Normal LED (Active HIGH)
const int PIN_BUZZER      = 27; // Active Buzzer (change to 26 if Buzzer has its own pin separate from Green LED)
const int PIN_ONBOARD_LED = 2;  // Built-in blue LED on ESP32 Dev Module (diagnostic fallback)

/* Safety Thresholds (Parts Per Million) */
const float THRESHOLD_FLAMMABLE_WARN = 200.0;
const float THRESHOLD_FLAMMABLE_CRIT = 400.0;
const float THRESHOLD_H2_WARN        = 400.0;
const float THRESHOLD_H2_CRIT        = 800.0;
const float THRESHOLD_CO_WARN        = 25.0;
const float THRESHOLD_CO_CRIT        = 50.0;

/* Network & WebServer Configuration */
WiFiMulti wifiMulti;
WiFiUDP udp;
WebServer server(80);
const char* UDP_BROADCAST_IP = "255.255.255.255";
const uint16_t UDP_PORT = 8888;

/* Device Identity */
const char* DEVICE_ID = "AEROSENSE-HUB-01";
const char* ZONE_NAME = "Zone 1 - Main Enclosure";

/* BLE Beacon Service UUID */
#define SERVICE_UUID "0000AE01-0000-1000-8000-00805F9B34FB"
#if HAS_BLE_DEVICE
BLEAdvertising* pAdvertising = nullptr;
#endif

/* System State Variables */
enum AlertLevel {
  ALERT_NORMAL = 0,
  ALERT_WARNING = 1,
  ALERT_CRITICAL = 2
};

AlertLevel currentAlertLevel = ALERT_NORMAL;
const char* primaryDetectedGas = "NORMAL";

/* Telemetry & Calibration Variables (USB Powered) */
float ppmFlammable = 0.0;
float ppmHydrogen = 0.0;
float ppmCarbonMonoxide = 0.0;
float batteryVoltage = 5.00;
int batteryPercentage = 100;
const char* powerSource = "USB / MAINS";

/* Timing & Simulation Flags */
unsigned long lastTelemetryBroadcast = 0;
unsigned long lastSerialTelemetry = 0;
unsigned long lastBuzzerToggle = 0;
bool buzzerState = false;
bool simulationMode = false;
unsigned long simulationStartTime = 0;
unsigned long warmupStartTime = 0;
const unsigned long WARMUP_DURATION_MS = 10000; // 10s sensor warmup stabilization

void handleTelemetryEndpoint() {
  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"zone\":\"" + String(ZONE_NAME) + "\",";
  payload += "\"uptime_s\":" + String(millis() / 1000) + ",";
  payload += "\"simulation\":" + String(simulationMode ? "true" : "false") + ",";
  payload += "\"power\":{\"source\":\"" + String(powerSource) + "\",\"pct\":" + String(batteryPercentage) + ",\"v\":" + String(batteryVoltage, 2) + "},";
  payload += "\"sensors\":{";
  payload += "\"flammable_ppm\":" + String(ppmFlammable, 1) + ",";
  payload += "\"h2_ppm\":" + String(ppmHydrogen, 1) + ",";
  payload += "\"co_ppm\":" + String(ppmCarbonMonoxide, 1) + ",";
  payload += "\"mq7_phase\":\"CONTINUOUS_5V\"";
  payload += "},";
  payload += "\"alert\":{";
  payload += "\"level\":" + String((int)currentAlertLevel) + ",";
  payload += "\"gas\":\"" + String(primaryDetectedGas) + "\"";
  payload += "}";
  payload += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", payload);
}

void initHardware() {
  pinMode(PIN_MQ2_ADC, INPUT);
  pinMode(PIN_MQ8_ADC, INPUT);
  pinMode(PIN_MQ7_ADC, INPUT);

  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_ONBOARD_LED, OUTPUT);
  if (PIN_BUZZER != PIN_LED_GREEN) {
    pinMode(PIN_BUZZER, OUTPUT);
    digitalWrite(PIN_BUZZER, LOW);
  }

  // Set 12-bit ADC resolution (0 - 4095) for ESP32
  analogReadResolution(12);

  // Power-On Self Test (POST): Visually flash LEDs so you can verify physical wiring immediately
  Serial.println("[POST] Testing Green LED on GPIO 27 (should light up for 1 second)...");
  digitalWrite(PIN_LED_GREEN, HIGH);
  delay(1000);
  digitalWrite(PIN_LED_GREEN, LOW);

  Serial.println("[POST] Testing Red LED on GPIO 25 & Onboard LED on GPIO 2 (should light up for 1 second)...");
  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_ONBOARD_LED, HIGH);
  delay(1000);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_ONBOARD_LED, LOW);

  // Default Initial State: Safe / Normal (Green ON, Red OFF)
  digitalWrite(PIN_LED_GREEN, HIGH);
  Serial.println("[POST] Self-test complete. Green LED is now set to HIGH (Normal).");
}

void initWireless() {
  wifiMulti.addAP("AeroSenseHotspot", "aerosense123");
  wifiMulti.addAP("HUAWEI-3DcC", "jGqZv2Hh");
  wifiMulti.addAP("Campus_WiFi", "campus_access");

  Serial.println("[AEROSENSE] Connecting to Wi-Fi...");
  unsigned long startAttempt = millis();
  while (wifiMulti.run() != WL_CONNECTED && (millis() - startAttempt < 6000)) {
    delay(200);
    digitalWrite(PIN_LED_GREEN, !digitalRead(PIN_LED_GREEN));
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_LED_GREEN, HIGH);
    Serial.print("[AEROSENSE] Wi-Fi connected! Device IP: ");
    Serial.println(WiFi.localIP());
    udp.begin(UDP_PORT);

    server.on("/telemetry", handleTelemetryEndpoint);
    server.begin();
    Serial.println("[AEROSENSE] HTTP telemetry endpoint ready at http://" + WiFi.localIP().toString() + "/telemetry");
  } else {
    digitalWrite(PIN_LED_GREEN, HIGH);
    Serial.println("[AEROSENSE] Wi-Fi not connected. Operating in standalone offline mode.");
  }

#if HAS_BLE_DEVICE
  BLEDevice::init("AeroSense-Hub");
  BLEServer* pServer = BLEDevice::createServer();
  pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("[AEROSENSE] BLE Emergency Beacon active.");
#else
  Serial.println("[AEROSENSE] BLE beacon bypassed on this core.");
#endif
}

void readBatteryTelemetry() {
  batteryVoltage = 5.00;
  batteryPercentage = 100;
  powerSource = "USB / MAINS";
}

void readSensors() {
  if (simulationMode) {
    unsigned long elapsed = millis() - simulationStartTime;
    if (elapsed < 15000) {
      ppmFlammable = 120.0 + (elapsed / 15000.0) * 360.0;
      ppmHydrogen  = 45.0 + (elapsed / 15000.0) * 120.0;
      ppmCarbonMonoxide = 12.0;
    } else if (elapsed < 30000) {
      ppmFlammable = 485.0 + (random(-15, 15));
      ppmHydrogen  = 180.0 + (random(-10, 10));
      ppmCarbonMonoxide = 28.0;
    } else {
      simulationMode = false;
      Serial.println("[AEROSENSE] Simulation routine finished. Returning to live sensors.");
    }
    return;
  }

  // 10-sample rolling average on ADC1 channels (clean noise filtering)
  long sumMQ2 = 0, sumMQ8 = 0, sumMQ7 = 0;
  for (int i = 0; i < 10; i++) {
    sumMQ2 += analogRead(PIN_MQ2_ADC);
    sumMQ8 += analogRead(PIN_MQ8_ADC);
    sumMQ7 += analogRead(PIN_MQ7_ADC);
    delay(2);
  }

  int rawMQ2 = sumMQ2 / 10;
  int rawMQ8 = sumMQ8 / 10;
  int rawMQ7 = sumMQ7 / 10;

  // Convert raw 12-bit ADC (0 - 4095) to voltage (0.0 - 3.3V)
  float vMQ2 = (rawMQ2 / 4095.0) * 3.3;
  float vMQ8 = (rawMQ8 / 4095.0) * 3.3;
  float vMQ7 = (rawMQ7 / 4095.0) * 3.3;

  // Calculate approximate PPM
  ppmFlammable      = max(0.0f, (vMQ2 - 0.2f) * 180.0f);
  ppmHydrogen       = max(0.0f, (vMQ8 - 0.2f) * 220.0f);
  ppmCarbonMonoxide = max(0.0f, (vMQ7 - 0.2f) * 45.0f);
}

void evaluateRiskState() {
  if (millis() - warmupStartTime < WARMUP_DURATION_MS) {
    currentAlertLevel = ALERT_NORMAL;
    primaryDetectedGas = "WARMING_UP";
    return;
  }

  bool isCrit = false;
  bool isWarn = false;

  if (ppmFlammable >= THRESHOLD_FLAMMABLE_CRIT) {
    isCrit = true;
    primaryDetectedGas = "FLAMMABLE_GAS";
  } else if (ppmHydrogen >= THRESHOLD_H2_CRIT) {
    isCrit = true;
    primaryDetectedGas = "HYDROGEN";
  } else if (ppmCarbonMonoxide >= THRESHOLD_CO_CRIT) {
    isCrit = true;
    primaryDetectedGas = "CARBON_MONOXIDE";
  } else if (ppmFlammable >= THRESHOLD_FLAMMABLE_WARN) {
    isWarn = true;
    primaryDetectedGas = "FLAMMABLE_GAS";
  } else if (ppmHydrogen >= THRESHOLD_H2_WARN) {
    isWarn = true;
    primaryDetectedGas = "HYDROGEN";
  } else if (ppmCarbonMonoxide >= THRESHOLD_CO_WARN) {
    isWarn = true;
    primaryDetectedGas = "CARBON_MONOXIDE";
  }

  if (isCrit) {
    currentAlertLevel = ALERT_CRITICAL;
  } else if (isWarn) {
    currentAlertLevel = ALERT_WARNING;
  } else {
    currentAlertLevel = ALERT_NORMAL;
    primaryDetectedGas = "NORMAL";
  }
}

void processLocalActuators() {
  unsigned long now = millis();

  if (currentAlertLevel == ALERT_CRITICAL) {
    // Green OFF during hazard
    digitalWrite(PIN_LED_GREEN, LOW);

    // Fast rapid alarm (150ms toggle)
    if (now - lastBuzzerToggle >= 150) {
      lastBuzzerToggle = now;
      buzzerState = !buzzerState;
      digitalWrite(PIN_LED_RED, buzzerState ? HIGH : LOW);
      digitalWrite(PIN_ONBOARD_LED, buzzerState ? HIGH : LOW);
      if (PIN_BUZZER != PIN_LED_GREEN) {
        digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
      }
    }
  } else if (currentAlertLevel == ALERT_WARNING) {
    // Green OFF during warning
    digitalWrite(PIN_LED_GREEN, LOW);

    // Moderate warning beep (700ms toggle)
    if (now - lastBuzzerToggle >= 700) {
      lastBuzzerToggle = now;
      buzzerState = !buzzerState;
      digitalWrite(PIN_LED_RED, buzzerState ? HIGH : LOW);
      digitalWrite(PIN_ONBOARD_LED, buzzerState ? HIGH : LOW);
      if (PIN_BUZZER != PIN_LED_GREEN) {
        digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
      }
    }
  } else {
    // SAFE / NORMAL: Green Solid ON, Red OFF, Buzzer OFF, Onboard LED OFF
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_ONBOARD_LED, LOW);
    if (PIN_BUZZER != PIN_LED_GREEN) {
      digitalWrite(PIN_BUZZER, LOW);
    }
  }
}

void dispatchUDPTelemetry() {
  unsigned long now = millis();
  unsigned long interval = (currentAlertLevel == ALERT_CRITICAL) ? 400 : 2000;

  if (now - lastTelemetryBroadcast < interval) {
    return;
  }
  lastTelemetryBroadcast = now;

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"zone\":\"" + String(ZONE_NAME) + "\",";
  payload += "\"uptime_s\":" + String(now / 1000) + ",";
  payload += "\"simulation\":" + String(simulationMode ? "true" : "false") + ",";
  payload += "\"power\":{\"source\":\"" + String(powerSource) + "\",\"pct\":" + String(batteryPercentage) + ",\"v\":" + String(batteryVoltage, 2) + "},";
  payload += "\"sensors\":{";
  payload += "\"flammable_ppm\":" + String(ppmFlammable, 1) + ",";
  payload += "\"h2_ppm\":" + String(ppmHydrogen, 1) + ",";
  payload += "\"co_ppm\":" + String(ppmCarbonMonoxide, 1) + ",";
  payload += "\"mq7_phase\":\"CONTINUOUS_5V\"";
  payload += "},";
  payload += "\"alert\":{";
  payload += "\"level\":" + String((int)currentAlertLevel) + ",";
  payload += "\"gas\":\"" + String(primaryDetectedGas) + "\"";
  payload += "}";
  payload += "}";

  udp.beginPacket(UDP_BROADCAST_IP, UDP_PORT);
  udp.write((const uint8_t*)payload.c_str(), payload.length());
  udp.endPacket();
}

void printLiveStatus() {
  unsigned long now = millis();
  if (now - lastSerialTelemetry >= 2000) {
    lastSerialTelemetry = now;
    Serial.print("[STATUS] Alert: ");
    if (currentAlertLevel == ALERT_CRITICAL) Serial.print("CRITICAL");
    else if (currentAlertLevel == ALERT_WARNING) Serial.print("WARNING");
    else Serial.print("NORMAL");

    Serial.print(" | Flammable: ");
    Serial.print(ppmFlammable, 1);
    Serial.print(" ppm | H2: ");
    Serial.print(ppmHydrogen, 1);
    Serial.print(" ppm | CO: ");
    Serial.print(ppmCarbonMonoxide, 1);
    Serial.print(" ppm | Green(27): ");
    Serial.print(digitalRead(PIN_LED_GREEN) ? "HIGH" : "LOW");
    Serial.print(" | Red(25): ");
    Serial.print(digitalRead(PIN_LED_RED) ? "HIGH" : "LOW");
    Serial.print(" | Sim: ");
    Serial.println(simulationMode ? "ACTIVE" : "OFF");
  }
}

void checkInputs() {
  while (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '\r' || cmd == '\n' || cmd == ' ') {
      continue; // Skip line endings
    }

    Serial.print("[SERIAL] Key received: '");
    Serial.print(cmd);
    Serial.println("'");

    if (cmd == 'S' || cmd == 's') {
      simulationMode = !simulationMode;
      simulationStartTime = millis();
      Serial.print("[AEROSENSE] Simulation Mode toggled: ");
      Serial.println(simulationMode ? "ACTIVE (simulating gas leak)" : "INACTIVE (live sensors)");
    } else if (cmd == 'M' || cmd == 'm') {
      currentAlertLevel = ALERT_NORMAL;
      digitalWrite(PIN_LED_RED, LOW);
      digitalWrite(PIN_ONBOARD_LED, LOW);
      digitalWrite(PIN_LED_GREEN, HIGH);
      if (PIN_BUZZER != PIN_LED_GREEN) {
        digitalWrite(PIN_BUZZER, LOW);
      }
      Serial.println("[AEROSENSE] Alarm manually silenced via Serial.");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==========================================");
  Serial.println("  AEROSENSE GAS MONITORING SYSTEM BOOT    ");
  Serial.println("==========================================");

  initHardware();
  initWireless();

  warmupStartTime = millis();
  Serial.println("[AEROSENSE] System initialized. Entering main monitoring loop.");
  Serial.println("[AEROSENSE] Tip: Type 'S' in Serial Monitor to simulate a gas leak!");
}

void loop() {
  server.handleClient();   // Serve HTTP requests (/telemetry)
  checkInputs();           // Listen for Serial commands
  readBatteryTelemetry();   // Maintain USB power status
  readSensors();           // Read ADC1 for MQ-2, MQ-8, MQ-7
  evaluateRiskState();     // Compute safety thresholds
  processLocalActuators(); // Control Green LED, Red LED, and Buzzer
  dispatchUDPTelemetry();   // Broadcast telemetry to LAN
  printLiveStatus();       // Print real-time sensor & LED state every 2 seconds
  delay(10);
}
