/*
 * AeroSense Life-Safety Protocols & Official National Emergency Hotlines
 * Official emergency directory formatted for the Republic of the Philippines.
 * Categorized by incident type (Fire/Hazmat, Medical/Ambulance, Poison/CO, and Local Marshal).
 */

export const EVACUATION_PROTOCOLS = {
  FLAMMABLE_GAS: {
    title: 'Gas Leak Detected (LPG / Methane)',
    severity: 'CRITICAL',
    voiceText: 'Warning. Gas leak detected. Please leave the building immediately and do not touch any switches.',
    rules: [
      {
        id: 'rule_1',
        icon: 'lightbulb-off-outline',
        label: "Don't touch light switches or appliances",
        subtext: 'Flipping a switch can cause a spark that ignites gas.',
      },
      {
        id: 'rule_2',
        icon: 'fan-off',
        label: "Don't turn on electric fans or exhaust hoods",
        subtext: 'Electric motors generate small internal sparks.',
      },
      {
        id: 'rule_3',
        icon: 'window-open-variant',
        label: 'Open doors and windows',
        subtext: 'Let fresh air flow in to dilute accumulated vapor.',
      },
      {
        id: 'rule_4',
        icon: 'run-fast',
        label: 'Leave the building immediately',
        subtext: 'Walk calmly to a safe outdoor assembly area.',
      },
    ],
  },
  HYDROGEN: {
    title: 'Hydrogen Leak Detected',
    severity: 'CRITICAL',
    voiceText: 'Warning. Hydrogen gas detected near the ceiling. Extinguish all flames and evacuate immediately.',
    rules: [
      {
        id: 'rule_1',
        icon: 'fire-off',
        label: 'Extinguish all flames immediately',
        subtext: 'Hydrogen catches fire very easily in open air.',
      },
      {
        id: 'rule_2',
        icon: 'arrow-down-bold',
        label: 'Stay low and exit the room',
        subtext: 'Hydrogen rises and collects near the ceiling.',
      },
      {
        id: 'rule_3',
        icon: 'run-fast',
        label: 'Move to fresh air outside',
        subtext: 'Proceed outside away from the building.',
      },
    ],
  },
  CARBON_MONOXIDE: {
    title: 'Carbon Monoxide Warning (CO)',
    severity: 'CRITICAL',
    voiceText: 'Warning. Dangerous levels of carbon monoxide detected. Move outside to fresh air immediately.',
    rules: [
      {
        id: 'rule_1',
        icon: 'weather-windy',
        label: 'Get outside into fresh air immediately',
        subtext: 'Carbon monoxide is an invisible, odorless, toxic gas.',
      },
      {
        id: 'rule_2',
        icon: 'account-alert',
        label: 'Check for headache, dizziness, or nausea',
        subtext: 'Seek medical help if anyone shows symptoms of poisoning.',
      },
    ],
  },
};

/*
 * Official National Emergency Hotlines (Republic of the Philippines)
 * Verified against DILG, BFP, Philippine Red Cross, and UP-PGH Poison Center.
 */
export const EMERGENCY_CONTACTS = [
  {
    id: 'emergency_911',
    name: 'National Emergency Hotline',
    agency: 'Emergency 911 National Command',
    phone: '911',
    displayPhone: '911',
    category: 'PRIMARY',
    categoryLabel: 'NATIONAL RESCUE',
    icon: 'phone-in-talk',
    description: 'Immediate nationwide dispatch for fire rescue, police, and emergency medical.',
    badgeColor: '#EF4444',
    recommendedFor: ['FLAMMABLE_GAS', 'HYDROGEN', 'CARBON_MONOXIDE'],
  },
  {
    id: 'bfp_hazmat',
    name: 'Bureau of Fire Protection (BFP)',
    agency: 'BFP National Hazmat & Fire Suppression',
    phone: '0284260219',
    displayPhone: '(02) 8426-0219',
    category: 'FIRE_HAZMAT',
    categoryLabel: 'FIRE & HAZMAT',
    icon: 'fire-truck',
    description: 'Direct response for flammable vapor, LPG cylinder leaks, and explosion prevention.',
    badgeColor: '#F97316',
    recommendedFor: ['FLAMMABLE_GAS', 'HYDROGEN'],
  },
  {
    id: 'red_cross_143',
    name: 'Philippine Red Cross',
    agency: 'PRC Emergency Medical & Ambulance',
    phone: '143',
    displayPhone: '143 / (02) 8790-2300',
    category: 'MEDICAL',
    categoryLabel: 'AMBULANCE / OXYGEN',
    icon: 'ambulance',
    description: '24/7 emergency ambulance dispatch, oxygen therapy, and burn trauma care.',
    badgeColor: '#E11D48',
    recommendedFor: ['CARBON_MONOXIDE', 'FLAMMABLE_GAS'],
  },
  {
    id: 'up_pgh_poison',
    name: 'National Poison Control (PGH)',
    agency: 'UP Manila - Philippine General Hospital',
    phone: '0285241078',
    displayPhone: '(02) 8524-1078',
    category: 'POISON',
    categoryLabel: 'TOXICOLOGY / CO',
    icon: 'hospital-box-outline',
    description: 'Specialized medical guidance for Carbon Monoxide asphyxiation and toxic inhalation.',
    badgeColor: '#8B5CF6',
    recommendedFor: ['CARBON_MONOXIDE'],
  },
  {
    id: 'ndrrmc_ops',
    name: 'NDRRMC Disaster Operations',
    agency: 'Office of Civil Defense (OCD)',
    phone: '0289111406',
    displayPhone: '(02) 8911-1406',
    category: 'DISASTER',
    categoryLabel: 'CIVIL DEFENSE',
    icon: 'shield-alert',
    description: 'Community-scale disaster operations, severe incident coordination, and public safety.',
    badgeColor: '#F59E0B',
    recommendedFor: [],
  },
  {
    id: 'safety_lead',
    name: 'Facility Safety Marshal',
    agency: 'On-Site Property / Building Lead',
    phone: '09171234567',
    displayPhone: '0917-123-4567',
    category: 'LOCAL',
    categoryLabel: 'ON-SITE MARSHAL',
    icon: 'shield-account',
    description: 'On-site coordinator for building gas mains shutoff and outdoor assembly muster.',
    badgeColor: '#10B981',
    recommendedFor: ['FLAMMABLE_GAS', 'HYDROGEN', 'CARBON_MONOXIDE'],
  },
];
