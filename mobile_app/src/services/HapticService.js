/*
 * Haptic Vibration Service
 * Implements non-standard emergency vibration patterns to awaken occupants.
 * Directly interfaces with the device hardware actuator.
 */

import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class HapticService {
  constructor() {
    this.isAlarming = false;
    this.intervalId = null;
  }

  // Instant responsive tap for button interactions
  triggerTap() {
    try {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      } else {
        Vibration.vibrate(35); // Crisp 35ms tactile click on Android
      }
    } catch (e) {
      // Graceful fallback
    }
  }

  // Warning cadence: single advisory buzz
  triggerAdvisory() {
    try {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Vibration.vibrate(400);
      }
    } catch (e) {
      // Graceful fallback
    }
  }

  // Critical cadence: [wait 0ms, vibrate 1000ms, pause 200ms, vibrate 1000ms, pause 200ms, vibrate 1500ms]
  startCriticalAlarm() {
    if (this.isAlarming) return;
    this.isAlarming = true;

    try {
      const pattern = [0, 1000, 200, 1000, 200, 1500];

      if (Platform.OS === 'android') {
        Vibration.vibrate(pattern, true);
      } else {
        Vibration.vibrate(pattern);
        this.intervalId = setInterval(() => {
          if (this.isAlarming) {
            Vibration.vibrate(pattern);
          }
        }, 4000);
      }
    } catch (e) {
      // Graceful fallback
    }
  }

  stopAlarm() {
    this.isAlarming = false;
    try {
      Vibration.cancel();
    } catch (e) {}
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default new HapticService();
