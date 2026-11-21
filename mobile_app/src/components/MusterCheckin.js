/*
 * AeroSense Mobile App - MusterCheckin Component
 * Facilitates simple headcount and safety confirmation at outdoor assembly points.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export default function MusterCheckin({ isEmergency }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  const handleCheckIn = () => {
    setCheckedIn(true);
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <View style={[styles.container, isEmergency && styles.emergencyContainer]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons
            name="account-check-outline"
            size={18}
            color={checkedIn ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={styles.cardTitle}>Assembly Point Check-In</Text>
        </View>
        <Text style={[styles.statusBadge, { color: checkedIn ? COLORS.primary : COLORS.warning }]}>
          {checkedIn ? 'Confirmed Safe' : 'Pending'}
        </Text>
      </View>

      <Text style={styles.description}>
        {checkedIn
          ? `You checked in as safe at ${checkInTime}.`
          : 'Once you reach the outdoor assembly point, confirm that you are safe.'}
      </Text>

      <TouchableOpacity
        style={[styles.checkInButton, checkedIn ? styles.checkedInButton : styles.activeButton]}
        activeOpacity={0.8}
        onPress={handleCheckIn}
        disabled={checkedIn}
      >
        <MaterialCommunityIcons
          name={checkedIn ? 'check' : 'account-check'}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.buttonText}>
          {checkedIn ? 'Checked In' : "I'm Safe at Assembly Point"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  emergencyContainer: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  checkedInButton: {
    backgroundColor: COLORS.surfaceElevated,
  },
  buttonText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
