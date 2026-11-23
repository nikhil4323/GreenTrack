/**
 * GreenTrack - Sensor Telemetry Simulation Engine
 * Clearly labelled simulated telemetry generator with live clock, event triggers, and manual controls
 */

class SensorSimulationEngine {
  constructor() {
    this.timerId = null;
    this.intervalMs = 4000; // tick every 4 seconds
    this.isLive = true;
    this.activeScenario = 'Normal Campus Activity';
    this.lastTickTime = Date.now();
  }

  start() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(), this.intervalMs);
    this.isLive = true;
    this.updateStatusBanner();
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isLive = false;
    this.updateStatusBanner();
  }

  toggle() {
    if (this.isLive) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  // Periodic simulation tick (adds realistic micro-accumulation and sensor pings)
  tick() {
    const bins = window.appState.bins;
    let changed = false;

    // Pick 1 to 3 random bins to slightly update
    const sampleCount = Math.floor(1 + Math.random() * 3);
    for (let i = 0; i < sampleCount; i++) {
      const randomBin = bins[Math.floor(Math.random() * bins.length)];
      if (!randomBin) continue;

      // Only increment if not full
      if (randomBin.currentFill < 100) {
        // Natural fill increment
        const increment = Math.random() > 0.3 ? 1 : 2;
        randomBin.currentFill = Math.min(100, randomBin.currentFill + increment);
        randomBin.lastPing = "Just now";
        
        // Update weight
        const density = window.GREEN_CONFIG.streams[randomBin.stream]?.densityKgPerLiter || 0.25;
        const currentLiters = (randomBin.capacity * randomBin.currentFill) / 100;
        randomBin.weightKg = parseFloat((currentLiters * density).toFixed(1));

        changed = true;

        // Check if just reached critical threshold
        if (randomBin.currentFill === 80) {
          if (window.appUI && window.appUI.showToast) {
            window.appUI.showToast(
              '⚠️ High Fill Warning',
              `${randomBin.name} has reached 80% capacity! Added to pickup radar.`,
              'warning'
            );
          }
        }
      }
    }

    if (changed) {
      window.appState.saveBins();
    }
  }

  // Preset Scenario: Lunch Rush at Dining Commons & Student Union
  triggerLunchRush() {
    this.activeScenario = 'Cafeteria Lunch Rush';
    const diningBins = window.appState.bins.filter(b => b.zone === 'Dining & Services' || b.zone === 'Campus Heart');
    
    diningBins.forEach(bin => {
      const spike = Math.floor(20 + Math.random() * 25);
      bin.currentFill = Math.min(100, bin.currentFill + spike);
      bin.lastPing = "Just now";
      const density = window.GREEN_CONFIG.streams[bin.stream]?.densityKgPerLiter || 0.25;
      bin.weightKg = parseFloat(((bin.capacity * bin.currentFill) / 100 * density).toFixed(1));
    });

    window.appState.saveBins();
    this.updateStatusBanner();

    if (window.appUI) {
      window.appUI.showToast(
        '🍱 Scenario Injected: Lunch Rush',
        'High food & recyclable waste spike generated across Dining Commons and Student Union.',
        'warning'
      );
    }
  }

  // Preset Scenario: Campus Festival / Athletics Spike
  triggerCampusFestival() {
    this.activeScenario = 'Campus Festival & Athletics Match';
    const eventBins = window.appState.bins.filter(b => b.zone === 'Athletics' || b.stream === 'recyclable');

    eventBins.forEach(bin => {
      const spike = Math.floor(25 + Math.random() * 30);
      bin.currentFill = Math.min(100, bin.currentFill + spike);
      bin.lastPing = "Just now";
      const density = window.GREEN_CONFIG.streams[bin.stream]?.densityKgPerLiter || 0.25;
      bin.weightKg = parseFloat(((bin.capacity * bin.currentFill) / 100 * density).toFixed(1));
    });

    window.appState.saveBins();
    this.updateStatusBanner();

    if (window.appUI) {
      window.appUI.showToast(
        '🎉 Scenario Injected: Campus Festival',
        'Huge surge in beverage containers & recyclables simulated at quad & athletic arena.',
        'warning'
      );
    }
  }

  // Preset Scenario: Critical Overflow Alert (5 bins reach >90%)
  triggerCriticalOverflow() {
    this.activeScenario = 'Emergency Overflow Alert';
    const targetBins = window.appState.bins.slice(0, 5);

    targetBins.forEach(bin => {
      bin.currentFill = Math.floor(91 + Math.random() * 8);
      bin.lastPing = "Just now";
      const density = window.GREEN_CONFIG.streams[bin.stream]?.densityKgPerLiter || 0.25;
      bin.weightKg = parseFloat(((bin.capacity * bin.currentFill) / 100 * density).toFixed(1));
    });

    window.appState.saveBins();
    this.updateStatusBanner();

    if (window.appUI) {
      window.appUI.showToast(
        '🚨 Urgent: Critical Overflow Injected',
        '5 campus bins are now overflowing (>90%). Route optimization recommended immediately!',
        'error'
      );
    }
  }

  // Reset all bins to nominal low levels (15 - 35%)
  resetNominal() {
    this.activeScenario = 'Nominal Low Traffic';
    window.appState.bins.forEach(bin => {
      bin.currentFill = Math.floor(15 + Math.random() * 20);
      bin.lastPing = "Just now";
      const density = window.GREEN_CONFIG.streams[bin.stream]?.densityKgPerLiter || 0.25;
      bin.weightKg = parseFloat(((bin.capacity * bin.currentFill) / 100 * density).toFixed(1));
    });

    window.appState.saveBins();
    this.updateStatusBanner();

    if (window.appUI) {
      window.appUI.showToast(
        '✨ Nominal Reset',
        'All campus bin fill levels set to baseline (15-35%).',
        'success'
      );
    }
  }

  updateStatusBanner() {
    const bannerEl = document.getElementById('simModeBanner');
    if (bannerEl) {
      bannerEl.innerHTML = `
        <span class="pulse-dot ${this.isLive ? '' : 'warning'}"></span>
        <span>Sensor Feed: <strong>${this.isLive ? 'Simulated Live Telemetry (Active)' : 'Simulation Paused'}</strong></span>
        <span style="opacity: 0.6;">•</span>
        <span style="color: var(--color-gold-700);">${this.activeScenario}</span>
      `;
    }
  }
}

// Global simulation engine
window.sensorSim = new SensorSimulationEngine();
