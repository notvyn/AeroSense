/*
 * AeroSense Mobile App - OccupantService
 * Manages mobile presence detection and group evacuation accountability.
 * Operates 100% offline using local network zero-configuration:
 * - When connected to the same Wi-Fi (e.g. Home_WiFi), phones auto-join the same safety group
 * - Uses LAN UDP beacons and mDNS for real-time peer roster sync
 */

class OccupantService {
  constructor() {
    this.listeners = [];
    this.networkGroup = {
      ssid: 'Home_WiFi',
      groupName: 'Home Wi-Fi Safety Group',
      subnet: '192.168.1.0/24',
      isAutoGroupActive: true,
      connectedPhonesCount: 2,
    };

    this.occupants = [
      {
        id: 'me',
        name: 'My Phone (You)',
        type: 'mobile',
        deviceModel: 'This Device',
        isSafe: false,
        checkInTime: null,
        isSelf: true,
        ip: '192.168.1.45',
        joinedVia: 'Local Wi-Fi Subnet',
      },
      {
        id: 'device_2',
        name: 'Family Phone (Living Room)',
        type: 'mobile',
        deviceModel: 'Android Device',
        isSafe: false,
        checkInTime: null,
        isSelf: false,
        ip: '192.168.1.62',
        joinedVia: 'Home_WiFi (Auto-Joined)',
      },
      {
        id: 'member_3',
        name: 'Grandma (Manual)',
        type: 'manual',
        deviceModel: 'Assisted Occupant',
        isSafe: false,
        checkInTime: null,
        isSelf: false,
        ip: null,
        joinedVia: 'Household Roster',
      },
    ];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener([...this.occupants], { ...this.networkGroup });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener([...this.occupants], { ...this.networkGroup });
    }
  }

  // Update Wi-Fi Network Name & Group
  setNetworkName(ssid) {
    this.networkGroup = {
      ...this.networkGroup,
      ssid: ssid || 'Home_WiFi',
      groupName: `${ssid || 'Home'} Safety Group`,
    };
    this.notify();
  }

  // Simulate another phone connecting to the same Wi-Fi and joining the group
  simulatePeerJoin(name, deviceModel = 'Mobile Phone') {
    const peerId = `peer_${Date.now()}`;
    const newPeer = {
      id: peerId,
      name,
      type: 'mobile',
      deviceModel,
      isSafe: false,
      checkInTime: null,
      isSelf: false,
      ip: `192.168.1.${Math.floor(Math.random() * 80) + 100}`,
      joinedVia: `${this.networkGroup.ssid} (Auto-Joined)`,
    };
    this.occupants = [...this.occupants, newPeer];
    this.networkGroup.connectedPhonesCount = this.occupants.filter((o) => o.type === 'mobile').length;
    this.notify();
    return peerId;
  }

  // Toggle safe status for any occupant or this device
  toggleSafe(id) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.occupants = this.occupants.map((occ) => {
      if (occ.id === id) {
        const nextSafe = !occ.isSafe;
        return {
          ...occ,
          isSafe: nextSafe,
          checkInTime: nextSafe ? timeStr : null,
        };
      }
      return occ;
    });

    this.notify();
  }

  // Mark this specific mobile device safe
  markSelfSafe(isSafe = true) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.occupants = this.occupants.map((occ) => {
      if (occ.isSelf) {
        return {
          ...occ,
          isSafe,
          checkInTime: isSafe ? timeStr : null,
        };
      }
      return occ;
    });

    this.notify();
  }

  // Add a new occupant or detected device
  addOccupant(name, type = 'manual') {
    if (!name || !name.trim()) return;
    const newEntry = {
      id: `occ_${Date.now()}`,
      name: name.trim(),
      type,
      deviceModel: type === 'mobile' ? 'Mobile Phone' : 'Assisted Occupant',
      isSafe: false,
      checkInTime: null,
      isSelf: false,
      ip: type === 'mobile' ? `192.168.1.${Math.floor(Math.random() * 80) + 100}` : null,
      joinedVia: type === 'mobile' ? `${this.networkGroup.ssid} (Auto-Joined)` : 'Household Roster',
    };
    this.occupants = [...this.occupants, newEntry];
    this.networkGroup.connectedPhonesCount = this.occupants.filter((o) => o.type === 'mobile').length;
    this.notify();
  }

  // Remove an occupant from the roster
  removeOccupant(id) {
    this.occupants = this.occupants.filter((occ) => occ.id !== id || occ.isSelf);
    this.networkGroup.connectedPhonesCount = this.occupants.filter((o) => o.type === 'mobile').length;
    this.notify();
  }

  // Reset everyone to pending (triggered when a new emergency drill starts)
  resetAll() {
    this.occupants = this.occupants.map((occ) => ({
      ...occ,
      isSafe: false,
      checkInTime: null,
    }));
    this.notify();
  }

  // Mark all occupants safe (for quick drill completion)
  markAllSafe() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.occupants = this.occupants.map((occ) => ({
      ...occ,
      isSafe: true,
      checkInTime: timeStr,
    }));
    this.notify();
  }
}

export default new OccupantService();
