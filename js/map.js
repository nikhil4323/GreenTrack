/**
 * GreenTrack - Leaflet Map Manager & Geospatial Visualizer
 */

class CampusMapManager {
  constructor() {
    this.map = null;
    this.markersLayer = null;
    this.routeLayer = null;
    this.depotMarker = null;
    this.truckMarker = null;
    this.binMarkers = new Map(); // id -> L.marker
    this.pickLocationMode = false;
    this.onLocationPicked = null;
  }

  init(containerId = 'campusMap') {
    if (this.map) return; // already initialized

    const config = window.GREEN_CONFIG.map;
    
    // Create Leaflet instance
    this.map = L.map(containerId, {
      center: config.center,
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      zoomControl: false // we reposition zoom control to top-right
    });

    // Custom zoom control in bottom-right or top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Add CartoDB Voyager tiles (classic parchment/crisp aesthetic)
    L.tileLayer(config.tileLayer, {
      attribution: config.attribution,
      maxZoom: 19
    }).addTo(this.map);

    // Layer groups for markers and routing
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    // Add Central Facilities Depot
    this.renderDepot();

    // Render initial bins
    this.renderAllBins();

    // Map click handler (for registering new bin coordinates)
    this.map.on('click', (e) => {
      if (this.pickLocationMode && this.onLocationPicked) {
        this.onLocationPicked(e.latlng.lat, e.latlng.lng);
        this.setPickLocationMode(false);
      }
    });

    // Listen to reactive state updates
    window.appState.on('bins-updated', () => this.renderAllBins());
    window.appState.on('bin-added', () => this.renderAllBins());
    window.appState.on('bin-deleted', () => this.renderAllBins());
    window.appState.on('bins-reset', () => this.renderAllBins());
    window.appState.on('bin-fill-changed', (bin) => this.updateMarker(bin));
    window.appState.on('bin-emptied', (bin) => this.updateMarker(bin));
  }

