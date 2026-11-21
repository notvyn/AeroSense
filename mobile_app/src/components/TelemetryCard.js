/*
 * AeroSense Mobile App - TelemetryCard Component
 * Clean, standard sensor card with natural terminology,
 * smooth progress indicator, and an expandable non-technical help guide for general users.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import HapticService from '../services/HapticService';
import { useTextScale } from '../services/TextScaleContext';

// Enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Simple, non-technical guidance for general users
const GAS_GUIDE_DATA = {
  'MQ-2': {
    summary: 'Stove and cooking fuel. Highly flammable if it leaks into the room.',
    sources: 'Kitchen stoves, LPG tanks, regulator valves, and cracked rubber hoses.',
    warningSigns: 'Rotten egg or sulfur smell, or a faint hissing sound near the gas tank.',
    whatToDo: 'Turn off the tank valve, open doors and windows, and do not flip any light switches.',
  },
  'MQ-8': {
    summary: 'Light gas that rises to the ceiling. Produced by charging large batteries.',
    sources: 'Home inverters, solar battery banks, and UPS emergency power backups.',
    warningSigns: 'Overheating, swelling, or hot battery smell while charging.',
    whatToDo: 'Unplug the battery charger, keep windows open, and let air flow near the ceiling.',
  },
  'MQ-7': {
    summary: 'Invisible, odorless poisonous gas produced when fuels burn without enough fresh air.',
    sources: 'Gas stoves, fuel heaters, running portable generators, and car exhaust in garages.',
    warningSigns: 'Sudden headache, dizziness, feeling very tired, or nausea.',
    whatToDo: 'Step outside into fresh outdoor air right away and call for medical help if dizzy.',
  },
};

export default function TelemetryCard({
  sensorName,
  sensorModel,
  chemicalFormula,
  iconName,
  ppm,
  warningThreshold,
  criticalThreshold,
  extraNote,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const isCritical = ppm >= criticalThreshold;
  const isWarning = ppm >= warningThreshold && !isCritical;

  let accentColor = COLORS.primary;
  let statusText = 'Normal';
  let badgeBg = 'rgba(16, 185, 129, 0.12)';

  if (isCritical) {
    accentColor = COLORS.danger;
    statusText = 'High';
    badgeBg = 'rgba(239, 68, 68, 0.15)';
  } else if (isWarning) {
    accentColor = COLORS.warning;
    statusText = 'Elevated';
    badgeBg = 'rgba(245, 158, 11, 0.15)';
  }

  // Clamped ratio for progress bar (5% to 100%)
  const progressRatio = Math.min(1.0, Math.max(0.05, ppm / criticalThreshold));

  // Match simple guidance data by sensor model
  const guide =
    GAS_GUIDE_DATA[sensorModel] ||
    (sensorName.includes('Cooking')
      ? GAS_GUIDE_DATA['MQ-2']
      : sensorName.includes('Hydrogen')
      ? GAS_GUIDE_DATA['MQ-8']
      : GAS_GUIDE_DATA['MQ-7']);

  const { scaleText } = useTextScale();
  const fs = scaleText || ((s) => s);

  const handleToggleDetails = () => {
    HapticService.triggerTap();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDetails(!showDetails);
  };

  return (
    <View style={[styles.card, isCritical && styles.cardCritical]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.metaGroup}>
          <View style={[styles.iconWrapper, { backgroundColor: badgeBg }]}>
            <MaterialCommunityIcons name={iconName} size={18} color={accentColor} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={[styles.sensorTitle, { fontSize: fs(14) }]} numberOfLines={1}>
              {sensorName}
            </Text>
            <Text style={[styles.sensorSubtitle, { fontSize: fs(11) }]} numberOfLines={1}>
              {chemicalFormula}
            </Text>
          </View>
        </View>

        {/* Status Pill Badge */}
        <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
          <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.statusPillText, { color: accentColor, fontSize: fs(10.5) }]}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Reading Row */}
      <View style={styles.readingRow}>
        <Text style={[styles.ppmValue, { color: accentColor, fontSize: fs(28) }]}>
          {ppm.toFixed(1)}
        </Text>
        <Text style={[styles.ppmUnit, { fontSize: fs(11) }]}>PPM</Text>
      </View>

      {/* Progress Track */}
      <View style={styles.trackBackground}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${Math.round(progressRatio * 100)}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>

      {/* Safe Limit Footer */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { fontSize: fs(11) }]}>
          Safe limit: <Text style={[styles.footerBold, { fontSize: fs(11) }]}>under {warningThreshold} PPM</Text>
        </Text>
        {extraNote ? (
          <Text style={[styles.footerNote, { fontSize: fs(10) }]} numberOfLines={1}>
            {extraNote}
          </Text>
        ) : null}
      </View>

      {/* Simple, Non-Technical Summary (Always Visible) */}
      <Text style={[styles.summaryText, { fontSize: fs(11.5) }]}>{guide.summary}</Text>

      {/* Expand / Collapse Button */}
      <TouchableOpacity
        style={styles.toggleRow}
        activeOpacity={0.7}
        onPress={handleToggleDetails}
      >
        <Text style={[styles.toggleText, { fontSize: fs(11) }]}>
          {showDetails ? 'Hide details' : 'What to look for & what to do'}
        </Text>
        <MaterialCommunityIcons
          name={showDetails ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {/* Expanded Simple Details Drawer */}
      {showDetails && (
        <View style={styles.detailsDrawer}>
          <View style={styles.drawerItem}>
            <MaterialCommunityIcons name="home-search-outline" size={15} color={COLORS.textSecondary} />
            <Text style={[styles.drawerText, { fontSize: fs(11) }]}>
              <Text style={[styles.drawerBold, { fontSize: fs(11) }]}>Common sources: </Text>
              {guide.sources}
            </Text>
          </View>

          <View style={styles.drawerItem}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={COLORS.warning} />
            <Text style={[styles.drawerText, { fontSize: fs(11) }]}>
              <Text style={[styles.drawerBold, { fontSize: fs(11) }]}>Warning signs: </Text>
              {guide.warningSigns}
            </Text>
          </View>

          <View style={styles.drawerItem}>
            <MaterialCommunityIcons name="shield-check-outline" size={15} color={COLORS.primary} />
            <Text style={[styles.drawerText, { fontSize: fs(11) }]}>
              <Text style={[styles.drawerBold, { fontSize: fs(11) }]}>What to do: </Text>
              {guide.whatToDo}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCritical: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleWrapper: {
    flex: 1,
  },
  sensorTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sensorSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 2,
  },
  ppmValue: {
    fontFamily: FONTS.mono,
    fontSize: 26,
    fontWeight: '700',
  },
  ppmUnit: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  trackBackground: {
    height: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footerBold: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footerNote: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  summaryText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailsDrawer: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  drawerText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  drawerBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
