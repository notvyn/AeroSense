/*
 * AeroSense Mobile App - OccupantRoster Component
 * Dynamic mobile presence and group evacuation accountability.
 * Features a calm standby view during normal conditions,
 * and activates evacuation check-in controls when an emergency threshold is reached.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import OccupantService from '../services/OccupantService';
import HapticService from '../services/HapticService';
import { useTextScale } from '../services/TextScaleContext';

export default function OccupantRoster({ isEmergency, alertLevel, isSimulating }) {
  const { scaleText } = useTextScale();
  const fs = scaleText || ((s) => s);
  const [occupants, setOccupants] = useState(OccupantService.occupants);
  const [networkGroup, setNetworkGroup] = useState(OccupantService.networkGroup);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const unsubscribe = OccupantService.subscribe((list, net) => {
      setOccupants([...list]);
      if (net) setNetworkGroup({ ...net });
    });
    return () => unsubscribe();
  }, []);

  const safeCount = occupants.filter((o) => o.isSafe).length;
  const totalCount = occupants.length;
  const allSafe = totalCount > 0 && safeCount === totalCount;
  const myEntry = occupants.find((o) => o.isSelf);

  // Active check-in is active during emergencies, threshold alerts, or running simulations
  const isRollCallActive = isEmergency || alertLevel > 0 || isSimulating;

  const handleToggle = (id) => {
    HapticService.triggerTap();
    OccupantService.toggleSafe(id);
  };

  const handleSelfQuickSafe = () => {
    HapticService.triggerTap();
    if (myEntry) {
      OccupantService.toggleSafe(myEntry.id);
    }
  };

  const handleMarkAllSafe = () => {
    HapticService.triggerTap();
    Alert.alert(
      'Confirm Group Safety',
      'Mark everyone as safely accounted for outside?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Safe',
          style: 'default',
          onPress: () => {
            HapticService.triggerTap();
            OccupantService.markAllSafe();
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    HapticService.triggerTap();
    OccupantService.resetAll();
  };

  const handleSimulatePeerJoin = () => {
    HapticService.triggerTap();
    const candidateNames = [
      "Dad's Phone (Kitchen)",
      "Mom's Phone (Living Room)",
      "Sister's iPhone (Upstairs)",
      "Family Tablet (Hallway)",
    ];
    const unused = candidateNames.find(
      (n) => !occupants.some((o) => o.name.toLowerCase().includes(n.split("'")[0].toLowerCase()))
    ) || `Phone ${occupants.length + 1} (Wi-Fi)`;
    OccupantService.simulatePeerJoin(unused, 'Wi-Fi Peer');
  };

  const handleAddSubmit = () => {
    if (!newName.trim()) return;
    HapticService.triggerTap();
    OccupantService.addOccupant(newName.trim(), 'manual');
    setNewName('');
    setIsAdding(false);
  };

  const handleRemove = (id) => {
    HapticService.triggerTap();
    OccupantService.removeOccupant(id);
  };

  return (
    <View style={[styles.container, isRollCallActive && styles.containerActive]}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.headerIconWrap,
              {
                backgroundColor: isRollCallActive
                  ? allSafe
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)'
                  : COLORS.surfaceElevated,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-group-outline"
              size={18}
              color={isRollCallActive ? (allSafe ? COLORS.primary : COLORS.warning) : COLORS.textSecondary}
            />
          </View>
          <View>
            <Text style={[styles.cardTitle, { fontSize: fs(14) }]}>
              {isRollCallActive ? 'Evacuation Check-In' : 'Family & Occupants'}
            </Text>
            <Text style={[styles.cardSubtitle, { fontSize: fs(11) }]}>
              {isRollCallActive
                ? allSafe
                  ? 'All occupants confirmed safe outside'
                  : 'Confirm who has reached safety outside'
                : `${totalCount} registered • Ready on local hub`}
            </Text>
          </View>
        </View>

        {/* Status Pill Badge */}
        {isRollCallActive ? (
          <View style={[styles.countPill, allSafe ? styles.countPillSafe : styles.countPillPending]}>
            <Text style={[styles.countPillText, { color: allSafe ? COLORS.primary : COLORS.warning, fontSize: fs(10) }]}>
              {safeCount} of {totalCount} Safe
            </Text>
          </View>
        ) : (
          <View style={styles.standbyPill}>
            <Text style={[styles.standbyPillText, { fontSize: fs(10) }]}>STANDBY</Text>
          </View>
        )}
      </View>

      {/* Network Auto-Group Banner */}
      <View style={styles.networkGroupBanner}>
        <View style={styles.networkGroupLeft}>
          <View style={styles.networkIconCircle}>
            <MaterialCommunityIcons name="wifi-check" size={15} color={COLORS.primary} />
          </View>
          <View style={styles.networkGroupTextWrap}>
            <View style={styles.networkNameRow}>
              <Text style={[styles.networkGroupName, { fontSize: fs(12) }]}>
                {networkGroup.groupName || 'Home Wi-Fi Safety Group'}
              </Text>
              <View style={styles.networkAutoPill}>
                <Text style={[styles.networkAutoPillText, { fontSize: fs(8.5) }]}>AUTO-JOINED</Text>
              </View>
            </View>
            <Text style={[styles.networkGroupSub, { fontSize: fs(10.5) }]}>
              {networkGroup.connectedPhonesCount} phones joined on {networkGroup.ssid} • Subnet {networkGroup.subnet}
            </Text>
          </View>
        </View>
      </View>

      {/* ACTIVE MODE: Group Actions (Mark All Safe & Reset All) */}
      {isRollCallActive && (
        <View style={styles.groupActionsRow}>
          <TouchableOpacity
            style={styles.groupActionButton}
            activeOpacity={0.7}
            onPress={handleMarkAllSafe}
          >
            <MaterialCommunityIcons name="check-all" size={15} color={COLORS.primary} />
            <Text style={[styles.groupActionText, { fontSize: fs(12) }]}>Mark All Safe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.groupActionButton}
            activeOpacity={0.7}
            onPress={handleResetAll}
          >
            <MaterialCommunityIcons name="refresh" size={15} color={COLORS.textSecondary} />
            <Text style={[styles.groupActionTextSecondary, { fontSize: fs(12) }]}>Reset All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIVE MODE: Prominent One-Tap "I Am Safe" Button for Current Device */}
      {isRollCallActive && myEntry && !myEntry.isSafe && (
        <TouchableOpacity
          style={styles.selfSafeButton}
          activeOpacity={0.8}
          onPress={handleSelfQuickSafe}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
          <Text style={[styles.selfSafeButtonText, { fontSize: fs(13) }]}>I Am Safe Outside (Check In)</Text>
        </TouchableOpacity>
      )}

      {/* Occupants List */}
      <View style={styles.listContainer}>
        {occupants.map((person) => (
          <View key={person.id} style={styles.personRow}>
            {/* Device / Person Icon */}
            <View
              style={[
                styles.personIconCircle,
                isRollCallActive && person.isSafe
                  ? styles.iconCircleSafe
                  : styles.iconCirclePending,
              ]}
            >
              <MaterialCommunityIcons
                name={person.type === 'mobile' ? 'cellphone' : 'account-outline'}
                size={16}
                color={
                  isRollCallActive && person.isSafe
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
            </View>

            {/* Name & Details */}
            <View style={styles.personDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.personName, { fontSize: fs(13.5) }]} numberOfLines={1}>
                  {person.name}
                </Text>
                {person.isSelf && <Text style={[styles.youBadge, { fontSize: fs(9) }]}>YOU</Text>}
              </View>
              <Text style={[styles.statusSubtext, { fontSize: fs(11) }]}>
                {isRollCallActive
                  ? person.isSafe
                    ? `Safe outside (${person.checkInTime || 'Checked in'})`
                    : 'Pending confirmation'
                  : 'Connected to hub'}
              </Text>
            </View>

            {/* In Active Roll Call: Show Mark Safe / Safe Pill */}
            {isRollCallActive ? (
              <TouchableOpacity
                style={[
                  styles.statusChip,
                  person.isSafe ? styles.statusChipSafe : styles.statusChipPending,
                ]}
                activeOpacity={0.7}
                onPress={() => handleToggle(person.id)}
              >
                <MaterialCommunityIcons
                  name={person.isSafe ? 'check' : 'clock-outline'}
                  size={14}
                  color={person.isSafe ? COLORS.primary : COLORS.warning}
                />
                <Text
                  style={[
                    styles.statusChipText,
                    { color: person.isSafe ? COLORS.primary : COLORS.warning, fontSize: fs(11) },
                  ]}
                >
                  {person.isSafe ? 'Safe' : 'Mark Safe'}
                </Text>
              </TouchableOpacity>
            ) : (
              /* In Peaceful Standby Mode: Show Simple Device Type */
              <View style={styles.standbyMemberBadge}>
                <Text style={[styles.standbyMemberText, { fontSize: fs(10) }]}>
                  {person.type === 'mobile' ? 'Mobile Phone' : 'Manual Entry'}
                </Text>
              </View>
            )}

            {/* Delete button (not for self) */}
            {!person.isSelf && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemove(person.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Footer Controls: Add Person */}
      {isAdding ? (
        <View style={styles.addRow}>
          <TextInput
            style={[styles.addInput, { fontSize: fs(12) }]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Name (e.g. Dad, Sister, Roommate)"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
          <TouchableOpacity style={styles.addConfirmButton} onPress={handleAddSubmit}>
            <Text style={[styles.addConfirmText, { fontSize: fs(12) }]}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCancelButton} onPress={() => setIsAdding(false)}>
            <Text style={[styles.addCancelText, { fontSize: fs(12) }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.addMemberButton}
            activeOpacity={0.7}
            onPress={() => setIsAdding(true)}
          >
            <MaterialCommunityIcons name="plus" size={15} color={COLORS.textSecondary} />
            <Text style={[styles.addMemberText, { fontSize: fs(12) }]}>Add Person / Family Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simPeerButton}
            activeOpacity={0.7}
            onPress={handleSimulatePeerJoin}
          >
            <MaterialCommunityIcons name="cellphone-wireless" size={14} color={COLORS.primary} />
            <Text style={[styles.simPeerButtonText, { fontSize: fs(11) }]}>Simulate Phone Joining Wi-Fi Group</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  containerActive: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  countPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  countPillSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  countPillPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  countPillText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  standbyPill: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  standbyPillText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  groupActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingTop: 4,
  },
  groupActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  groupActionText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  groupActionTextSecondary: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selfSafeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  selfSafeButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 10,
  },
  personIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  iconCirclePending: {
    backgroundColor: COLORS.surfaceElevated,
  },
  personDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  personName: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  youBadge: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statusSubtext: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  statusChipSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusChipPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  statusChipText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  standbyMemberBadge: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  standbyMemberText: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 2,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: 10,
    gap: 6,
  },
  addMemberText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  addConfirmButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addConfirmText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addCancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  addCancelText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  networkGroupBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  networkGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  networkIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkGroupTextWrap: {
    flex: 1,
  },
  networkNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkGroupName: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  networkAutoPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  networkAutoPillText: {
    fontFamily: FONTS.mono,
    fontSize: 8.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  networkGroupSub: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  simPeerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 8,
    paddingVertical: 7,
    marginTop: 8,
  },
  simPeerButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
