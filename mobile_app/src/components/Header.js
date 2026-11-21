/*
 * AeroSense Mobile App - Header Component
 * Clean top bar showing device status, battery level, and settings access.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import HapticService from '../services/HapticService';
import { useTextScale } from '../services/TextScaleContext';

export default function Header({
  telemetry,
  onOpenSettings,
  onOpenHotlines,
}) {
  const { scaleText } = useTextScale();
  const fs = (size) => Math.min(scaleText ? scaleText(size) : size, Math.round(size * 1.25));

  const isMains = telemetry?.power?.source === 'MAINS';
  const batteryPct = telemetry?.power?.pct ?? 100;
  const isSimulating = telemetry?.simulation;
  const isLinked = telemetry?.hardware_linked;

  return (
    <View style={styles.container}>
      {/* Device / Status Pill */}
      <View
        style={[
          styles.statusBadge,
          isSimulating
            ? styles.statusBadgeWarning
            : isLinked
            ? styles.statusBadgeNormal
            : styles.statusBadgeNeutral,
        ]}
      >
        <MaterialCommunityIcons
          name={isSimulating ? 'flask-outline' : isLinked ? 'wifi' : 'wifi-off'}
          size={14}
          color={isSimulating ? COLORS.warning : isLinked ? COLORS.primary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.statusText,
            {
              fontSize: fs(11),
              color: isSimulating
                ? COLORS.warning
                : isLinked
                ? COLORS.primary
                : COLORS.textSecondary,
            },
          ]}
        >
          {isSimulating ? 'Demo Mode' : isLinked ? 'Connected' : 'Offline'}
        </Text>
      </View>

      {/* Right Controls */}
      <View style={styles.rightGroup}>
        {/* Battery Telemetry */}
        <View style={styles.pill}>
          <MaterialCommunityIcons
            name={isMains ? 'power-plug' : batteryPct > 20 ? 'battery-high' : 'battery-alert'}
            size={14}
            color={isMains ? COLORS.primary : batteryPct > 20 ? COLORS.textSecondary : COLORS.danger}
          />
          <Text style={[styles.pillText, { fontSize: fs(11.5) }]}>{batteryPct}%</Text>
        </View>

        {/* Emergency Call Shortcut (Highly Accessible, Beside Gear Icon) */}
        <TouchableOpacity
          style={styles.callShortcutButton}
          onPress={() => {
            HapticService.triggerTap();
            if (onOpenHotlines) onOpenHotlines();
          }}
          activeOpacity={0.75}
          accessibilityLabel="Emergency Hotlines"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="phone" size={14} color="#FFFFFF" />
          <Text style={[styles.callShortcutText, { fontSize: fs(11.5) }]}>SOS</Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            HapticService.triggerTap();
            if (onOpenSettings) onOpenSettings();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <MaterialCommunityIcons name="cog-outline" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  statusBadgeNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  statusBadgeNeutral: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
  },
  statusText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  pillText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  callShortcutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  callShortcutText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
