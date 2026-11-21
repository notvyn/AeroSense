/*
 * AeroSense Mobile App - QuickCallFab Component
 * Floating Emergency Call Action Button (FAB) and Full National Hotlines Sheet.
 * Persistently visible on the screen for instant one-tap access to all verified Philippine hotlines.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { EMERGENCY_CONTACTS } from '../constants/protocols';
import HapticService from '../services/HapticService';

const CATEGORIES = [
  { id: 'ALL', label: 'All Hotlines' },
  { id: 'PRIMARY', label: 'National' },
  { id: 'FIRE_HAZMAT', label: 'Fire & Hazmat' },
  { id: 'MEDICAL', label: 'Ambulance' },
  { id: 'POISON', label: 'Poison & CO' },
  { id: 'LOCAL', label: 'Local & Ops' },
];

export default function QuickCallFab() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Pulsing animation for the floating emergency call button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const handleOpen = () => {
    HapticService.triggerTap();
    setModalVisible(true);
  };

  const handleClose = () => {
    HapticService.triggerTap();
    setModalVisible(false);
  };

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
    <>
      {/* Floating Call Action Button (FAB) */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.fabOuterRing,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.85}
          onPress={handleOpen}
          accessibilityLabel="Emergency Hotlines Quick Call"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="phone-in-talk" size={24} color="#FFFFFF" />
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>SOS</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Verified National Emergency Hotlines Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.sheetContainer}>
              {/* Top Drag Indicator / Handle */}
              <View style={styles.dragHandle} />

              {/* Sheet Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.headerTitleGroup}>
                  <View style={styles.headerIconCircle}>
                    <MaterialCommunityIcons name="phone-alert" size={20} color={COLORS.danger} />
                  </View>
                  <View>
                    <Text style={styles.sheetTitle}>Emergency Hotlines</Text>
                    <Text style={styles.sheetSubtitle}>
                      Official verified Philippine emergency numbers
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Urgent Speed-Dial Highlights (911 & 143) */}
              <View style={styles.speedDialRow}>
                <TouchableOpacity
                  style={[styles.speedDialBtn, styles.speedDial911]}
                  activeOpacity={0.8}
                  onPress={() => handleCall('911')}
                >
                  <MaterialCommunityIcons name="phone" size={16} color="#FFFFFF" />
                  <View>
                    <Text style={styles.speedDialNumber}>911</Text>
                    <Text style={styles.speedDialLabel}>National Command</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.speedDialBtn, styles.speedDial143]}
                  activeOpacity={0.8}
                  onPress={() => handleCall('143')}
                >
                  <MaterialCommunityIcons name="ambulance" size={16} color="#FFFFFF" />
                  <View>
                    <Text style={styles.speedDialNumber}>143</Text>
                    <Text style={styles.speedDialLabel}>Red Cross Ambulance</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Category Filter Chips */}
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
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() => {
                        HapticService.triggerTap();
                        setSelectedCategory(cat.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Scrollable Directory of Verified Contacts */}
              <ScrollView
                style={styles.contactsScroll}
                contentContainerStyle={styles.contactsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredContacts.map((contact) => (
                  <View key={contact.id} style={styles.contactCard}>
                    <View style={styles.contactTopRow}>
                      <View style={styles.contactMetaGroup}>
                        <View
                          style={[
                            styles.contactIconWrap,
                            { backgroundColor: `${contact.badgeColor || COLORS.danger}20` },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={contact.icon}
                            size={18}
                            color={contact.badgeColor || COLORS.danger}
                          />
                        </View>
                        <View style={styles.contactTitleCol}>
                          <Text style={styles.contactNameText} numberOfLines={1}>
                            {contact.name}
                          </Text>
                          <Text style={styles.contactAgencyText} numberOfLines={1}>
                            {contact.agency}
                          </Text>
                        </View>
                      </View>

                      {/* Category Badge Pill */}
                      <View
                        style={[
                          styles.contactBadgePill,
                          { borderColor: `${contact.badgeColor || COLORS.border}60` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.contactBadgeText,
                            { color: contact.badgeColor || COLORS.textSecondary },
                          ]}
                        >
                          {contact.categoryLabel}
                        </Text>
                      </View>
                    </View>

                    {/* Description Guidance */}
                    <Text style={styles.contactDescText}>{contact.description}</Text>

                    {/* Bottom Dial Row */}
                    <View style={styles.contactDialRow}>
                      <View style={styles.numberBox}>
                        <Text style={styles.numberDisplay}>
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
                        <Text style={styles.cardCallButtonText}>CALL</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Footer Assurance Notice */}
                <View style={styles.sheetFooter}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.sheetFooterText}>
                    All hotlines verified by official Philippine government agencies and active 24/7.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // FAB Floating Button Styles
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fabOuterRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fabBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  fabBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal / Bottom Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSafeArea: {
    maxHeight: '90%',
  },
  sheetContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sheetSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: COLORS.danger,
  },
  speedDial143: {
    backgroundColor: '#DC2626',
  },
  speedDialNumber: {
    fontFamily: FONTS.mono,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  speedDialLabel: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Filter Chips
  filterChipScroll: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Contacts List
  contactsScroll: {
    paddingHorizontal: 18,
  },
  contactsScrollContent: {
    paddingTop: 4,
    paddingBottom: 24,
    gap: 10,
  },
  contactCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  contactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  contactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitleCol: {
    flex: 1,
  },
  contactNameText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactAgencyText: {
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    color: COLORS.textSecondary,
  },
  contactBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  contactBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 8.5,
    fontWeight: '700',
  },
  contactDescText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  contactDialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  numberBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  numberDisplay: {
    fontFamily: FONTS.mono,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 5,
  },
  cardCallButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
  },
  sheetFooterText: {
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
