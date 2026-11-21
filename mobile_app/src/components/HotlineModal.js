/*
 * AeroSense Mobile App - HotlineModal Component
 * Refined Emergency Hotlines Directory Sheet:
 * - Zero text truncation: all titles, agencies, and descriptions wrap naturally
 * - Clean vertical hierarchy preventing badge and title overlaps
 * - High-contrast, easily visible scrollable filter chips
 * - Direct one-tap dialing to all verified Philippine national emergency contacts
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { EMERGENCY_CONTACTS } from '../constants/protocols';
import HapticService from '../services/HapticService';
import { useTextScale } from '../services/TextScaleContext';

const CATEGORIES = [
  { id: 'ALL', label: 'All Hotlines' },
  { id: 'PRIMARY', label: 'National 911' },
  { id: 'FIRE_HAZMAT', label: 'Fire & Hazmat' },
  { id: 'MEDICAL', label: 'Ambulance' },
  { id: 'POISON', label: 'Poison Control' },
  { id: 'LOCAL', label: 'Local & Ops' },
];

export default function HotlineModal({ visible, onClose }) {
  const { scaleText } = useTextScale();
  const fs = scaleText || ((s) => s);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const handleCall = (phoneNumber) => {
    HapticService.triggerTap();
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const filteredContacts =
    selectedCategory === 'ALL'
      ? EMERGENCY_CONTACTS
      : EMERGENCY_CONTACTS.filter(
          (c) =>
            c.category === selectedCategory ||
            (selectedCategory === 'LOCAL' && c.category === 'DISASTER')
        );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.sheetContainer}>
            {/* Top Drag Indicator */}
            <View style={styles.dragHandle} />

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.headerIconCircle}>
                  <MaterialCommunityIcons name="phone-alert" size={20} color={COLORS.danger} />
                </View>
                <View style={styles.headerTextGroup}>
                  <Text style={[styles.sheetTitle, { fontSize: fs(17) }]}>Emergency Hotlines</Text>
                  <Text style={[styles.sheetSubtitle, { fontSize: fs(12) }]}>
                    Official verified Philippine emergency numbers
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  HapticService.triggerTap();
                  if (onClose) onClose();
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close Emergency Hotlines"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Priority Speed-Dial Buttons (911 & 143) */}
            <View style={styles.speedDialRow}>
              <TouchableOpacity
                style={[styles.speedDialBtn, styles.speedDial911]}
                activeOpacity={0.8}
                onPress={() => handleCall('911')}
              >
                <View style={[styles.speedDialIconBox, styles.speedDialIconBox911]}>
                  <MaterialCommunityIcons name="phone" size={17} color="#FCA5A5" />
                </View>
                <View style={styles.speedDialTextCol}>
                  <Text style={[styles.speedDialNumber, { fontSize: fs(15), color: '#FCA5A5' }]}>911</Text>
                  <Text style={[styles.speedDialLabel, { fontSize: fs(10.5) }]}>National Command</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.speedDialBtn, styles.speedDial143]}
                activeOpacity={0.8}
                onPress={() => handleCall('143')}
              >
                <View style={[styles.speedDialIconBox, styles.speedDialIconBox143]}>
                  <MaterialCommunityIcons name="ambulance" size={17} color="#FDA4AF" />
                </View>
                <View style={styles.speedDialTextCol}>
                  <Text style={[styles.speedDialNumber, { fontSize: fs(15), color: '#FDA4AF' }]}>143</Text>
                  <Text style={[styles.speedDialLabel, { fontSize: fs(10.5) }]}>Red Cross Ambulance</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* High-Contrast Horizontal Filter Chips */}
            <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        isActive ? styles.filterChipActive : styles.filterChipInactive,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => {
                        HapticService.triggerTap();
                        setSelectedCategory(cat.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                          { fontSize: fs(12) },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Scrollable Verified Contacts List (No text truncation, zero overlap) */}
            <ScrollView
              style={styles.contactsScroll}
              contentContainerStyle={styles.contactsScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredContacts.map((contact) => (
                <View key={contact.id} style={styles.contactCard}>
                  {/* Top Row: Icon + Category Badge Pill */}
                  <View style={styles.cardHeaderTop}>
                    <View
                      style={[
                        styles.contactIconWrap,
                        { backgroundColor: `${contact.badgeColor || COLORS.danger}22` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={contact.icon}
                        size={18}
                        color={contact.badgeColor || COLORS.danger}
                      />
                    </View>

                    <View
                      style={[
                        styles.contactBadgePill,
                        {
                          borderColor: `${contact.badgeColor || COLORS.border}80`,
                          backgroundColor: `${contact.badgeColor || COLORS.border}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.contactBadgeText,
                          { color: contact.badgeColor || '#FFFFFF', fontSize: fs(9.5) },
                        ]}
                      >
                        {contact.categoryLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Agency - Natural Wrap Without Any Truncation */}
                  <View style={styles.titleWrapper}>
                    <Text style={[styles.contactNameText, { fontSize: fs(14) }]}>
                      {contact.name}
                    </Text>
                    <Text style={[styles.contactAgencyText, { fontSize: fs(11.5) }]}>
                      {contact.agency}
                    </Text>
                  </View>

                  {/* Practical Description - High Contrast & Natural Wrap */}
                  <Text style={[styles.contactDescText, { fontSize: fs(11.5) }]}>
                    {contact.description}
                  </Text>

                  {/* Bottom Dial Row */}
                  <View style={styles.contactDialRow}>
                    <View style={styles.numberBox}>
                      <Text
                        style={[
                          styles.numberDisplay,
                          { fontSize: fs(13), color: contact.badgeColor || COLORS.primary },
                        ]}
                      >
                        {contact.displayPhone}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.cardCallButton,
                        { backgroundColor: contact.badgeColor || COLORS.danger },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleCall(contact.phone)}
                    >
                      <MaterialCommunityIcons name="phone" size={15} color="#FFFFFF" />
                      <Text style={[styles.cardCallButtonText, { fontSize: fs(12.5) }]}>CALL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Footer Notice */}
              <View style={styles.sheetFooter}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={15}
                  color={COLORS.primary}
                />
                <Text style={styles.sheetFooterText}>
                  All numbers verified by official Philippine national services and operable 24/7.
                </Text>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.78)',
    justifyContent: 'flex-end',
  },
  modalSafeArea: {
    maxHeight: '92%',
  },
  sheetContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxHeight: '100%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  sheetTitle: {
    fontFamily: FONTS.sans,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sheetSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Priority Speed-Dial Buttons (911 & 143)
  speedDialRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  speedDialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  speedDial911: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.32)',
  },
  speedDial143: {
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.32)',
  },
  speedDialIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedDialIconBox911: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
  speedDialIconBox143: {
    backgroundColor: 'rgba(225, 29, 72, 0.18)',
  },
  speedDialTextCol: {
    flex: 1,
  },
  speedDialNumber: {
    fontFamily: FONTS.mono,
    fontSize: 15,
    fontWeight: '800',
  },
  speedDialLabel: {
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    flexWrap: 'wrap',
  },

  // Filter Chips Section (High contrast, clearly visible text)
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 4,
  },
  filterChipScroll: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipInactive: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // Contacts Directory List
  contactsScroll: {
    paddingHorizontal: 18,
  },
  contactsScrollContent: {
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  contactBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  titleWrapper: {
    marginBottom: 6,
  },
  contactNameText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flexWrap: 'wrap',
    lineHeight: 19,
  },
  contactAgencyText: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    color: '#94A3B8',
    flexWrap: 'wrap',
    marginTop: 2,
    lineHeight: 16,
  },
  contactDescText: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    color: '#CBD5E1', // High contrast light slate
    lineHeight: 17,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  contactDialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  numberBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  numberDisplay: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    flexWrap: 'wrap',
  },
  cardCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardCallButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 8,
  },
  sheetFooterText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});
