/*
 * AeroSense Mobile App - SettingsModal Component
 * Simple, natural settings and controls hub.
 * Features:
 * - Text Enlarger for enhanced emergency readability
 * - Simulation controls & audio diagnostics
 * - Hardware IP setup for ceiling sensor unit
 * - Collapsible directory of official national emergency hotlines
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import HapticService from '../services/HapticService';
import { FONT_SCALE_OPTIONS, useTextScale } from '../services/TextScaleContext';

export default function SettingsModal({
  visible,
  onClose,
  isSimulating,
  onToggleSimulation,
  onTestAudio,
  deviceIp,
  onSaveIp,
  hardwareLinked,
  pingMs,
  textScale: propTextScale,
  onChangeTextScale: propOnChangeTextScale,
}) {
  const contextScale = useTextScale();
  const textScale = propTextScale !== undefined ? propTextScale : (contextScale?.textScale ?? 1.0);
  const setTextScale = propOnChangeTextScale || contextScale?.setTextScale;

  const fs = (size) => Math.round(size * textScale);

  const [currentIp, setCurrentIp] = useState(deviceIp || '192.168.43.100');

  useEffect(() => {
    if (deviceIp) {
      setCurrentIp(deviceIp);
    }
  }, [deviceIp]);

  const handleApplyIp = (ipToUse) => {
    HapticService.triggerTap();
    const finalIp = ipToUse || currentIp;
    setCurrentIp(finalIp);
    onSaveIp(finalIp);
  };

  const handleToggleSimulationState = () => {
    HapticService.triggerTap();
    onToggleSimulation(!isSimulating);
  };

  const handleSelectScale = (scaleValue) => {
    HapticService.triggerTap();
    if (setTextScale) {
      setTextScale(scaleValue);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <Text style={[styles.navTitle, { fontSize: fs(16) }]}>Settings & Controls</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              HapticService.triggerTap();
              onClose();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialCommunityIcons name="close" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECTION 1: DEMO SIMULATION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons
                  name="flask-outline"
                  size={20}
                  color={isSimulating ? COLORS.warning : COLORS.primary}
                />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={[styles.sectionTitle, { fontSize: fs(14) }]}>Alarm Simulation</Text>
                <Text style={[styles.sectionSubtitle, { fontSize: fs(11.5) }]}>
                  Test the emergency evacuation alarm and phone notifications without real gas.
                </Text>
              </View>
            </View>

            {/* Single Action Button (No duplicate switch) */}
            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                isSimulating ? styles.dangerActionButton : styles.emeraldActionButton,
              ]}
              activeOpacity={0.8}
              onPress={handleToggleSimulationState}
            >
              <MaterialCommunityIcons
                name={isSimulating ? 'stop-circle' : 'play-circle'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={[styles.primaryActionButtonText, { fontSize: fs(13) }]}>
                {isSimulating ? 'Stop Simulation' : 'Start Demo Simulation'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.statusHelperText, { fontSize: fs(11) }]}>
              {isSimulating
                ? 'Simulation is running. Gas levels will rise to test the emergency alert.'
                : 'Simulation is off. Normal sensor monitoring active.'}
            </Text>
          </View>

          {/* SECTION 2: AUDIO & HAPTIC TEST (Sound & Alarm Test) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons name="bell-ring-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={[styles.sectionTitle, { fontSize: fs(14) }]}>Sound & Alarm Test</Text>
                <Text style={[styles.sectionSubtitle, { fontSize: fs(11.5) }]}>
                  Check that your phone speaker, voice instructions, and vibration are working.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              activeOpacity={0.8}
              onPress={() => {
                HapticService.triggerTap();
                onTestAudio();
              }}
            >
              <MaterialCommunityIcons name="volume-high" size={18} color={COLORS.textPrimary} />
              <Text style={[styles.secondaryActionButtonText, { fontSize: fs(13) }]}>Test Alarm Sound</Text>
            </TouchableOpacity>
          </View>

          {/* SECTION 3: TEXT ENLARGER & READABILITY (PLACED UNDER SOUND & ALARM TEST) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <MaterialCommunityIcons name="format-size" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={[styles.sectionTitle, { fontSize: fs(14) }]}>Text Enlarger</Text>
                <Text style={[styles.sectionSubtitle, { fontSize: fs(11) }]}>
                  Adjust font size for emergency readability.
                </Text>
              </View>
            </View>

            {/* Scale Preset Pills (Clean 3-Preset Layout) */}
            <View style={styles.scalePresetsRow}>
              {FONT_SCALE_OPTIONS.map((opt) => {
                const isActive = Math.abs(textScale - opt.scale) < 0.05;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.scalePill, isActive && styles.scalePillActive]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectScale(opt.scale)}
                  >
                    <Text
                      style={[
                        styles.scalePillLabel,
                        isActive && styles.scalePillLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Text Preview Box */}
            <View style={styles.previewBox}>
              <Text style={[styles.previewHeadline, { fontSize: fs(13.5) }]}>
                CRITICAL HAZARD: Flammable Gas Leak
              </Text>
              <Text style={[styles.previewBody, { fontSize: fs(11) }]}>
                Evacuate premises immediately. Do not operate electrical switches.
              </Text>
            </View>
          </View>

          {/* SECTION 4: CEILING SENSOR HARDWARE CONNECTION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons
                  name={hardwareLinked ? 'wifi' : 'wifi-off'}
                  size={20}
                  color={hardwareLinked ? COLORS.primary : COLORS.warning}
                />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={[styles.sectionTitle, { fontSize: fs(14) }]}>Ceiling Sensor Device</Text>
                <Text style={[styles.sectionSubtitle, { fontSize: fs(11.5) }]}>
                  Connect the app to your physical ESP32 ceiling unit over Wi-Fi or mobile hotspot.
                </Text>
              </View>
            </View>

            {/* Connection Status Banner */}
            <View
              style={[
                styles.linkBanner,
                hardwareLinked ? styles.linkBannerConnected : styles.linkBannerOffline,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: hardwareLinked ? COLORS.primary : COLORS.warning },
                ]}
              />
              <Text
                style={[
                  styles.linkBannerText,
                  { color: hardwareLinked ? COLORS.primary : COLORS.warning, fontSize: fs(11.5) },
                ]}
              >
                {hardwareLinked
                  ? `Connected (${pingMs} ms)`
                  : 'Searching for sensor device on network'}
              </Text>
            </View>

            {/* IP Address Input */}
            <Text style={[styles.inputLabel, { fontSize: fs(11) }]}>Device IP Address</Text>
            <TextInput
              style={[styles.ipInput, { fontSize: fs(13) }]}
              value={currentIp}
              onChangeText={setCurrentIp}
              placeholder="e.g. 192.168.43.100"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Quick Presets */}
            <Text style={[styles.inputLabel, { fontSize: fs(11) }]}>Quick Presets</Text>
            <View style={styles.presetsRow}>
              {[
                { label: 'Hotspot', ip: '192.168.43.100' },
                { label: 'Direct AP', ip: '192.168.4.1' },
                { label: 'Home Wi-Fi', ip: '192.168.254.100' },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.ip}
                  style={[
                    styles.presetPill,
                    currentIp === preset.ip && styles.presetPillActive,
                  ]}
                  onPress={() => {
                    HapticService.triggerTap();
                    setCurrentIp(preset.ip);
                  }}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      currentIp === preset.ip && styles.presetPillTextActive,
                      { fontSize: fs(11) },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.8}
              onPress={() => handleApplyIp()}
            >
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
              <Text style={[styles.saveButtonText, { fontSize: fs(13) }]}>Connect Device</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 0,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  navTitle: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTextWrap: {
    flex: 1,
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
    lineHeight: 15,
    marginTop: 2,
  },
  /* Text Enlarger Styles */
  scalePresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  scalePill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scalePillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  scalePillLabel: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scalePillLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  previewBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 4,
  },
  previewMeta: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  previewHeadline: {
    fontFamily: FONTS.sans,
    fontWeight: '800',
    color: COLORS.danger,
    lineHeight: 18,
  },
  previewBody: {
    fontFamily: FONTS.sans,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  /* Existing Action Buttons */
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  emeraldActionButton: {
    backgroundColor: COLORS.primary,
  },
  dangerActionButton: {
    backgroundColor: COLORS.danger,
  },
  primaryActionButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  secondaryActionButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusHelperText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 15,
  },
  linkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  linkBannerConnected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  linkBannerOffline: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  linkBannerText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '600',
  },
  inputLabel: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  ipInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  presetPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  presetPillText: {
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  saveButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
