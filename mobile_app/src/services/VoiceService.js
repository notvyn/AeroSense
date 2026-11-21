/*
 * Voice Guidance Service
 * Implements native text-to-speech for life-safety evacuation alerts.
 * Supports continuous looping voice-over during active emergencies until cancelled.
 */

import * as Speech from 'expo-speech';

class VoiceService {
  constructor() {
    this.isSpeaking = false;
    this.isMuted = false;
    this.isLooping = false;
    this.loopText = '';
    this.loopTimer = null;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  // Primary guidance entry point: loops continuously for emergencies, or plays once
  speakGuidance(text, shouldLoop = true) {
    if (shouldLoop) {
      this.startLooping(text);
    } else {
      this.speakOnce(text);
    }
  }

  // Speak once for non-emergency feedback or diagnostic tests
  async speakOnce(text) {
    if (this.isMuted) return;

    try {
      this.stop();
      this.isSpeaking = true;
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.05,
        rate: 0.95,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch (err) {
      this.isSpeaking = false;
    }
  }

  // Start continuous looping emergency voice guidance until explicitly stopped
  startLooping(text) {
    if (this.isMuted) return;

    // Avoid restarting if already looping the same text
    if (this.isLooping && this.loopText === text) {
      return;
    }

    this.stop();
    this.loopText = text;
    this.isLooping = true;
    this._playLoopIteration();
  }

  async _playLoopIteration() {
    if (!this.isLooping || this.isMuted) return;

    try {
      this.isSpeaking = true;
      Speech.speak(this.loopText, {
        language: 'en-US',
        pitch: 1.05,
        rate: 0.95,
        onDone: () => {
          this.isSpeaking = false;
          // Re-trigger loop iteration after a 2.0-second cadence pause
          if (this.isLooping && !this.isMuted) {
            this.loopTimer = setTimeout(() => {
              this._playLoopIteration();
            }, 2000);
          }
        },
        onError: () => {
          this.isSpeaking = false;
          if (this.isLooping && !this.isMuted) {
            this.loopTimer = setTimeout(() => {
              this._playLoopIteration();
            }, 2500);
          }
        },
      });
    } catch (err) {
      this.isSpeaking = false;
    }
  }

  // Stop all speech and cancel looping timers
  stop() {
    this.isLooping = false;
    this.isSpeaking = false;
    this.loopText = '';
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    try {
      Speech.stop();
    } catch (err) {
      // Ignored
    }
  }
}

export default new VoiceService();
