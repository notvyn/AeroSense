# AeroSense ESP32 Firmware Guide

## Overview
This directory contains the production-grade Arduino firmware for the **AeroSense** ceiling-mounted gas detection hub. It supports both **Arduino Nano ESP32** (ESP32-S3) and classic **ESP32 Dev Module (WROOM-32)** boards with automatic pin detection and universal LEDC PWM compatibility.

---

## Hardware Pinout Reference

| Sensor / Module | Arduino Nano ESP32 Pin | Classic ESP32 GPIO | Function / Wiring Description |
| :--- | :--- | :--- | :--- |
| **MQ-2 (Flammable / Methane / LPG)** | **A0** | **GPIO 34** (ADC1_CH6) | Analog output scaled through $10\text{ k}\Omega : 10\text{ k}\Omega$ voltage divider. |
| **MQ-8 (Hydrogen Gas H2)** | **A1** | **GPIO 35** (ADC1_CH7) | Analog output scaled through $10\text{ k}\Omega : 10\text{ k}\Omega$ voltage divider. |
| **MQ-7 (Carbon Monoxide CO)** | **A2** | **GPIO 32** (ADC1_CH4) | Analog output scaled through $10\text{ k}\Omega : 10\text{ k}\Omega$ voltage divider. |
| **Battery Voltage Monitor** | **A3** | **GPIO 33** (ADC1_CH5) | Divided battery voltage ($100\text{ k}\Omega : 100\text{ k}\Omega$). |
| **MQ-7 Heater Switching** | **D9** | **GPIO 25** | PWM pin driving N-channel MOSFET ($5\text{V}$ purge $\leftrightarrow 1.4\text{V}$ sense). |
| **Active 5V Buzzer** | **D6** | **GPIO 26** | Connected to Positive leg of the active buzzer; Negative leg to GND. |
| **Status LED** | **LED_BUILTIN** | **GPIO 2** | Onboard status indicator LED. |
| **Simulation Pushbutton** | **D4** | **GPIO 4** | Pushbutton between D4/GPIO 4 and GND (internal pull-up). |

---

## How to Flash via Arduino IDE

### For Arduino Nano ESP32:
1. Open **Arduino IDE**.
2. Go to **Tools > Board > Arduino ESP32 Boards > Arduino Nano ESP32** (or **esp32 > Arduino Nano ESP32**).
3. Go to **Tools > Port** and select your Arduino Nano ESP32 port.
4. Ensure your mobile hotspot is active with SSID `AeroSenseHotspot` and password `aerosense123` (or edit lines 165–167 in `aerosense_firmware.ino` to match your home Wi-Fi).
5. Click **Upload**.
6. Open **Tools > Serial Monitor** set to **115200 baud**.
7. Look for the assigned IP address (e.g. `192.168.43.xxx`) and enter it into the AeroSense mobile app!
8. Press `S` in the Serial Monitor (or press the button on D4) to toggle **Simulation Mode** and test gas alerts immediately!

### For ESP32 Dev Module (WROOM-32):
1. Go to **Tools > Board > esp32 > ESP32 Dev Module**.
2. Go to **Tools > Port** and select your COM port.
3. Follow the same upload and Wi-Fi steps above.
