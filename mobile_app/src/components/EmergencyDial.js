/*
 * AeroSense Mobile App - EmergencyDial Component
 * Inspired by the "Dial Button Prototype" rotary dial micro-interaction (Emani.Ui):
 * - Symmetrical circular rotary dial with 6 satellite nodes orbiting a central knob
 * - Exact 6-node configuration matching the 6 verified Philippine national emergency hotlines
 * - Smooth shortest-arc animated spring rotation pointing directly at the active node
 * - Inline dashboard placement ensuring zero content is obscured or hidden
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import HapticService from '../services/HapticService';

// Geometry & Trigonometry Constants (270x270 stage)
const STAGE_SIZE = 270;
const CX = STAGE_SIZE / 2; // 135
const CY = STAGE_SIZE / 2; // 135
const R_ORBIT = 90;
const NODE_SIZE = 38;
const KNOB_SIZE = 106;

// The 6 Verified Philippine National Emergency Hotlines placed at 60-degree intervals
const DIAL_NODES = [
  {
    id: 'emergency_911',
    angle: 0, // Top (12 o'clock)
    name: 'National Emergency 911',
    agency: 'Emergency 911 National Command',
    displayPhone: '911',
    phone: '911',
    categoryLabel: 'NATIONAL RESCUE',
    icon: 'phone-alert',
    badgeColor: '#EF4444',
    description: 'Immediate nationwide dispatch for police, fire suppression, and medical rescue.',
  },
  {
    id: 'red_cross_143',
    angle: 60, // Top-Right (2 o'clock)
    name: 'Philippine Red Cross',
    agency: 'PRC Emergency Medical & Ambulance',
    displayPhone: '143',
    phone: '143',
    categoryLabel: 'AMBULANCE / OXYGEN',
    icon: 'ambulance',
    badgeColor: '#DC2626',
    description: '24/7 emergency medical ambulance dispatch and portable oxygen therapy for victims.',
  },
  {
    id: 'bfp_hazmat',
    angle: 120, // Bottom-Right (4 o'clock)
    name: 'BFP Hazmat & Fire',
    agency: 'Bureau of Fire Protection',
    displayPhone: '(02) 8426-0219',
    phone: '0284260219',
    categoryLabel: 'FIRE & HAZMAT',
    icon: 'fire-truck',
    badgeColor: '#F59E0B',
    description: 'Specialized chemical containment, gas leak mitigation, and explosion suppression.',
  },
  {
    id: 'up_pgh_poison',
    angle: 180, // Bottom (6 o'clock)
    name: 'UP-PGH Poison Control',
    agency: 'National Poison Center',
    displayPhone: '(02) 8524-1078',
    phone: '0285241078',
    categoryLabel: 'TOXICOLOGY / CO',
    icon: 'skull-crossbones',
    badgeColor: '#8B5CF6',
    description: 'National toxicologists for Carbon Monoxide asphyxiation and toxic vapor inhalation.',
  },
  {
    id: 'ndrrmc_ops',
    angle: 240, // Bottom-Left (8 o'clock)
    name: 'NDRRMC Disaster Ops',
    agency: 'Office of Civil Defense',
    displayPhone: '(02) 8911-1406',
    phone: '0289111406',
    categoryLabel: 'CIVIL DEFENSE',
    icon: 'shield-alert',
    badgeColor: '#3B82F6',
    description: 'Community-scale disaster operations and public civil defense coordination.',
  },
  {
    id: 'safety_lead',
    angle: 300, // Top-Left (10 o'clock)
    name: 'Facility Safety Marshal',
    agency: 'On-Site Property / Floor Lead',
    displayPhone: '0917-123-4567',
    phone: '09171234567',
    categoryLabel: 'ON-SITE MARSHAL',
    icon: 'badge-account-alert',
    badgeColor: '#10B981',
    description: 'On-site coordinator for building gas mains shutoff and outdoor assembly muster.',
  },
];

export default function EmergencyDial() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Animated rotation value (in degrees)
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const currentAngleRef = useRef(0);

  // Knob press pulse
  const knobPulse = useRef(new Animated.Value(1)).current;

  const activeContact = DIAL_NODES[selectedIndex];

  const handleSelectNode = (index) => {
    HapticService.triggerTap();
    const targetDeg = DIAL_NODES[index].angle;

    // Shortest-arc rotation interpolation
    const currentAngle = currentAngleRef.current;
    const diff = (((targetDeg - (currentAngle % 360)) + 540) % 360) - 180;
    const newAngle = currentAngle + diff;

    currentAngleRef.current = newAngle;
    setSelectedIndex(index);

    Animated.spring(rotationAnim, {
      toValue: newAngle,
      friction: 6,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const handleCall = (phoneNumber) => {
    HapticService.triggerTap();
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleKnobPress = () => {
    Animated.sequence([
      Animated.timing(knobPulse, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(knobPulse, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    handleCall(activeContact.phone);
  };

  const rotateInterpolation = rotationAnim.interpolate({
    inputRange: [-720, 720],
    outputRange: ['-720deg', '720deg'],
  });

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="compass-outline" size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Emergency Rotary Dial</Text>
            <Text style={styles.sectionSubtitle}>
              Official speed-dial • Tap node or center knob to call
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.categoryPill,
            { borderColor: `${activeContact.badgeColor}60` },
          ]}
        >
          <Text style={[styles.categoryPillText, { color: activeContact.badgeColor }]}>
            {activeContact.categoryLabel}
          </Text>
        </View>
      </View>

      {/* Symmetrical Dial Stage (Based on Emani.Ui Dial Prototype) */}
      <View style={styles.dialStage}>
        {/* Outer Circular Base Plate */}
        <View style={styles.outerBasePlate} />

        {/* Orbit Track Ring */}
        <View style={styles.orbitTrack} />

        {/* 6 Radial Satellite Nodes */}
        {DIAL_NODES.map((node, index) => {
          const rad = (node.angle * Math.PI) / 180;
          const posX = CX + R_ORBIT * Math.sin(rad) - NODE_SIZE / 2;
          const posY = CY - R_ORBIT * Math.cos(rad) - NODE_SIZE / 2;
          const isSelected = index === selectedIndex;

          return (
            <TouchableOpacity
              key={node.id}
              activeOpacity={0.8}
              onPress={() => handleSelectNode(index)}
              style={[
                styles.satelliteNode,
                {
                  left: posX,
                  top: posY,
                  borderColor: isSelected ? node.badgeColor : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: isSelected ? '#1E293B' : '#0B1220',
                  transform: [{ scale: isSelected ? 1.15 : 1 }],
                },
              ]}
              accessibilityLabel={`${node.name} Hotline`}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={node.icon}
                size={17}
                color={isSelected ? node.badgeColor : COLORS.textMuted}
              />
            </TouchableOpacity>
          );
        })}

        {/* Central Rotary Dial Knob (Rotates to selected node) */}
        <Animated.View
          style={[
            styles.knobWrapper,
            {
              transform: [
                { rotate: rotateInterpolation },
                { scale: knobPulse },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleKnobPress}
            style={styles.knobTouchable}
            accessibilityLabel={`Call ${activeContact.name}`}
            accessibilityRole="button"
          >
            {/* Illuminated Top Indicator Notch (Points directly to active node) */}
            <View
              style={[
                styles.indicatorNotch,
                { backgroundColor: activeContact.badgeColor },
              ]}
            />

            {/* Inner Tactile Bevel */}
            <View style={styles.knobInnerDisc}>
              <MaterialCommunityIcons
                name="phone-in-talk"
                size={22}
                color={activeContact.badgeColor}
              />
              <Text style={styles.knobCallText}>CALL</Text>
              <Text style={styles.knobSubText}>TAP CORE</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Selected Hotline Detailed Readout Card */}
      <View style={styles.readoutCard}>
        <View style={styles.readoutTopRow}>
          <View style={styles.readoutTitleGroup}>
            <View
              style={[
                styles.readoutIconCircle,
                { backgroundColor: `${activeContact.badgeColor}20` },
              ]}
            >
              <MaterialCommunityIcons
                name={activeContact.icon}
                size={18}
                color={activeContact.badgeColor}
              />
            </View>
            <View style={styles.readoutCol}>
              <Text style={styles.readoutName} numberOfLines={1}>
                {activeContact.name}
              </Text>
              <Text style={styles.readoutAgency} numberOfLines={1}>
                {activeContact.agency}
              </Text>
            </View>
          </View>

          {/* Formatted Number Display */}
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>
              {activeContact.displayPhone}
            </Text>
          </View>
        </View>

        <Text style={styles.readoutDesc}>{activeContact.description}</Text>

        {/* Direct Call Button */}
        <TouchableOpacity
          style={[
            styles.fullCallButton,
            { backgroundColor: activeContact.badgeColor },
          ]}
          activeOpacity={0.8}
          onPress={() => handleCall(activeContact.phone)}
        >
          <MaterialCommunityIcons name="phone" size={16} color="#FFFFFF" />
          <Text style={styles.fullCallButtonText}>
            CALL {activeContact.displayPhone}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  categoryPillText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
  },

  // Rotary Dial Stage (270 x 270)
  dialStage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    alignSelf: 'center',
    position: 'relative',
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerBasePlate: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#09111E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  orbitTrack: {
    position: 'absolute',
    width: R_ORBIT * 2, // 180
    height: R_ORBIT * 2,
    borderRadius: R_ORBIT,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },

  // Satellite Nodes
  satelliteNode: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Rotary Knob
  knobWrapper: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobTouchable: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#111E33',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  indicatorNotch: {
    position: 'absolute',
    top: 5,
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  knobInnerDisc: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#0A1220',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  knobCallText: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  knobSubText: {
    fontFamily: FONTS.mono,
    fontSize: 7,
    color: COLORS.textMuted,
  },

  // Detailed Readout Banner
  readoutCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 6,
  },
  readoutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  readoutTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  readoutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readoutCol: {
    flex: 1,
  },
  readoutName: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  readoutAgency: {
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    color: COLORS.textSecondary,
  },
  numberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  readoutDesc: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  fullCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  fullCallButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
