/*
 * AeroSense Mobile Application - Root Entry Point
 * Designed for offline-first multi-gas leak detection & life-safety evacuation handling.
 * Features a simple, natural user interface with occupant safety roll call and mobile presence.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from './src/constants/colors';
import { FONTS } from './src/constants/fonts';
import Header from './src/components/Header';
import StatusHalo from './src/components/StatusHalo';
import TelemetryCard from './src/components/TelemetryCard';
import EvacuationModal from './src/components/EvacuationModal';
import SettingsModal from './src/components/SettingsModal';
import OccupantRoster from './src/components/OccupantRoster';
import HotlineModal from './src/components/HotlineModal';
import TelemetryService from './src/services/TelemetryService';
import VoiceService from './src/services/VoiceService';
import HapticService from './src/services/HapticService';
import { TextScaleProvider } from './src/services/TextScaleContext';

export default function App() {
  const [telemetry, setTelemetry] = useState(TelemetryService.currentData);
  const [isEmergencyDismissed, setIsEmergencyDismissed] = useState(false);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [hotlinesVisible, setHotlinesVisible] = useState(false);
  const [inputIp, setInputIp] = useState(TelemetryService.deviceIp);
  const [textScale, setTextScale] = useState(1.0);

  useEffect(() => {
    const unsubscribe = TelemetryService.subscribe((updatedData) => {
      setTelemetry({ ...updatedData });

      if (updatedData?.alert?.level !== 2) {
        setIsEmergencyDismissed(false);
      }
      if (updatedData?.alert?.level === 0) {
        setIsWarningDismissed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleSimulation = (forcedVal) => {
    HapticService.triggerTap();
    setIsEmergencyDismissed(false);
    setIsWarningDismissed(false);
    const targetState = forcedVal !== undefined ? forcedVal : !telemetry.simulation;
    const isNowSimulating = TelemetryService.toggleSimulation(targetState);

    // Synchronously update telemetry state
    setTelemetry({ ...TelemetryService.currentData });

    // If simulation was turned OFF, silence all audio and alarms immediately
    if (!isNowSimulating) {
      VoiceService.stop();
      HapticService.stopAlarm();
    }
  };

  const handleTestAlertSystem = () => {
    HapticService.triggerTap();
    HapticService.triggerAdvisory();
    VoiceService.speakOnce('AeroSense alarm test complete. Speakers and sensors are working.');
  };

  const handleSaveIp = (ipToSet) => {
    HapticService.triggerTap();
    const target = ipToSet || inputIp;
    setInputIp(target);
    TelemetryService.setDeviceIp(target);
    setSettingsVisible(false);
  };

  const sensors = telemetry?.sensors || {};
  const alertInfo = telemetry?.alert || { level: 0, gas: 'NORMAL' };

  const peakPpm = Math.max(
    sensors.flammable_ppm || 0,
    sensors.h2_ppm || 0,
    sensors.co_ppm || 0
  );

  const isWarning = alertInfo.level === 1;
  const isCritical = alertInfo.level === 2;
  const showModal = isCritical && !isEmergencyDismissed;

  const risingGasName =
    alertInfo.gas === 'CARBON_MONOXIDE' || (sensors.co_ppm || 0) >= 25
      ? 'Carbon Monoxide (CO)'
      : alertInfo.gas === 'HYDROGEN' || (sensors.h2_ppm || 0) >= 400
      ? 'Hydrogen Gas (H2)'
      : 'Flammable Gas / LPG';

  const risingGasPpm =
    alertInfo.gas === 'CARBON_MONOXIDE' || (sensors.co_ppm || 0) >= 25
      ? (sensors.co_ppm || 0).toFixed(1)
      : alertInfo.gas === 'HYDROGEN' || (sensors.h2_ppm || 0) >= 400
      ? (sensors.h2_ppm || 0).toFixed(1)
      : (sensors.flammable_ppm || 0).toFixed(1);

  const risingGasThreshold =
    alertInfo.gas === 'CARBON_MONOXIDE' || (sensors.co_ppm || 0) >= 25
      ? '25 PPM'
      : alertInfo.gas === 'HYDROGEN' || (sensors.h2_ppm || 0) >= 400
      ? '400 PPM'
      : '200 PPM';

  const fs = (size) => Math.round(size * textScale);

  return (
    <TextScaleProvider value={{ textScale, setTextScale }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Top Header Bar */}
      <Header
        telemetry={telemetry}
        onOpenSettings={() => setSettingsVisible(true)}
        onOpenHotlines={() => setHotlinesVisible(true)}
      />

      {/* Active Simulation Notice Banner */}
      {telemetry.simulation && (
        <TouchableOpacity
          style={styles.simActiveBanner}
          activeOpacity={0.8}
          onPress={() => setSettingsVisible(true)}
        >
          <MaterialCommunityIcons name="flask-outline" size={15} color={COLORS.warning} />
          <Text style={[styles.simActiveBannerText, { fontSize: fs(12) }]}>
            Simulation in Progress • Tap to open controls
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.warning} />
        </TouchableOpacity>
      )}

      {/* Rising Threshold Advisory Warning Ribbon (Top Placement) */}
      {isWarning && !isWarningDismissed && (
        <View style={styles.thresholdWarningBanner}>
          <View style={styles.warningIconGroup}>
            <View style={styles.warningPulseBadge}>
              <MaterialCommunityIcons name="alert-outline" size={16} color={COLORS.warning} />
            </View>
          </View>
          <View style={styles.warningTextGroup}>
            <View style={styles.warningTitleRow}>
              <Text style={[styles.warningHeadline, { fontSize: fs(12) }]}>
                THRESHOLD RISING: {risingGasName.toUpperCase()}
              </Text>
              <Text style={[styles.warningPpmTag, { fontSize: fs(10.5) }]}>
                {risingGasPpm} PPM
              </Text>
            </View>
            <Text style={[styles.warningDirective, { fontSize: fs(11) }]}>
              Caution: Level exceeded {risingGasThreshold} warning threshold. Open windows and ventilate area.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.warningDismissBtn}
            onPress={() => {
              HapticService.triggerTap();
              setIsWarningDismissed(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Acknowledge warning"
          >
            <MaterialCommunityIcons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sticky Banner if Emergency is active but modal was dismissed */}
      {isCritical && isEmergencyDismissed && (
        <TouchableOpacity
          style={styles.stickyAlertBanner}
          activeOpacity={0.8}
          onPress={() => {
            HapticService.triggerTap();
            setIsEmergencyDismissed(false);
          }}
        >
          <MaterialCommunityIcons name="alert" size={16} color="#FFFFFF" />
          <Text style={[styles.stickyAlertText, { fontSize: fs(12) }]}>
            Gas Alert Active • Tap for safety instructions
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Focal Centerpiece: Authoritative Air Quality Status Hero */}
        <StatusHalo
          alertLevel={alertInfo.level}
          peakPpm={peakPpm}
        />

        {/* Universal Group / Household Occupant Roll Call */}
        <OccupantRoster
          isEmergency={isCritical}
          alertLevel={alertInfo.level}
          isSimulating={telemetry.simulation}
        />

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: fs(15) }]}>Gas Levels</Text>
          <Text style={[styles.sectionSubtitle, { fontSize: fs(12) }]}>
            Live readings from ceiling sensor
          </Text>
        </View>

        {/* Sensor 1: Cooking Gas / Methane / LPG (MQ-2) */}
        <TelemetryCard
          sensorName="Cooking Gas (LPG & Methane)"
          sensorModel="Sensor MQ-2"
          chemicalFormula="CH4 / LPG"
          iconName="fire"
          ppm={sensors.flammable_ppm || 0}
          warningThreshold={200}
          criticalThreshold={400}
          extraNote="Heavier & lighter mixes"
        />

        {/* Sensor 2: Hydrogen Gas (MQ-8) */}
        <TelemetryCard
          sensorName="Hydrogen Gas"
          sensorModel="Sensor MQ-8"
          chemicalFormula="H2 Plume"
          iconName="atom"
          ppm={sensors.h2_ppm || 0}
          warningThreshold={400}
          criticalThreshold={800}
          extraNote="Rises quickly to ceiling"
        />

        {/* Sensor 3: Carbon Monoxide (MQ-7) */}
        <TelemetryCard
          sensorName="Carbon Monoxide"
          sensorModel="Sensor MQ-7"
          chemicalFormula="CO Toxic Gas"
          iconName="gas-cylinder"
          ppm={sensors.co_ppm || 0}
          warningThreshold={25}
          criticalThreshold={50}
          extraNote="Colorless & odorless"
        />
      </ScrollView>

      {/* Settings & Controls Sheet */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isSimulating={telemetry.simulation}
        onToggleSimulation={handleToggleSimulation}
        onTestAudio={handleTestAlertSystem}
        deviceIp={inputIp}
        onSaveIp={handleSaveIp}
        hardwareLinked={telemetry.hardware_linked}
        pingMs={telemetry.ping_ms}
        textScale={textScale}
        onChangeTextScale={setTextScale}
      />

      {/* Emergency Hotlines Directory Sheet (Top Header Quick Access) */}
      <HotlineModal
        visible={hotlinesVisible}
        onClose={() => setHotlinesVisible(false)}
      />

      {/* Emergency Evacuation Screen */}
      <EvacuationModal
        visible={showModal}
        detectedGas={alertInfo.gas}
        peakPpm={peakPpm}
        zoneName={telemetry.zone}
        onDismiss={() => {
          setIsEmergencyDismissed(true);
        }}
      />
    </SafeAreaView>
  </TextScaleProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 4 : 0,
  },
  simActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  simActiveBannerText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  thresholdWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  warningIconGroup: {
    paddingTop: 1,
  },
  warningPulseBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTextGroup: {
    flex: 1,
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  warningHeadline: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.warning,
    flex: 1,
  },
  warningPpmTag: {
    fontFamily: FONTS.mono,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FCD34D',
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningDirective: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '500',
    color: '#E2E8F0',
    marginTop: 2,
    lineHeight: 15,
  },
  warningDismissBtn: {
    paddingTop: 2,
    paddingLeft: 4,
  },
  stickyAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  stickyAlertText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
