/**
 * GreenTrack - Master Application Orchestrator & UI Controller
 */

class GreenTrackUI {
  constructor() {
    this.currentClassification = null;
    this.webcamStream = null;
  }

  init() {
    console.log("Initializing GreenTrack application...");

    // Initialize tabs
    this.bindTabNavigation();

    // Initialize Map
    if (window.campusMap) {
      window.campusMap.init('campusMap');
    }

    // Initialize Analytics
    if (window.analyticsManager) {
      window.analyticsManager.init();
    }

    // Initialize Classifier
    if (window.wasteClassifier) {
      window.wasteClassifier.initModel();
      this.renderPresetSamples();
      this.bindClassifierUI();
    }

    // Initialize Simulation
    if (window.sensorSim) {
      window.sensorSim.start();
    }

    // Render Bins Inventory Table
    this.renderBinsTable();

    // Render Route Optimizer View
    this.renderRoutePlannerView();

    // Update KPI Ribbon
    this.updateKpiRibbon();

    // Listen to state changes
    window.appState.on('bins-updated', () => {
      this.updateKpiRibbon();
      this.renderBinsTable();
      this.renderRoutePlannerView();
    });
    window.appState.on('bin-fill-changed', () => {
      this.updateKpiRibbon();
      this.renderBinsTable();
      this.renderRoutePlannerView();
    });
    window.appState.on('bin-emptied', () => {
      this.updateKpiRibbon();
      this.renderBinsTable();
      this.renderRoutePlannerView();
    });

    // Bind Modals & Global buttons
    this.bindModals();

    console.log("GreenTrack successfully loaded and active.");
  }

