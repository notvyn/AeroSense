/*
 * AeroSense Typography System
 * Two Primary Font Disciplines:
 * 1. Primary Display / Body: Clean Modern Sans-Serif (System default / Roboto / Inter)
 * 2. Primary Metrics: Monospace for sensor telemetry, numerical readings, and timers.
 */

import { Platform } from 'react-native';

export const FONTS = {
  // Primary 1: UI, Headlines, and Protocol Instructions
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),

  // Primary 2: Numerical Telemetry & Telecommunication Codes
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};
