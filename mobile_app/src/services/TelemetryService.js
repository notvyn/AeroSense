/*
 * AeroSense Mobile App - TelemetryService
 * Handles direct local hardware communication with the physical ESP32 hub,
 * IP configuration, and high-fidelity local simulation fallback.
 */

class TelemetryService {
  constructor() {
    this.listeners = [];
    this.deviceIp = '192.168.18.188'; // Assigned IP from local Wi-Fi router
    this.pollingInterval = null;
    this.isHardwareLinked = false;
    this.simInterval = null;
    this.simStep = 0;
    this.isSimulating = false;
    this.lastPingMs = 0;

    this.currentData = {
      device_id: 'AEROSENSE-HUB-01',
      zone: 'Zone 1 - Main Enclosure',
      uptime_s: 0,
      hardware_linked: false,
      simulation: false,
      device_ip: this.deviceIp,
      ping_ms: 0,
      power: {
        source: 'MAINS',
        pct: 98,
        v: 4.12,
      },
      sensors: {
        flammable_ppm: 32.0,
        h2_ppm: 12.0,
        co_ppm: 5.5,
        mq7_phase: 'SENSING',
      },
      alert: {
        level: 0, // 0 = Normal, 1 = Warning, 2 = Critical
        gas: 'NORMAL',
      },
    };

    // Begin local hardware polling
    this.startHardwarePolling();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.currentData);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener({ ...this.currentData });
    }
  }

  setDeviceIp(ip) {
    if (!ip) return;
    this.deviceIp = ip.trim();
    this.currentData.device_ip = this.deviceIp;
    this.notify();
    this.startHardwarePolling();
  }

  // Polls the physical ESP32 local HTTP/JSON endpoint over local hotspot/Wi-Fi
  startHardwarePolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      if (this.isSimulating) return; // Do not overwrite active demo simulation

      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(`http://${this.deviceIp}/telemetry`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const payload = await response.json();
          this.lastPingMs = Date.now() - start;

          this.isHardwareLinked = true;
          this.currentData = {
            ...this.currentData,
            ...payload,
            hardware_linked: true,
            ping_ms: this.lastPingMs,
          };
          this.notify();
        }
      } catch (err) {
        // Physical device not reachable yet on this IP
        if (this.isHardwareLinked) {
          this.isHardwareLinked = false;
          this.currentData.hardware_linked = false;
          this.notify();
        }
      }
    }, 1500);
  }

  // Toggle internal demonstration simulator
  toggleSimulation(forcedState) {
    const targetState = forcedState !== undefined ? forcedState : !this.isSimulating;
    this.isSimulating = targetState;

    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }

    if (this.isSimulating) {
      this.simStep = 0;
      this.currentData.simulation = true;
      // Immediately set initial baseline simulation values
      this.currentData.sensors.flammable_ppm = 36.4;
      this.currentData.sensors.h2_ppm = 12.0;
      this.currentData.sensors.co_ppm = 5.2;
      this.currentData.alert.level = 0;
      this.currentData.alert.gas = 'NORMAL';

      // Synchronously notify all listeners immediately
      this.notify();

      this.simInterval = setInterval(() => {
        this.simStep += 1;

        if (this.simStep < 3) {
          // Normal Baseline fluctuations
          this.currentData.sensors.flammable_ppm = +(32.0 + Math.random() * 8.0).toFixed(1);
          this.currentData.sensors.h2_ppm = +(10.0 + Math.random() * 4.0).toFixed(1);
          this.currentData.sensors.co_ppm = +(4.0 + Math.random() * 2.0).toFixed(1);
          this.currentData.alert.level = 0;
          this.currentData.alert.gas = 'NORMAL';
        } else if (this.simStep < 6) {
          // Advisory / Warning escalation
          this.currentData.sensors.flammable_ppm = +(230.0 + Math.random() * 20.0).toFixed(1);
          this.currentData.sensors.h2_ppm = +(120.0 + Math.random() * 15.0).toFixed(1);
          this.currentData.sensors.co_ppm = +(18.0 + Math.random() * 3.0).toFixed(1);
          this.currentData.alert.level = 1;
          this.currentData.alert.gas = 'FLAMMABLE_GAS';
        } else {
          // Critical Emergency Spike (Sustained continuously until user explicitly stops simulation!)
          this.currentData.sensors.flammable_ppm = +(472.0 + Math.random() * 20.0).toFixed(1);
          this.currentData.sensors.h2_ppm = +(215.0 + Math.random() * 15.0).toFixed(1);
          this.currentData.sensors.co_ppm = +(32.0 + Math.random() * 3.0).toFixed(1);
          this.currentData.alert.level = 2;
          this.currentData.alert.gas = 'FLAMMABLE_GAS';
        }

        this.currentData.uptime_s += 2;
        this.notify();
      }, 1600);
    } else {
      // User explicitly stopped simulation: reset immediately to clean normal baseline
      this.currentData.simulation = false;
      this.currentData.alert.level = 0;
      this.currentData.alert.gas = 'NORMAL';
      this.currentData.sensors.flammable_ppm = 32.0;
      this.currentData.sensors.h2_ppm = 12.0;
      this.currentData.sensors.co_ppm = 5.0;
      this.notify();
    }

    return this.isSimulating;
  }
}

export default new TelemetryService();
