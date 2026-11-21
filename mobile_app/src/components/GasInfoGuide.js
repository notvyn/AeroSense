/*
 * AeroSense Mobile App - GasInfoGuide Component
 * Provides a clean summary under the Gas Levels section with an expandable
 * detailed guide on safe thresholds, physical vapor buoyancy, and leak symptoms.
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

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function GasInfoGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    HapticService.triggerTap();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.card}>
      {/* Header & Short Summary (Always Visible) */}
      <TouchableOpacity
        style={styles.summaryHeader}
        activeOpacity={0.7}
        onPress={toggleExpand}
      >
        <View style={styles.headerLeftGroup}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Understanding Gas Levels</Text>
            <Text style={styles.headerSubtitle}>
              {isExpanded
                ? 'Safe limits, buoyancy physics, and leak symptoms'
                : 'PPM guide, ceiling detection, and safe thresholds'}
            </Text>
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Brief Introductory Summary */}
      <Text style={styles.summaryText}>
        Sensors measure gas in parts per million (PPM). Under normal conditions, air contains
        less than 50 PPM baseline. Ceiling placement intercepts rising combustible and toxic
        plumes before they fill the room.
      </Text>

      {/* Toggle Action Pill */}
      <TouchableOpacity
        style={styles.togglePill}
        activeOpacity={0.7}
        onPress={toggleExpand}
      >
        <Text style={styles.togglePillText}>
          {isExpanded ? 'Hide Detailed Information' : 'Show Detailed Gas Guide & Limits'}
        </Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {/* Detailed Information (Collapsible) */}
      {isExpanded && (
        <View style={styles.detailedSection}>
          <View style={styles.divider} />

          {/* Gas 1: LPG & Methane */}
          <View style={styles.gasBlock}>
            <View style={styles.gasTitleRow}>
              <View style={styles.gasIconCircle}>
                <MaterialCommunityIcons name="fire" size={16} color={COLORS.danger} />
              </View>
              <View style={styles.gasTitleInfo}>
                <Text style={styles.gasName}>Cooking Gas (LPG & Methane)</Text>
                <Text style={styles.gasModel}>Sensor MQ-2 • Combustible Hydrocarbons</Text>
              </View>
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>EXPLOSIVE</Text>
              </View>
            </View>

            <View style={styles.metricLimitRow}>
              <Text style={styles.metricLimitLabel}>SAFE THRESHOLD:</Text>
              <Text style={styles.metricLimitValue}>Below 200 PPM (Alarm at 400 PPM)</Text>
            </View>

            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Buoyancy & Physics:</Text> Methane (natural gas) is 45% lighter
              than air and rises to the ceiling immediately. LPG (propane/butane) is heavier and sinks, but warm
              combustion heat currents carry it upward toward the ceiling sensor.
            </Text>
            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Common Sources:</Text> Stove burners, loose LPG cylinder
              regulator clamps, cracked rubber hoses, unlit pilot lights.
            </Text>
          </View>

          <View style={styles.subDivider} />

          {/* Gas 2: Hydrogen Gas */}
          <View style={styles.gasBlock}>
            <View style={styles.gasTitleRow}>
              <View style={[styles.gasIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <MaterialCommunityIcons name="atom" size={16} color="#3B82F6" />
              </View>
              <View style={styles.gasTitleInfo}>
                <Text style={styles.gasName}>Hydrogen Gas (H2)</Text>
                <Text style={styles.gasModel}>Sensor MQ-8 • Light Plume Detection</Text>
              </View>
              <View style={[styles.badgeWrap, { borderColor: 'rgba(59, 130, 246, 0.4)' }]}>
                <Text style={[styles.badgeText, { color: '#3B82F6' }]}>BUOYANT</Text>
              </View>
            </View>

            <View style={styles.metricLimitRow}>
              <Text style={styles.metricLimitLabel}>SAFE THRESHOLD:</Text>
              <Text style={styles.metricLimitValue}>Below 400 PPM (Alarm at 800 PPM)</Text>
            </View>

            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Buoyancy & Physics:</Text> Hydrogen is 14 times lighter than
              ambient air (density: 0.07). It ascends rapidly to highest ceiling pockets and roof ridges where
              it can ignite with even minor static electricity.
            </Text>
            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Common Sources:</Text> Overcharging lead-acid and lithium
              UPS battery backups, solar inverter rooms, electronics charging stations.
            </Text>
          </View>

          <View style={styles.subDivider} />

          {/* Gas 3: Carbon Monoxide */}
          <View style={styles.gasBlock}>
            <View style={styles.gasTitleRow}>
              <View style={[styles.gasIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <MaterialCommunityIcons name="gas-cylinder" size={16} color="#8B5CF6" />
              </View>
              <View style={styles.gasTitleInfo}>
                <Text style={styles.gasName}>Carbon Monoxide (CO)</Text>
                <Text style={styles.gasModel}>Sensor MQ-7 • Toxic Asphyxiant</Text>
              </View>
              <View style={[styles.badgeWrap, { borderColor: 'rgba(139, 92, 246, 0.4)' }]}>
                <Text style={[styles.badgeText, { color: '#8B5CF6' }]}>TOXIC</Text>
              </View>
            </View>

            <View style={styles.metricLimitRow}>
              <Text style={styles.metricLimitLabel}>SAFE THRESHOLD:</Text>
              <Text style={styles.metricLimitValue}>Below 25 PPM (Alarm at 50 PPM)</Text>
            </View>

            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Health Effects:</Text> Known as the "silent killer"—completely
              colorless, odorless, and tasteless. Binds with hemoglobin in the bloodstream, starving brain and
              vital organs of oxygen.
            </Text>
            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Symptoms of Exposure:</Text> Mild: headache, dizziness, fatigue.
              Severe: nausea, confusion, loss of consciousness.
            </Text>
            <Text style={styles.gasDetailDesc}>
              • <Text style={styles.boldText}>Common Sources:</Text> Incomplete combustion from fuel heaters,
              faulty gas stoves, running portable generators, smoldering materials.
            </Text>
          </View>

          <View style={styles.subDivider} />

          {/* Quick Action Matrix */}
          <View style={styles.quickMatrix}>
            <Text style={styles.matrixTitle}>Safety Action Summary</Text>
            <View style={styles.matrixRow}>
              <View style={[styles.matrixDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.matrixText}>
                <Text style={styles.boldText}>Safe (&lt; 200 PPM):</Text> Normal air quality. Keep standard ventilation.
              </Text>
            </View>
            <View style={styles.matrixRow}>
              <View style={[styles.matrixDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.matrixText}>
                <Text style={styles.boldText}>Elevated (200 - 400 PPM):</Text> Open windows. Inspect gas appliances. Do not use open flames.
              </Text>
            </View>
            <View style={styles.matrixRow}>
              <View style={[styles.matrixDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.matrixText}>
                <Text style={styles.boldText}>Critical (&gt; 400 PPM):</Text> Evacuate immediately outside. Do not touch electrical switches. Call 911 / BFP.
              </Text>
            </View>
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
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  summaryText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 10,
    marginBottom: 6,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  togglePillText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailedSection: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  subDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  gasBlock: {
    gap: 4,
  },
  gasTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gasIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gasTitleInfo: {
    flex: 1,
  },
  gasName: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gasModel: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  badgeWrap: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgeText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.danger,
    letterSpacing: 0.5,
  },
  metricLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginVertical: 4,
  },
  metricLimitLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  metricLimitValue: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gasDetailDesc: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickMatrix: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginTop: 6,
  },
  matrixTitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  matrixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  matrixText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
});