  renderDepot() {
    const depot = window.GREEN_CONFIG.map.depot;
    const depotHtml = `
      <div class="depot-marker" title="${depot.name}">
        <i class="fa-solid fa-warehouse"></i>
      </div>
    `;

    const depotIcon = L.divIcon({
      html: depotHtml,
      className: 'depot-div-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.depotMarker = L.marker([depot.lat, depot.lng], { icon: depotIcon })
      .addTo(this.map)
      .bindPopup(`
        <div class="popup-plaque">
          <div class="popup-header">
            <h4>${depot.name}</h4>
            <span class="status-pill normal"><i class="fa-solid fa-truck"></i> Fleet Base</span>
          </div>
          <div class="popup-body">
            <p style="font-size: 0.8rem; color: #4A5652; margin-bottom: 0.5rem;">${depot.description}</p>
            <div class="popup-metric-row">
              <span class="popup-metric-label">Active EcoTrucks:</span>
              <span class="popup-metric-val">2 Hybrid Compactors</span>
            </div>
            <div class="popup-metric-row">
              <span class="popup-metric-label">Truck Capacity:</span>
              <span class="popup-metric-val">${window.GREEN_CONFIG.fleet.truckCapacityLiters} Liters</span>
            </div>
          </div>
        </div>
      `);
  }

  renderAllBins(filterStream = null, filterStatus = null) {
    this.markersLayer.clearLayers();
    this.binMarkers.clear();

    const bins = window.appState.bins;
    bins.forEach(bin => {
      // Apply stream filter
      if (filterStream && filterStream !== 'all' && bin.stream !== filterStream) return;

      // Apply status filter
      if (filterStatus && filterStatus !== 'all') {
        const isCritical = bin.currentFill >= window.GREEN_CONFIG.thresholds.criticalMin;
        const isWarning = bin.currentFill >= 60 && bin.currentFill < 80;
        const isNormal = bin.currentFill < 60;
        if (filterStatus === 'critical' && !isCritical) return;
        if (filterStatus === 'warning' && !isWarning) return;
        if (filterStatus === 'normal' && !isNormal) return;
      }

      this.createBinMarker(bin);
    });
  }

  createBinMarker(bin) {
    const isCritical = bin.currentFill >= window.GREEN_CONFIG.thresholds.criticalMin;
    const isWarning = bin.currentFill >= 60 && !isCritical;
    const streamMeta = window.GREEN_CONFIG.streams[bin.stream] || window.GREEN_CONFIG.streams.landfill;

    const markerHtml = `
      <div class="custom-bin-marker ${isCritical ? 'critical' : ''}" data-bin-id="${bin.id}">
        <div class="bin-pin ${bin.stream}">
          <div class="bin-pin-icon">
            <i class="fa-solid ${streamMeta.icon}"></i>
          </div>
          <div class="bin-pin-badge" style="background: ${isCritical ? '#C62828' : isWarning ? '#E65100' : '#1B5E20'}; color: #FFF;">
            ${bin.currentFill}%
          </div>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'bin-div-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    const marker = L.marker([bin.lat, bin.lng], { icon: customIcon });

    marker.bindPopup(this.createPopupContent(bin));
    marker.on('click', () => {
      window.appState.selectedBinId = bin.id;
    });

    this.markersLayer.addLayer(marker);
    this.binMarkers.set(bin.id, marker);
  }

  updateMarker(bin) {
    const marker = this.binMarkers.get(bin.id);
    if (marker) {
      const isCritical = bin.currentFill >= window.GREEN_CONFIG.thresholds.criticalMin;
      const isWarning = bin.currentFill >= 60 && !isCritical;
      const streamMeta = window.GREEN_CONFIG.streams[bin.stream] || window.GREEN_CONFIG.streams.landfill;

      const markerHtml = `
        <div class="custom-bin-marker ${isCritical ? 'critical' : ''}" data-bin-id="${bin.id}">
          <div class="bin-pin ${bin.stream}">
            <div class="bin-pin-icon">
              <i class="fa-solid ${streamMeta.icon}"></i>
            </div>
            <div class="bin-pin-badge" style="background: ${isCritical ? '#C62828' : isWarning ? '#E65100' : '#1B5E20'}; color: #FFF;">
              ${bin.currentFill}%
            </div>
          </div>
        </div>
      `;

      const newIcon = L.divIcon({
        html: markerHtml,
        className: 'bin-div-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      marker.setIcon(newIcon);
      marker.setPopupContent(this.createPopupContent(bin));
    }
  }

  createPopupContent(bin) {
    const streamMeta = window.GREEN_CONFIG.streams[bin.stream] || window.GREEN_CONFIG.streams.landfill;
    const isCritical = bin.currentFill >= window.GREEN_CONFIG.thresholds.criticalMin;
    const isWarning = bin.currentFill >= 60 && !isCritical;
    const statusClass = isCritical ? 'critical' : (isWarning ? 'warning' : 'normal');
    const statusText = isCritical ? 'Urgent Pickup' : (isWarning ? 'Filling Up' : 'Optimal');

    return `
      <div class="popup-plaque">
        <div class="popup-header">
          <div>
            <h4>${bin.name}</h4>
            <span style="font-size: 0.72rem; color: #73807B; font-family: monospace;">${bin.id} • ${bin.zone}</span>
          </div>
          <span class="status-pill ${statusClass}">${statusText}</span>
        </div>
        <div class="popup-body">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <span class="stream-badge ${streamMeta.badgeClass}"><i class="fa-solid ${streamMeta.icon}"></i> ${streamMeta.label}</span>
            <span style="font-weight: 800; font-size: 1.1rem; color: ${isCritical ? '#C62828' : '#1B4D36'};">${bin.currentFill}% Full</span>
          </div>
          
          <div class="fill-bar-wrapper" style="margin-bottom: 0.85rem;">
            <div class="fill-bar-inner ${statusClass}" style="width: ${bin.currentFill}%;"></div>
          </div>

          <div class="popup-metric-row">
            <span class="popup-metric-label">Estimated Volume:</span>
            <span class="popup-metric-val">${Math.round((bin.capacity * bin.currentFill) / 100)} / ${bin.capacity} L</span>
          </div>
          <div class="popup-metric-row">
            <span class="popup-metric-label">Load Weight:</span>
            <span class="popup-metric-val">${bin.weightKg} kg</span>
          </div>
          <div class="popup-metric-row">
            <span class="popup-metric-label">Sensor Telemetry:</span>
            <span class="popup-metric-val" style="color: #2E7D32;"><i class="fa-solid fa-wifi"></i> ${bin.sensorType} (${bin.battery}% bat)</span>
          </div>
          <div class="popup-metric-row">
            <span class="popup-metric-label">Last Ping:</span>
            <span class="popup-metric-val">${bin.lastPing}</span>
          </div>
        </div>
        <div class="popup-actions">
          <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="window.appUI.openBinDetails('${bin.id}')">
            <i class="fa-solid fa-sliders"></i> Adjust
          </button>
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.appState.emptyBin('${bin.id}'); window.appUI.showToast('Bin Emptied', '${bin.id} reset to 0% fill level', 'success');">
            <i class="fa-solid fa-trash-arrow-up"></i> Empty
          </button>
        </div>
      </div>
    `;
  }

  // Draw pickup route on the map
  drawPickupRoute(routeWaypoints, animated = true) {
    this.routeLayer.clearLayers();

    if (!routeWaypoints || routeWaypoints.length < 2) return;

    const latlngs = routeWaypoints.map(wp => [wp.lat, wp.lng]);

    // Outer glow polyline
    L.polyline(latlngs, {
      color: '#10B981',
      weight: 8,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.routeLayer);

    // Inner distinct dash polyline
    const routeLine = L.polyline(latlngs, {
      color: '#143D2B',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.routeLayer);

    // Add numbered waypoint markers (#1, #2, #3, ...)
    routeWaypoints.forEach((wp, index) => {
      const isDepot = wp.isDepot;
      const waypointHtml = `
        <div class="waypoint-marker ${isDepot ? 'depot-waypoint' : ''}">
          ${index === 0 ? '<i class="fa-solid fa-flag-checkered"></i>' : index}
        </div>
      `;

      const wpIcon = L.divIcon({
        html: waypointHtml,
        className: 'wp-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker([wp.lat, wp.lng], { icon: wpIcon })
        .addTo(this.routeLayer)
        .bindPopup(`<b>Stop #${index}: ${wp.name}</b><br>${wp.details || ''}`);
    });

    // Zoom map to fit the route
    this.map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  }

  clearRoute() {
    this.routeLayer.clearLayers();
    if (this.truckMarker) {
      this.map.removeLayer(this.truckMarker);
      this.truckMarker = null;
    }
  }

  // Fly to specific bin
  flyToBin(binId) {
    const bin = window.appState.getBinById(binId);
    if (!bin) return;

    this.map.flyTo([bin.lat, bin.lng], 18, {
      duration: 1.2
    });

    setTimeout(() => {
      const marker = this.binMarkers.get(binId);
      if (marker) marker.openPopup();
    }, 1250);
  }

  recenter() {
    this.map.setView(window.GREEN_CONFIG.map.center, window.GREEN_CONFIG.map.zoom);
  }

  setPickLocationMode(active, callback = null) {
    this.pickLocationMode = active;
    this.onLocationPicked = callback;
    const container = document.getElementById('campusMap');
    if (container) {
      container.style.cursor = active ? 'crosshair' : '';
    }
  }
}

// Global Map Manager singleton
window.campusMap = new CampusMapManager();
