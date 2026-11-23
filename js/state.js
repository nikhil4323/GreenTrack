/**
 * GreenTrack - Reactive Application State & Persistence Store
 */

class GreenState {
  constructor() {
    this.STORAGE_KEY = 'greentrack_bins_v1';
    this.SETTINGS_KEY = 'greentrack_settings_v1';
    this.HISTORY_KEY = 'greentrack_collection_history_v1';

    this.bins = this.loadBins();
    this.history = this.loadHistory();
    this.settings = this.loadSettings();

    // Runtime state (non-persistent or session)
    this.activeTab = 'map';
    this.activeFilter = 'all'; // all, critical, warning, organic, recyclable, etc.
    this.selectedBinId = null;
    this.simSpeedMultiplier = 1; // 1x, 5x, 10x
    this.simMode = 'simulated'; // simulated vs direct_sensor
    this.currentRoute = null; // generated pickup plan

    this.listeners = new Map();
  }

  // Event dispatch system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error(`Error in listener for ${event}:`, e); }
      });
    }
  }

  loadBins() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read bins from localStorage, fallback to seed:", e);
    }
    return JSON.parse(JSON.stringify(window.INITIAL_BINS || []));
  }

  saveBins() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bins));
    } catch (e) {
      console.warn("Could not save bins to localStorage:", e);
    }
    this.emit('bins-updated', this.bins);
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "RUN-1042",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        binsEmptied: 5,
        totalLitersCollected: 1140,
        totalWeightKg: 285,
        distanceKm: 3.2,
        co2PreventedKg: 8.6,
        operator: "Campus EcoFleet - Team A"
      },
      {
        id: "RUN-1041",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        binsEmptied: 4,
        totalLitersCollected: 920,
        totalWeightKg: 210,
        distanceKm: 2.8,
        co2PreventedKg: 6.4,
        operator: "Campus EcoFleet - Team B"
      }
    ];
  }

  saveHistory() {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (e) {}
    this.emit('history-updated', this.history);
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      autoSimulation: true,
      pickupThreshold: 75, // bins >= 75% trigger collection alert
      soundAlerts: false
    };
  }

  saveSettings() {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {}
    this.emit('settings-updated', this.settings);
  }

  // Bin Management CRUD
  getBinById(id) {
    return this.bins.find(b => b.id === id) || null;
  }

  addBin(binData) {
    // Generate code if missing
    if (!binData.id) {
      const prefix = binData.stream ? binData.stream.substring(0, 3).toUpperCase() : 'BIN';
      const num = Math.floor(100 + Math.random() * 900);
      binData.id = `BIN-${prefix}-${num}`;
    }

    // Default parameters
    const newBin = {
      id: binData.id,
      name: binData.name || "Unnamed Campus Bin",
      zone: binData.zone || "General Campus",
      stream: binData.stream || "recyclable",
      capacity: Number(binData.capacity) || 240,
      currentFill: Math.min(100, Math.max(0, Number(binData.currentFill) || 10)),
      weightKg: Number(binData.weightKg) || 12,
      lat: Number(binData.lat) || 37.4275,
      lng: Number(binData.lng) || -122.1697,
      sensorType: binData.sensorType || "Ultrasonic LiDAR v4",
      battery: 100,
      temperature: 20,
      tiltStatus: "Normal",
      lastPing: "Just now",
      lastCollected: "Never",
      fillVelocity: "+1.5%/hr"
    };

    this.bins.push(newBin);
    this.saveBins();
    this.emit('bin-added', newBin);
    return newBin;
  }

  updateBinFill(id, newFill) {
    const bin = this.getBinById(id);
    if (!bin) return null;

    bin.currentFill = Math.min(100, Math.max(0, Math.round(newFill)));
    bin.lastPing = "Just now";
    
    // Update calculated weight roughly
    const density = window.GREEN_CONFIG.streams[bin.stream]?.densityKgPerLiter || 0.25;
    const currentLiters = (bin.capacity * bin.currentFill) / 100;
    bin.weightKg = parseFloat((currentLiters * density).toFixed(1));

    this.saveBins();
    this.emit('bin-fill-changed', bin);
    return bin;
  }

  emptyBin(id) {
    const bin = this.getBinById(id);
    if (!bin) return null;

    bin.currentFill = 0;
    bin.weightKg = 0;
    bin.lastCollected = "Just now";
    bin.lastPing = "Just now";

    this.saveBins();
    this.emit('bin-emptied', bin);
    return bin;
  }

  deleteBin(id) {
    const index = this.bins.findIndex(b => b.id === id);
    if (index !== -1) {
      const removed = this.bins.splice(index, 1)[0];
      this.saveBins();
      this.emit('bin-deleted', removed);
      return removed;
    }
    return null;
  }

  resetToDefault() {
    this.bins = JSON.parse(JSON.stringify(window.INITIAL_BINS || []));
    this.saveBins();
    this.emit('bins-reset', this.bins);
  }

  // Query helpers
  getCriticalBins() {
    return this.bins.filter(b => b.currentFill >= window.GREEN_CONFIG.thresholds.criticalMin);
  }

  getBinsNeedingPickup(threshold = null) {
    const thresh = threshold !== null ? threshold : this.settings.pickupThreshold;
    return this.bins.filter(b => b.currentFill >= thresh);
  }

  getSummaryMetrics() {
    const totalBins = this.bins.length;
    const criticalCount = this.bins.filter(b => b.currentFill >= 80).length;
    const warningCount = this.bins.filter(b => b.currentFill >= 60 && b.currentFill < 80).length;
    const normalCount = this.bins.filter(b => b.currentFill < 60).length;

    const totalCapacity = this.bins.reduce((sum, b) => sum + (b.capacity || 0), 0);
    const totalLiters = this.bins.reduce((sum, b) => sum + ((b.capacity * b.currentFill) / 100), 0);
    const avgFill = totalCapacity > 0 ? Math.round((totalLiters / totalCapacity) * 100) : 0;
    const totalWeightKg = this.bins.reduce((sum, b) => sum + (b.weightKg || 0), 0);

    return {
      totalBins,
      criticalCount,
      warningCount,
      normalCount,
      totalCapacity,
      totalLiters: Math.round(totalLiters),
      avgFill,
      totalWeightKg: Math.round(totalWeightKg)
    };
  }
}

// Global singleton instance
window.appState = new GreenState();
