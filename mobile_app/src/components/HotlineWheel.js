/*
 * AeroSense Mobile App - Action Dial Micro Interaction (HotlineWheel)
 * Inspired by the segmented radial Action Dial micro-interaction:
 * - Semicircular dial architecture with bottom-center "TAKE ACTION" hub
 * - 3 inner radial sectors: Rescue (911 & 143), Hazmat & Fire, Local & Ops
 * - Expanding outer fan petals displaying formatted Philippine national emergency hotlines
 * - Instant one-tap dialing via native phone dialer with haptic feedback
 */

import React, { useState, useRef, useEffect } from 'react';
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

// Dial Configuration Math & Dimensions
const STAGE_WIDTH = 340;
const STAGE_HEIGHT = 175;
const ORIGIN_X = 170;
const ORIGIN_Y = 170;

const R_INNER = 82;
const R_OUTER = 138;

const INNER_W = 78;
const INNER_H = 48;
const PETAL_W = 74;
const PETAL_H = 50;

// 3 Core Radial Sectors & Their 2 Expanding Outer Fan Petals
const ACTION_SECTORS = [
  {
    id: 'rescue',
    label: 'Rescue',
    subLabel: '911 & 143',
    icon: 'shield-alert-outline',
    accentColor: COLORS.danger, // #EF4444
    angle: -45,
    petals: [
      {
        id: 'rescue_911',
        name: 'National Emergency 911',
        shortName: 'National Rescue',
        displayPhone: '911',
        phone: '911',
        categoryLabel: 'NATIONAL RESCUE',
        icon: 'phone-alert',
        angle: -62,
        desc: 'Primary 24/7 nationwide emergency command for rapid police, fire, and multi-agency response.',
      },
      {
        id: 'red_cross_143',
        name: 'Philippine Red Cross',
        shortName: 'Red Cross 143',
        displayPhone: '143',
        phone: '143',
        categoryLabel: 'AMBULANCE / OXYGEN',
        icon: 'ambulance',
        angle: -28,
        desc: '24/7 emergency medical ambulance dispatch and portable oxygen therapy for gas victims.',
      },
    ],
  },
  {
    id: 'hazmat',
    label: 'Hazmat',
    subLabel: 'BFP & Poison',
    icon: 'fire-alert',
    accentColor: COLORS.warning, // #F59E0B
    angle: 0,
    petals: [
      {
        id: 'bfp_hazmat',
        name: 'BFP Hazmat & Fire',
        shortName: 'BFP Hazmat',
        displayPhone: '(02) 8426-0219',
        phone: '0284260219',
        categoryLabel: 'FIRE & HAZMAT',
        icon: 'fire-truck',
        angle: -17,
        desc: 'Specialized chemical response unit equipped for combustible LPG and gas leak suppression.',
      },
      {
        id: 'pgh_poison',
        name: 'UP-PGH Poison Control',
        shortName: 'Poison Control',
        displayPhone: '(02) 8524-1078',
        phone: '0285241078',
        categoryLabel: 'TOXICOLOGY / CO',
        icon: 'skull-crossbones',
        angle: 17,
        desc: 'National toxicologists for Carbon Monoxide asphyxiation and toxic vapor inhalation care.',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Local & Ops',
    subLabel: 'Marshal & NDRRMC',
    icon: 'account-hard-hat',
    accentColor: '#3B82F6', // Blue
    angle: 45,
    petals: [
      {
        id: 'safety_marshal',
        name: 'Safety Marshal',
        shortName: 'Site Marshal',
        displayPhone: '0917-123-4567',
        phone: '09171234567',
        categoryLabel: 'ON-SITE MARSHAL',
        icon: 'badge-account-alert',
        angle: 28,
        desc: 'Direct line to your designated on-site building floor warden and muster evacuation lead.',
      },
      {
        id: 'ndrrmc',
        name: 'NDRRMC Disaster Ops',
        shortName: 'NDRRMC Ops',
        displayPhone: '(02) 8911-1406',
        phone: '0289111406',
        categoryLabel: 'CIVIL DEFENSE',
        icon: 'bullhorn',
        angle: 62,
        desc: 'National disaster management and community civil defense coordination.',
      },
    ],
  },
];

export default function HotlineWheel() {
  const [activeSectorIdx, setActiveSectorIdx] = useState(0);
  const [selectedPetalId, setSelectedPetalId] = useState('rescue_911');

  // Animation values for smooth radial fan spring transitions
  const fanAnim = useRef(new Animated.Value(1)).current;
  const hubPulse = useRef(new Animated.Value(1)).current;

  const currentSector = ACTION_SECTORS[activeSectorIdx] || ACTION_SECTORS[0];
  const activePetal =
    currentSector.petals.find((p) => p.id === selectedPetalId) ||
    currentSector.petals[0];

  const handleSelectSector = (idx) => {
    HapticService.triggerTap();
    setActiveSectorIdx(idx);
    setSelectedPetalId(ACTION_SECTORS[idx].petals[0].id);

    // Spring animation for outer fan expansion
    fanAnim.setValue(0.7);
    Animated.spring(fanAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectPetal = (petal) => {
    HapticService.triggerTap();
    setSelectedPetalId(petal.id);
  };

  const handleCall = (phoneNumber) => {
    HapticService.triggerTap();
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleTakeAction = () => {
    // Pulse animation on the center hub
    Animated.sequence([
      Animated.timing(hubPulse, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(hubPulse, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (activePetal) {
      handleCall(activePetal.phone);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.headerIconBadge}>
            <MaterialCommunityIcons name="compass-outline" size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Emergency Action Dial</Text>
            <Text style={styles.sectionSubtitle}>
              Radial micro-interaction • Tap sector or petals to dial
            </Text>
          </View>
        </View>

        <View style={styles.categoryPill}>
          <Text style={[styles.categoryPillText, { color: currentSector.accentColor }]}>
            {currentSector.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Semicircular Action Dial Stage */}
      <View style={styles.stageCard}>
        <View style={styles.dialStage}>
          {/* Background Track Arcs */}
          <View style={styles.outerTrackArc} />
          <View style={styles.innerTrackArc} />

          {/* Expanding Outer Fan Petals (Animated Micro-Interaction) */}
          <Animated.View
            style={[
              styles.fanContainer,
              {
                opacity: fanAnim,
                transform: [{ scale: fanAnim }],
              },
            ]}
          >
            {currentSector.petals.map((petal) => {
              const rad = (petal.angle * Math.PI) / 180;
              const posX = ORIGIN_X + R_OUTER * Math.sin(rad) - PETAL_W / 2;
              const posY = ORIGIN_Y - R_OUTER * Math.cos(rad) - PETAL_H / 2;
              const isSelected = petal.id === selectedPetalId;

              return (
                <TouchableOpacity
                  key={petal.id}
                  activeOpacity={0.75}
                  onPress={() => handleSelectPetal(petal)}
                  style={[
                    styles.petalCard,
                    {
                      left: posX,
                      top: posY,
                      transform: [{ rotate: `${petal.angle}deg` }],
                      borderColor: isSelected ? currentSector.accentColor : 'rgba(255, 255, 255, 0.12)',
                      backgroundColor: isSelected ? '#1E293B' : '#0F172A',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={petal.icon}
                    size={15}
                    color={isSelected ? currentSector.accentColor : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.petalNumberText,
                      isSelected && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                    numberOfLines={1}
                  >
                    {petal.displayPhone}
                  </Text>
                  <Text style={styles.petalShortLabel} numberOfLines={1}>
                    {petal.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          {/* Inner Ring: 3 Core Radial Sectors */}
          {ACTION_SECTORS.map((sector, idx) => {
            const rad = (sector.angle * Math.PI) / 180;
            const posX = ORIGIN_X + R_INNER * Math.sin(rad) - INNER_W / 2;
            const posY = ORIGIN_Y - R_INNER * Math.cos(rad) - INNER_H / 2;
            const isActive = idx === activeSectorIdx;

            return (
              <TouchableOpacity
                key={sector.id}
                activeOpacity={0.8}
                onPress={() => handleSelectSector(idx)}
                style={[
                  styles.innerSectorCard,
                  {
                    left: posX,
                    top: posY,
                    transform: [{ rotate: `${sector.angle}deg` }],
                    borderColor: isActive ? sector.accentColor : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: isActive ? '#1E293B' : '#141E33',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={sector.icon}
                  size={15}
                  color={isActive ? sector.accentColor : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.innerSectorTitle,
                    isActive && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {sector.label}
                </Text>
                <Text style={styles.innerSectorSub} numberOfLines={1}>
                  {sector.subLabel}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Center Hub: Semicircular "TAKE ACTION" Button */}
          <Animated.View
            style={[
              styles.centerHubWrap,
              { transform: [{ scale: hubPulse }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleTakeAction}
              style={[
                styles.centerHubButton,
                { borderTopColor: currentSector.accentColor },
              ]}
            >
              <View style={styles.hubBeaconDot} />
              <Text style={styles.centerHubText}>TAKE ACTION</Text>
              <Text style={styles.centerHubSubText}>TAP TO DIAL</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Selected Hotline Detailed Action Card */}
        {activePetal && (
          <View style={styles.actionDetailCard}>
            <View style={styles.detailMetaRow}>
              <View style={styles.detailTitleGroup}>
                <View
                  style={[
                    styles.detailIconCircle,
                    { backgroundColor: `${currentSector.accentColor}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={activePetal.icon}
                    size={16}
                    color={currentSector.accentColor}
                  />
                </View>
                <View>
                  <Text style={styles.detailNameText}>{activePetal.name}</Text>
                  <Text style={styles.detailCategoryText}>
                    {activePetal.categoryLabel}
                  </Text>
                </View>
              </View>

              {/* Formatted Number Display */}
              <View style={styles.detailNumberPill}>
                <Text style={styles.detailNumberText}>
                  {activePetal.displayPhone}
                </Text>
              </View>
            </View>

            <Text style={styles.detailDescText}>{activePetal.desc}</Text>

            {/* Direct Call Button */}
            <TouchableOpacity
              style={[
                styles.directCallBtn,
                { backgroundColor: currentSector.accentColor },
              ]}
              activeOpacity={0.8}
              onPress={() => handleCall(activePetal.phone)}
            >
              <MaterialCommunityIcons name="phone" size={16} color="#FFFFFF" />
              <Text style={styles.directCallBtnText}>
                CALL {activePetal.displayPhone}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBadge: {
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryPillText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  stageCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    paddingTop: 12,
  },
  dialStage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    alignSelf: 'center',
    position: 'relative',
  },
  outerTrackArc: {
    position: 'absolute',
    left: ORIGIN_X - 138,
    top: ORIGIN_Y - 138,
    width: 276,
    height: 138,
    borderTopLeftRadius: 138,
    borderTopRightRadius: 138,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: 0,
  },
  innerTrackArc: {
    position: 'absolute',
    left: ORIGIN_X - 82,
    top: ORIGIN_Y - 82,
    width: 164,
    height: 82,
    borderTopLeftRadius: 82,
    borderTopRightRadius: 82,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 0,
  },
  fanContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  petalCard: {
    position: 'absolute',
    width: PETAL_W,
    height: PETAL_H,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  petalNumberText: {
    fontFamily: FONTS.mono,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  petalShortLabel: {
    fontFamily: FONTS.sans,
    fontSize: 8.5,
    color: COLORS.textSecondary,
  },
  innerSectorCard: {
    position: 'absolute',
    width: INNER_W,
    height: INNER_H,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  innerSectorTitle: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  innerSectorSub: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    color: COLORS.textMuted,
  },
  centerHubWrap: {
    position: 'absolute',
    left: ORIGIN_X - 52,
    bottom: 0,
    width: 104,
    height: 52,
  },
  centerHubButton: {
    width: 104,
    height: 52,
    borderTopLeftRadius: 52,
    borderTopRightRadius: 52,
    backgroundColor: '#0B1120',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  hubBeaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    marginBottom: 3,
  },
  centerHubText: {
    fontFamily: FONTS.sans,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  centerHubSubText: {
    fontFamily: FONTS.mono,
    fontSize: 7.5,
    color: COLORS.textMuted,
  },
  actionDetailCard: {
    margin: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailNameText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailCategoryText: {
    fontFamily: FONTS.mono,
    fontSize: 9.5,
    color: COLORS.textSecondary,
  },
  detailNumberPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailNumberText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailDescText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  directCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  directCallBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