  // ----------------------------------------------------
  // Tab Navigation
  // ----------------------------------------------------
  bindTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabTarget = btn.getAttribute('data-tab');
        this.switchTab(tabTarget);
      });
    });
  }

  switchTab(tabId) {
    window.appState.activeTab = tabId;

    // Update nav button active states
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update tab content displays
    document.querySelectorAll('.tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabId}`);
    });

    // If map tab became visible, trigger Leaflet size refresh
    if (tabId === 'map' && window.campusMap && window.campusMap.map) {
      setTimeout(() => {
        window.campusMap.map.invalidateSize();
      }, 100);
    }

    // If analytics tab became visible, resize charts
    if (tabId === 'analytics' && window.analyticsManager) {
      setTimeout(() => {
        window.analyticsManager.refreshAll();
      }, 100);
    }
  }

  // ----------------------------------------------------
  // KPI Ribbon Updater
  // ----------------------------------------------------
  updateKpiRibbon() {
    const metrics = window.appState.getSummaryMetrics();

    const totalEl = document.getElementById('kpiTotalBins');
    const criticalEl = document.getElementById('kpiCriticalBins');
    const avgFillEl = document.getElementById('kpiAvgFill');
    const weightEl = document.getElementById('kpiTotalWeight');

    if (totalEl) totalEl.textContent = metrics.totalBins;
    if (criticalEl) {
      criticalEl.textContent = metrics.criticalCount;
      const card = criticalEl.closest('.kpi-card');
      if (card) {
        card.classList.toggle('warning', metrics.criticalCount > 0);
      }
    }
    if (avgFillEl) avgFillEl.textContent = `${metrics.avgFill}%`;
    if (weightEl) weightEl.textContent = `${metrics.totalWeightKg} kg`;

    // Map summary badge
    const mapCriticalBadge = document.getElementById('mapCriticalCounter');
    if (mapCriticalBadge) {
      mapCriticalBadge.textContent = `${metrics.criticalCount} Critical`;
      mapCriticalBadge.style.display = metrics.criticalCount > 0 ? 'inline-flex' : 'none';
    }
  }

  // ----------------------------------------------------
  // Classifier UI & Event Handlers
  // ----------------------------------------------------
  renderPresetSamples() {
    const container = document.getElementById('presetSamplesGrid');
    if (!container || !window.wasteClassifier) return;

    const samples = window.wasteClassifier.presetSamples;
    container.innerHTML = samples.map(s => `
      <div class="preset-sample-card" onclick="window.appUI.testPresetSample('${s.id}')" title="Click to test AI classification for ${s.label}">
        <div class="sample-thumbnail">${s.svg}</div>
        <div class="sample-meta">
          <h6>${s.label}</h6>
          <span class="stream-badge ${window.GREEN_CONFIG.streams[s.category]?.badgeClass || ''}">${s.category}</span>
        </div>
      </div>
    `).join('');
  }

  bindClassifierUI() {
    // File input change
    const fileInput = document.getElementById('wasteImageFileInput');
    const dropZone = document.getElementById('imageDropZone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.add('drag-over');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.remove('drag-over');
        }, false);
      });

      dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files && dt.files[0]) {
          this.handleImageFile(dt.files[0]);
        }
      });
    }

    // Manual search query
    const searchInput = document.getElementById('manualWasteSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.performManualSearch(e.target.value);
      });
    }

    // Manual category filter pills
    document.querySelectorAll('.manual-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.manual-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-stream');
        const q = searchInput ? searchInput.value : '';
        this.performManualSearch(q, cat);
      });
    });

    // Populate initial manual search recommendations
    this.performManualSearch('');
  }

  // Handle uploaded image file
  handleImageFile(file) {
    if (!file.type.match('image.*')) {
      this.showToast('Invalid File', 'Please upload a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.displayUploadedImage(img.src);
        this.triggerImageClassification(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Handle Preset Sample 1-Click test
  testPresetSample(sampleId) {
    const sample = window.wasteClassifier.presetSamples.find(s => s.id === sampleId);
    if (!sample) return;

    // Convert SVG to data URI
    const svgBlob = new Blob([sample.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      this.displayUploadedImage(url);
      this.triggerImageClassification(img, sampleId);
    };
    img.src = url;
  }

  displayUploadedImage(src) {
    const previewContainer = document.getElementById('scannerViewport');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
      <img src="${src}" alt="Classified Waste Item" id="activeScanImage">
      <div class="scanner-laser-line scanning"></div>
      <div class="scanner-crosshair top-left"></div>
      <div class="scanner-crosshair top-right"></div>
      <div class="scanner-crosshair bottom-left"></div>
      <div class="scanner-crosshair bottom-right"></div>
    `;
  }

  async triggerImageClassification(imgEl, sampleHint = null) {
    const resultBox = document.getElementById('classificationResultBox');
    if (resultBox) {
      resultBox.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <div class="pulse-dot warning" style="margin: 0 auto 1rem auto; width: 14px; height: 14px;"></div>
          <h4 style="font-family: var(--font-serif-display); color: var(--color-primary-900);">Analyzing Visual Signatures...</h4>
          <p style="font-size: 0.82rem; color: var(--color-ink-muted);">Applying MobileNet feature extraction & campus segregation policies</p>
        </div>
      `;
    }

    // Simulate subtle visual scanning delay for realistic feel
    setTimeout(async () => {
      const result = await window.wasteClassifier.classifyImage(imgEl, sampleHint);
      this.renderClassificationResult(result);
    }, 850);
  }

  renderClassificationResult(res) {
    const resultBox = document.getElementById('classificationResultBox');
    if (!resultBox) return;

    const streamMeta = window.GREEN_CONFIG.streams[res.stream] || window.GREEN_CONFIG.streams.landfill;

    resultBox.innerHTML = `
      <div class="parchment-panel" style="animation: fadeIn 300ms ease;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <span class="stream-badge ${streamMeta.badgeClass}" style="margin-bottom: 0.4rem;">
              <i class="fa-solid ${streamMeta.icon}"></i> ${streamMeta.label}
            </span>
            <h3 style="font-family: var(--font-serif-display); font-size: 1.35rem; color: var(--color-primary-900); margin-top: 0.2rem;">
              ${res.itemName}
            </h3>
            <span style="font-size: 0.8rem; color: var(--color-ink-muted);">${res.subCategory || 'Standard Stream Item'}</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-gold-700); font-weight: 700;">AI Confidence</div>
            <div style="font-family: var(--font-sans); font-size: 1.45rem; font-weight: 800; color: #1B5E20;">${res.confidenceScore}%</div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid var(--color-parchment-border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
          <h5 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary-900); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-hand-holding-hand" style="color: var(--color-gold-600);"></i> Proper Segregation Instructions:
          </h5>
          <p style="font-size: 0.86rem; color: var(--color-ink-secondary); line-height: 1.5;">${res.prepGuide}</p>
          
          ${res.packagingSplit ? `
            <div style="margin-top: 0.65rem; padding: 0.6rem; background: var(--color-parchment-warm); border-left: 3px solid var(--color-gold-500); border-radius: 4px; font-size: 0.78rem;">
              <strong>Multi-Material Split:</strong> ${res.packagingSplit}
            </div>
          ` : ''}
        </div>

        <!-- Environmental Impact Metrics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="background: #FFFFFF; border: 1px solid var(--color-parchment-border); border-radius: var(--radius-md); padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: var(--color-ink-muted);"><i class="fa-solid fa-cloud-arrow-down" style="color: #2E7D32;"></i> CO₂e Avoided</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: #2E7D32;">-${res.co2Savings} kg</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid var(--color-parchment-border); border-radius: var(--radius-md); padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: var(--color-ink-muted);"><i class="fa-solid fa-hourglass-half" style="color: #B78103;"></i> Landfill Lifespan</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #1A2421;">${res.degradeTime}</div>
          </div>
        </div>

        <!-- Recommended Nearest Campus Bin -->
        ${res.nearestBin ? `
          <div style="background: linear-gradient(135deg, #FAF8F4 0%, #FFFFFF 100%); border: 1.5px solid var(--color-gold-400); border-radius: var(--radius-md); padding: 0.95rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-gold-700); font-weight: 700;">Nearest Available Bin</div>
              <h5 style="font-size: 0.92rem; color: var(--color-primary-900); font-weight: 700;">${res.nearestBin.name}</h5>
              <span style="font-size: 0.75rem; color: #73807B;">${res.nearestBin.id} • ${res.nearestBin.zone} (${res.nearestBin.currentFill}% full)</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.appUI.locateBinOnMap('${res.nearestBin.id}')">
              <i class="fa-solid fa-location-dot"></i> View on Map
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Manual query search results
  performManualSearch(query, categoryFilter = 'all') {
    const container = document.getElementById('manualSearchResults');
    if (!container || !window.wasteClassifier) return;

    const results = window.wasteClassifier.searchDatabase(query, categoryFilter);

    if (results.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-ink-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 1.8rem; margin-bottom: 0.5rem; opacity: 0.4;"></i>
          <p>No matching item found. Try keywords like "apple", "can", "pizza", "battery", or "plastic".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = results.map(item => {
      const streamMeta = window.GREEN_CONFIG.streams[item.stream] || window.GREEN_CONFIG.streams.landfill;
      return `
        <div class="manual-result-card" onclick="window.appUI.showManualItemDetails('${encodeURIComponent(item.name)}')">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <h5 style="font-size: 0.92rem; font-weight: 700; color: var(--color-primary-900); margin: 0;">${item.name}</h5>
            <span class="stream-badge ${streamMeta.badgeClass}"><i class="fa-solid ${streamMeta.icon}"></i> ${item.stream}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--color-ink-secondary); line-height: 1.4; margin-bottom: 0.35rem;">${item.prepGuide}</p>
          <div style="font-size: 0.72rem; color: var(--color-gold-700); font-style: italic;">
            <i class="fa-solid fa-lightbulb"></i> ${item.tips}
          </div>
        </div>
      `;
    }).join('');
  }

  showManualItemDetails(encodedName) {
    const name = decodeURIComponent(encodedName);
    const item = window.WASTE_DATABASE.find(i => i.name === name);
    if (!item) return;

    const nearestBin = window.wasteClassifier.findNearestAvailableBin(item.stream);
    this.renderClassificationResult({
      itemName: item.name,
      stream: item.stream,
      subCategory: item.subCategory,
      confidenceScore: '99.5',
      prepGuide: item.prepGuide,
      co2Savings: item.co2Savings,
      degradeTime: item.degradeTime,
      tips: item.tips,
      packagingSplit: item.packagingSplit,
      nearestBin: nearestBin
    });

    // Scroll smoothly to result box
    const box = document.getElementById('classificationResultBox');
    if (box) box.scrollIntoView({ behavior: 'smooth' });
  }

  // ----------------------------------------------------
  // Route Planner & Dispatch Views
  // ----------------------------------------------------
  renderRoutePlannerView() {
    const listContainer = document.getElementById('collectionQueueList');
    const statsContainer = document.getElementById('routeStatsCard');
    if (!listContainer || !window.routeOptimizer) return;

    const qualifyingBins = window.routeOptimizer.generateCollectionList();

    if (qualifyingBins.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--color-ink-muted);">
          <i class="fa-solid fa-circle-check" style="font-size: 2.2rem; color: #2E7D32; margin-bottom: 0.75rem;"></i>
          <h4 style="font-family: var(--font-serif-display); color: var(--color-primary-900);">All Campus Bins Nominal</h4>
          <p style="font-size: 0.84rem; margin-top: 0.25rem;">No bins currently exceed the ${window.appState.settings.pickupThreshold}% threshold. Campus waste levels are optimal.</p>
          <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="window.sensorSim.triggerCriticalOverflow()">
            <i class="fa-solid fa-bolt"></i> Simulate High-Volume Overflow Event
          </button>
        </div>
      `;
      if (statsContainer) statsContainer.style.display = 'none';
      return;
    }

    if (statsContainer) statsContainer.style.display = 'block';

    // Render Bins in queue
    listContainer.innerHTML = qualifyingBins.map((bin, idx) => {
      const streamMeta = window.GREEN_CONFIG.streams[bin.stream] || window.GREEN_CONFIG.streams.landfill;
      const isCritical = bin.currentFill >= 80;

      return `
        <div class="queue-item-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="queue-number">#${idx + 1}</span>
              <div>
                <strong style="font-size: 0.9rem; color: var(--color-primary-900);">${bin.name}</strong>
                <span style="font-size: 0.72rem; color: #73807B; display: block;">${bin.id} • ${bin.zone}</span>
              </div>
            </div>
            <span class="status-pill ${isCritical ? 'critical' : 'warning'}">${bin.currentFill}% Full</span>
          </div>
          
          <div class="fill-bar-wrapper" style="margin: 0.4rem 0;">
            <div class="fill-bar-inner ${isCritical ? 'critical' : 'warning'}" style="width: ${bin.currentFill}%;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--color-ink-muted);">
            <span><i class="fa-solid ${streamMeta.icon}"></i> ${streamMeta.label}</span>
            <span>Est. Vol: <strong>${Math.round((bin.capacity * bin.currentFill) / 100)} L</strong> (${bin.weightKg} kg)</span>
          </div>
        </div>
      `;
    }).join('');

    // Pre-calculate optimized route metrics
    const route = window.routeOptimizer.computeOptimizedRoute(qualifyingBins);
    this.updateRouteComparisonDisplay(route);
  }

  updateRouteComparisonDisplay(route) {
    const summaryBox = document.getElementById('routeComparisonSummary');
    if (!summaryBox || !route) return;

    summaryBox.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="background: #FFFFFF; border: 1px solid var(--color-parchment-border); border-radius: var(--radius-md); padding: 0.85rem; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--color-ink-muted); text-transform: uppercase;">Optimized Distance</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-800);">${route.totalDistanceKm} km</div>
          <span style="font-size: 0.72rem; color: #2E7D32; font-weight: 700;">-${route.savingsPercent}% vs Unoptimized</span>
        </div>
        <div style="background: #FFFFFF; border: 1px solid var(--color-parchment-border); border-radius: var(--radius-md); padding: 0.85rem; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--color-ink-muted); text-transform: uppercase;">Fuel Saved</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #2E7D32;">${route.fuelSavedLiters} L</div>
          <span style="font-size: 0.72rem; color: var(--color-ink-muted);">-$${route.fuelCostSavedUsd} Saved</span>
        </div>
        <div style="background: #FFFFFF; border: 1px solid var(--color-parchment-border); border-radius: var(--radius-md); padding: 0.85rem; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--color-ink-muted); text-transform: uppercase;">Emissions Averted</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #2E7D32;">-${route.co2PreventedKg} kg</div>
          <span style="font-size: 0.72rem; color: var(--color-ink-muted);">CO₂e Reduction</span>
        </div>
      </div>

      <div style="background: var(--color-parchment-warm); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
          <span>Truck Compactor Payload: <strong>${route.totalLitersToCollect} / 1500 L</strong></span>
          <strong>${route.truckLoadPercent}% Load</strong>
        </div>
        <div class="fill-bar-wrapper">
          <div class="fill-bar-inner ${route.truckLoadPercent > 90 ? 'critical' : 'normal'}" style="width: ${route.truckLoadPercent}%;"></div>
        </div>
      </div>
    `;
  }

  // Visualize route on map & trigger driver dispatch runner
  visualizeOptimizedRoute() {
    const qualifyingBins = window.routeOptimizer.generateCollectionList();
    if (qualifyingBins.length === 0) {
      this.showToast('No Bins in Queue', 'All bins are currently below pickup threshold.', 'warning');
      return;
    }

    const route = window.routeOptimizer.computeOptimizedRoute(qualifyingBins);

    // Switch to Map tab
    this.switchTab('map');

    // Draw route polyline and waypoint markers
    window.campusMap.drawPickupRoute(route.waypoints);

    this.showToast(
      '🗺️ Route Plotted',
      `Optimized ${route.totalDistanceKm} km roundtrip path visiting ${route.stopsCount} bins.`,
      'success'
    );
  }

  // Live Driver Simulation Run
  startDriverDispatchSimulation() {
    const qualifyingBins = window.routeOptimizer.generateCollectionList();
    if (qualifyingBins.length === 0) {
      this.showToast('No Bins in Queue', 'No bins require collection at this time.', 'warning');
      return;
    }

    const route = window.routeOptimizer.computeOptimizedRoute(qualifyingBins);
    this.switchTab('map');
    window.campusMap.drawPickupRoute(route.waypoints);

    const dispatchBanner = document.getElementById('driverDispatchBanner');
    if (dispatchBanner) {
      dispatchBanner.style.display = 'flex';
      dispatchBanner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div class="pulse-dot" style="width: 12px; height: 12px;"></div>
          <div>
            <strong>EcoTruck Compactor #01 Active</strong>
            <span style="display: block; font-size: 0.78rem; color: #4A5652;" id="dispatchStopInfo">Heading to Stop #1...</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-gold btn-sm" id="btnNextStop" onclick="window.appUI.stepDriverDispatch()">
            <i class="fa-solid fa-arrow-right"></i> Collect & Next Stop
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.appUI.cancelDriverDispatch()">
            Cancel
          </button>
        </div>
      `;
    }

    window.routeOptimizer.startDispatchRun(route, (idx, waypoint) => {
      this.updateDispatchStepUI(idx, waypoint);
    }, (historyEntry) => {
      if (dispatchBanner) dispatchBanner.style.display = 'none';
      window.campusMap.clearRoute();
      this.renderRoutePlannerView();
    });
  }

  stepDriverDispatch() {
    const dispatchBanner = document.getElementById('driverDispatchBanner');
    window.routeOptimizer.advanceToNextStop((idx, waypoint) => {
      this.updateDispatchStepUI(idx, waypoint);
    }, (historyEntry) => {
      if (dispatchBanner) dispatchBanner.style.display = 'none';
      window.campusMap.clearRoute();
      this.renderRoutePlannerView();
    });
  }

  updateDispatchStepUI(idx, waypoint) {
    const info = document.getElementById('dispatchStopInfo');
    if (info) {
      info.textContent = `At Stop #${idx}: ${waypoint.name} (${waypoint.details})`;
    }

    // Pan map to current stop
    window.campusMap.map.panTo([waypoint.lat, waypoint.lng]);
  }

  cancelDriverDispatch() {
    window.routeOptimizer.cancelDispatch();
    const dispatchBanner = document.getElementById('driverDispatchBanner');
    if (dispatchBanner) dispatchBanner.style.display = 'none';
    window.campusMap.clearRoute();
    this.showToast('Dispatch Cancelled', 'Driver collection run was stopped.', 'warning');
  }

  // ----------------------------------------------------
  // Bins Inventory Table
  // ----------------------------------------------------
  renderBinsTable(filterStream = 'all', searchTerm = '') {
    const tbody = document.getElementById('binsTableBody');
    if (!tbody) return;

    let bins = window.appState.bins;

    if (filterStream !== 'all') {
      bins = bins.filter(b => b.stream === filterStream);
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      bins = bins.filter(b => b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.zone.toLowerCase().includes(q));
    }

    tbody.innerHTML = bins.map(b => {
      const streamMeta = window.GREEN_CONFIG.streams[b.stream] || window.GREEN_CONFIG.streams.landfill;
      const isCritical = b.currentFill >= 80;
      const isWarning = b.currentFill >= 60 && !isCritical;
      const statusClass = isCritical ? 'critical' : (isWarning ? 'warning' : 'normal');

      return `
        <tr>
          <td>
            <strong style="color: var(--color-primary-900); font-family: monospace;">${b.id}</strong>
          </td>
          <td>
            <strong>${b.name}</strong>
            <span style="display: block; font-size: 0.74rem; color: #73807B;">${b.zone}</span>
          </td>
          <td>
            <span class="stream-badge ${streamMeta.badgeClass}">
              <i class="fa-solid ${streamMeta.icon}"></i> ${streamMeta.label}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div class="fill-bar-wrapper" style="width: 80px;">
                <div class="fill-bar-inner ${statusClass}" style="width: ${b.currentFill}%;"></div>
              </div>
              <strong style="font-size: 0.85rem; color: ${isCritical ? '#C62828' : '#1B4D36'};">${b.currentFill}%</strong>
            </div>
            <span style="font-size: 0.72rem; color: #73807B;">${Math.round((b.capacity * b.currentFill) / 100)} / ${b.capacity} L</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              ${isCritical ? 'Critical' : (isWarning ? 'Warning' : 'Normal')}
            </span>
          </td>
          <td style="font-size: 0.78rem; color: #4A5652;">
            <div><i class="fa-solid fa-battery-three-quarters" style="color: #2E7D32;"></i> ${b.battery}%</div>
            <span style="font-size: 0.72rem; color: #73807B;">${b.lastPing}</span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-secondary btn-sm" onclick="window.appUI.locateBinOnMap('${b.id}')" title="Locate on Map">
                <i class="fa-solid fa-map-location-dot"></i>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.appUI.openBinDetails('${b.id}')" title="Adjust Telemetry">
                <i class="fa-solid fa-sliders"></i>
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.appState.emptyBin('${b.id}'); window.appUI.showToast('Bin Emptied', '${b.id} cleared to 0%', 'success');" title="Empty Bin">
                <i class="fa-solid fa-trash-arrow-up"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ----------------------------------------------------
  // Modals & User Actions
  // ----------------------------------------------------
  bindModals() {
    // Open Register Bin Modal
    const btnOpenRegister = document.getElementById('btnOpenRegisterBin');
    if (btnOpenRegister) {
      btnOpenRegister.addEventListener('click', () => {
        this.openModal('modalRegisterBin');
      });
    }

    // Close Modal buttons
    document.querySelectorAll('.modal-close-trigger').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });

    // Pick location on map button
    const btnPickCoords = document.getElementById('btnPickCoordsOnMap');
    if (btnPickCoords) {
      btnPickCoords.addEventListener('click', () => {
        this.closeModal('modalRegisterBin');
        this.switchTab('map');
        this.showToast('Click Campus Map', 'Click anywhere on the map to set coordinates for this bin.', 'warning');
        window.campusMap.setPickLocationMode(true, (lat, lng) => {
          document.getElementById('newBinLat').value = lat.toFixed(6);
          document.getElementById('newBinLng').value = lng.toFixed(6);
          this.openModal('modalRegisterBin');
          this.showToast('Coordinates Set', `Pinned at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`, 'success');
        });
      });
    }

    // Submit new bin form
    const formRegister = document.getElementById('formRegisterBin');
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBinData = {
          name: document.getElementById('newBinName').value,
          zone: document.getElementById('newBinZone').value,
          stream: document.getElementById('newBinStream').value,
          capacity: Number(document.getElementById('newBinCapacity').value),
          currentFill: Number(document.getElementById('newBinFill').value || 15),
          lat: Number(document.getElementById('newBinLat').value || 37.4275),
          lng: Number(document.getElementById('newBinLng').value || -122.1697),
          sensorType: document.getElementById('newBinSensorType').value
        };

        const created = window.appState.addBin(newBinData);
        this.closeModal('modalRegisterBin');
        formRegister.reset();
        this.showToast('Bin Registered', `${created.name} (${created.id}) registered into network.`, 'success');
        this.locateBinOnMap(created.id);
      });
    }

    // Bin Inspector Save Changes
    const btnSaveTelemetry = document.getElementById('btnSaveBinTelemetry');
    if (btnSaveTelemetry) {
      btnSaveTelemetry.addEventListener('click', () => {
        const binId = document.getElementById('inspectBinId').value;
        const newFill = Number(document.getElementById('inspectBinFillSlider').value);
        window.appState.updateBinFill(binId, newFill);
        this.closeModal('modalInspectBin');
        this.showToast('Telemetry Updated', `${binId} fill level updated to ${newFill}%.`, 'success');
      });
    }

    // Slider real-time label update
    const slider = document.getElementById('inspectBinFillSlider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const valEl = document.getElementById('inspectBinFillVal');
        if (valEl) valEl.textContent = `${e.target.value}%`;
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  openBinDetails(binId) {
    const bin = window.appState.getBinById(binId);
    if (!bin) return;

    document.getElementById('inspectBinId').value = bin.id;
    document.getElementById('inspectBinTitle').textContent = `${bin.name} (${bin.id})`;
    document.getElementById('inspectBinFillSlider').value = bin.currentFill;
    document.getElementById('inspectBinFillVal').textContent = `${bin.currentFill}%`;
    document.getElementById('inspectBinZone').textContent = bin.zone;
    document.getElementById('inspectBinStream').textContent = bin.stream.toUpperCase();
    document.getElementById('inspectBinCapacity').textContent = `${bin.capacity} Liters`;
    document.getElementById('inspectBinBattery').textContent = `${bin.battery}%`;

    this.openModal('modalInspectBin');
  }

  locateBinOnMap(binId) {
    this.switchTab('map');
    window.campusMap.flyToBin(binId);
  }

  // ----------------------------------------------------
  // Toast Helper
  // ----------------------------------------------------
  showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}" style="font-size: 1.15rem; color: ${type === 'success' ? '#2E7D32' : (type === 'warning' ? '#E65100' : '#C62828')}; margin-top: 2px;"></i>
      <div class="toast-content">
        <h5>${title}</h5>
        <p>${message}</p>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Global UI instance
window.appUI = new GreenTrackUI();

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.appUI.init();
});
