/*
 * AeroSense Mobile App - EvacuationModal Component
 * Natural, clear emergency evacuation screen with life-safety instructions,
 * group occupant roll call, categorized national emergency hotlines, and alarm silence control.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { EVACUATION_PROTOCOLS, EMERGENCY_CONTACTS } from '../constants/protocols';
import OccupantRoster from './OccupantRoster';
import VoiceService from '../services/VoiceService';
import HapticService from '../services/HapticService';

export default function EvacuationModal({
  visible,
  detectedGas,
  peakPpm,
  zoneName,
  onDismiss,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [contactFilter, setContactFilter] = useState('ALL');

  const protocol =
    EVACUATION_PROTOCOLS[detectedGas] || EVACUATION_PROTOCOLS.FLAMMABLE_GAS;

  // Manage Haptic Vibration & Continuous Looping Voice-Over
  useEffect(() => {
    if (visible && !isMuted) {
      HapticService.startCriticalAlarm();
      VoiceService.startLooping(protocol.voiceText);
    } else {
      HapticService.stopAlarm();
      VoiceService.stop();
    }

    return () => {
      HapticService.stopAlarm();
      VoiceService.stop();
    };
  }, [visible, isMuted, detectedGas]);

  const handleToggleMute = () => {
    HapticService.triggerTap();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      HapticService.stopAlarm();
      VoiceService.stop();
    } else {
      HapticService.startCriticalAlarm();
      VoiceService.startLooping(protocol.voiceText);
    }
  };

  const handleCall = (phoneNumber) => {
    HapticService.triggerTap();
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDismiss = () => {
    HapticService.triggerTap();
    HapticService.stopAlarm();
    VoiceService.stop();
    if (onDismiss) onDismiss();
  };

  // Filter contacts by category
  const filteredContacts = EMERGENCY_CONTACTS.filter((contact) => {
    if (contactFilter === 'ALL') return true;
    if (contactFilter === 'FIRE') return contact.category === 'PRIMARY' || contact.category === 'FIRE_HAZMAT';
    if (contactFilter === 'MEDICAL') return contact.category === 'MEDICAL' || contact.category === 'POISON';
    if (contactFilter === 'LOCAL') return contact.category === 'LOCAL' || contact.category === 'DISASTER';
    return true;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleDismiss}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textPrimary} />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>

          <View style={styles.hazardBadge}>
            <Text style={styles.hazardBadgeText}>Active Alert</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Emergency Hero Card */}
          <View style={styles.heroAlertCard}>
            <View style={styles.heroHeaderRow}>
              <View style={styles.alertPill}>
                <MaterialCommunityIcons name="alert" size={15} color="#FFFFFF" />
                <Text style={styles.alertPillText}>Emergency</Text>
              </View>
              <Text style={styles.zoneText}>{zoneName || 'Ceiling Sensor Unit'}</Text>
            </View>

            <Text style={styles.protocolTitle}>{protocol.title}</Text>

            <View style={styles.readingBox}>
              <Text style={styles.ppmValue}>{(peakPpm || 0).toFixed(0)}</Text>
              <View style={styles.readingMeta}>
                <Text style={styles.ppmLabel}>PPM</Text>
                <Text style={styles.ppmSub}>Hazardous concentration</Text>
              </View>
            </View>

            <Text style={styles.instructionBanner}>
              Please follow the instructions below and leave the building immediately.
            </Text>
          </View>

          {/* Occupant Roll Call (Integrated directly into Evacuation) */}
          <OccupantRoster isEmergency={true} alertLevel={2} isSimulating={true} />

          {/* Life-Safety Instructions */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>What to do right now</Text>

            {protocol.rules.map((rule) => (
              <View key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleIconCircle}>
                  <MaterialCommunityIcons name={rule.icon} size={20} color={COLORS.danger} />
                </View>
                <View style={styles.ruleBody}>
                  <Text style={styles.ruleTitle}>{rule.label}</Text>
                  <Text style={styles.ruleDescription}>{rule.subtext}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Official National Emergency Hotlines (Organized & Maintained) */}
          <View style={styles.sectionBlock}>
            <View style={styles.contactsHeaderRow}>
              <Text style={styles.sectionTitle}>Emergency Dispatch Hotlines</Text>
              <Text style={styles.contactsSubtitle}>Official Philippine National Response</Text>
            </View>

            {/* Category Filter Chips */}
            <View style={styles.filterRow}>
              {[
                { id: 'ALL', label: 'All Services' },
                { id: 'FIRE', label: 'Fire & Hazmat' },
                { id: 'MEDICAL', label: 'Medical & Poison' },
                { id: 'LOCAL', label: 'Local & Ops' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    contactFilter === filter.id && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    HapticService.triggerTap();
                    setContactFilter(filter.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      contactFilter === filter.id && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtered Emergency Contacts List */}
            {filteredContacts.map((contact) => {
              const isRecommended =
                contact.recommendedFor && contact.recommendedFor.includes(detectedGas);

              return (
                <View
                  key={contact.id}
                  style={[
                    styles.contactCard,
                    isRecommended && styles.contactCardRecommended,
                  ]}
                >
                  <View style={styles.contactTopRow}>
                    <View style={styles.contactIconAndTitle}>
                      <View
                        style={[
                          styles.contactIconCircle,
                          { backgroundColor: `${contact.badgeColor || COLORS.danger}20` },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={contact.icon}
                          size={20}
                          color={contact.badgeColor || COLORS.textPrimary}
                        />
                      </View>
                      <View style={styles.contactTitleBlock}>
                        <View style={styles.contactNameRow}>
                          <Text style={styles.contactName} numberOfLines={1}>
                            {contact.name}
                          </Text>
                        </View>
                        <Text style={styles.contactAgency} numberOfLines={1}>
                          {contact.agency}
                        </Text>
                      </View>
                    </View>

                    {/* Category Label Pill */}
                    <View
                      style={[
                        styles.categoryPill,
                        { borderColor: `${contact.badgeColor || COLORS.border}50` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          { color: contact.badgeColor || COLORS.textSecondary },
                        ]}
                      >
                        {contact.categoryLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Incident Relevance Description */}
                  <Text style={styles.contactDesc}>{contact.description}</Text>

                  {/* Phone Number & Dial Button */}
                  <View style={styles.contactActionRow}>
                    <View style={styles.phoneGroup}>
                      <Text style={styles.phoneLabel}>HOTLINE</Text>
                      <Text style={styles.phoneNumber}>{contact.displayPhone}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.callButton}
                      activeOpacity={0.7}
                      onPress={() => handleCall(contact.phone)}
                    >
                      <MaterialCommunityIcons name="phone" size={15} color="#FFFFFF" />
                      <Text style={styles.callButtonText}>CALL NOW</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Single Alarm Silence Button */}
            <TouchableOpacity
              style={[styles.sirenButton, isMuted && styles.sirenButtonMuted]}
              activeOpacity={0.7}
              onPress={handleToggleMute}
            >
              <MaterialCommunityIcons
                name={isMuted ? 'volume-high' : 'volume-off'}
                size={18}
                color={isMuted ? COLORS.warning : COLORS.textPrimary}
              />
              <Text style={[styles.sirenButtonText, isMuted && { color: COLORS.warning }]}>
                {isMuted ? 'Alarm Silenced (Tap to Resume)' : 'Silence Alarm Sound'}
              </Text>
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  hazardBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hazardBadgeText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroAlertCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginBottom: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertPillText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  zoneText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  protocolTitle: {
    fontFamily: FONTS.sans,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 6,
  },
  readingBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  ppmValue: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.danger,
  },
  readingMeta: {
    flexDirection: 'column',
  },
  ppmLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ppmSub: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  instructionBanner: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactsHeaderRow: {
    marginBottom: 10,
  },
  contactsSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: COLORS.danger,
  },
  filterChipText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfaceCard,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    gap: 12,
  },
  ruleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleBody: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  ruleDescription: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  contactCard: {
    backgroundColor: COLORS.surfaceCard,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  contactCardRecommended: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  contactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactIconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 6,
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactTitleBlock: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactAgency: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryPillText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  contactDesc: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginVertical: 6,
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  phoneGroup: {
    flex: 1,
  },
  phoneLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  phoneNumber: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sirenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  sirenButtonMuted: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  sirenButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
