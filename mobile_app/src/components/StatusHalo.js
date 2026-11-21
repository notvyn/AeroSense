/*
 * AeroSense Mobile App - Status Hero Component
 * Prominent focal centerpiece establishing strong text hierarchy.
 * Displays clear, authoritative air quality safety status and peak metrics.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { useTextScale } from '../services/TextScaleContext';

export default function StatusHalo({ alertLevel, peakPpm }) {
  const { scaleText } = useTextScale();
  const fs = scaleText || ((s) => s);
  let accentColor = COLORS.primary;
  let cardBg = 'rgba(16, 185, 129, 0.08)';
  let borderColor = 'rgba(16, 185, 129, 0.25)';
  let iconName = 'shield-check';
  let badgeLabel = 'AIR QUALITY SAFE';
  let headline = 'Air Quality is Safe';
  let description = 'All monitored gases are well below safety thresholds. Air composition is clean.';

  if (alertLevel === 1) {
    accentColor = COLORS.warning;
    cardBg = 'rgba(245, 158, 11, 0.1)';
    borderColor = 'rgba(245, 158, 11, 0.3)';
    iconName = 'alert-circle-outline';
    badgeLabel = 'ELEVATED ACCUMULATION';
    headline = 'Elevated Gas Level';
    description = 'Sensor readings exceed advisory baseline. Check appliances and ventilate.';
  } else if (alertLevel === 2) {
    accentColor = COLORS.danger;
    cardBg = 'rgba(239, 68, 68, 0.14)';
    borderColor = 'rgba(239, 68, 68, 0.4)';
    iconName = 'alert-octagon';
    badgeLabel = 'CRITICAL HAZARD ACTIVE';
    headline = 'Hazardous Gas Leak';
    description = 'Permissible ceiling breached. Evacuate premises immediately.';
  }

  return (
    <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
      {/* Top Status Pill */}
      <View style={styles.topStatusRow}>
        <View style={[styles.statusBadge, { borderColor: accentColor }]}>
          <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.statusBadgeText, { color: accentColor, fontSize: fs(10) }]}>
            {badgeLabel}
          </Text>
        </View>

        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={iconName} size={24} color={accentColor} />
        </View>
      </View>

      {/* Primary Visual Focal Headline */}
      <Text style={[styles.heroHeadline, { fontSize: fs(22) }]}>{headline}</Text>
      <Text style={[styles.heroDescription, { fontSize: fs(13) }]}>{description}</Text>

      {/* Hero Metric Section */}
      <View style={styles.metricBanner}>
        <View style={styles.metricLeft}>
          <Text style={[styles.metricLabel, { fontSize: fs(9) }]}>PEAK CONCENTRATION</Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, { color: accentColor, fontSize: fs(26) }]}>
              {(peakPpm || 0).toFixed(1)}
            </Text>
            <Text style={[styles.metricUnit, { fontSize: fs(11) }]}>PPM</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricRight}>
          <Text style={[styles.metricLabel, { fontSize: fs(9) }]}>BASELINE STATUS</Text>
          <Text style={[styles.metricStatusText, { fontSize: fs(12) }]}>
            {alertLevel === 0 ? 'Within Safe Limits' : alertLevel === 1 ? 'Advisory Range' : 'Danger Zone'}
          </Text>
          <Text style={[styles.metricSub, { fontSize: fs(10) }]}>Ceiling: 200 PPM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginTop: 8,
    marginBottom: 16,
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    backgroundColor: COLORS.surface,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeadline: {
    fontFamily: FONTS.sans,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroDescription: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLeft: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  metricRight: {
    flex: 1,
  },
  metricLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontFamily: FONTS.mono,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  metricStatusText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricSub: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
