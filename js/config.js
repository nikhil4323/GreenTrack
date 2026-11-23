/**
 * GreenTrack - Configuration & Global Constants
 */

window.GREEN_CONFIG = {
  appName: "GreenTrack",
  campusName: "Oakridge University Campus & EcoDistrict",
  tagline: "Waste Segregation & Intelligent Pickup Routing System",

  // Campus Geospatial Center (Oakridge Campus grounds - scenic university setting)
  map: {
    center: [37.4275, -122.1697], // Beautiful collegiate campus coordinates
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    tileLayer: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    depot: {
      id: "DEPOT-CENTRAL",
      name: "Central Resource Recovery & Fleet Depot",
      lat: 37.4225,
      lng: -122.1620,
      description: "Truck departure and material recovery transfer facility"
    }
  },

  // Waste Streams
  streams: {
    organic: {
      id: "organic",
      label: "Organic & Compost",
      color: "#2D6A4F",
      badgeClass: "stream-organic",
      icon: "fa-leaf",
      densityKgPerLiter: 0.45,
      description: "Food scraps, coffee grounds, compostable food packaging, plant clippings"
    },
    recyclable: {
      id: "recyclable",
      label: "Dry Recyclables",
      color: "#1D6996",
      badgeClass: "stream-recyclable",
      icon: "fa-recycle",
      densityKgPerLiter: 0.12,
      description: "Clean plastics (PET #1, HDPE #2), aluminum beverage cans, glass bottles, metal tins"
    },
    paper: {
      id: "paper",
      label: "Paper & Cardboard",
      color: "#995D13",
      badgeClass: "stream-paper",
      icon: "fa-box-archive",
      densityKgPerLiter: 0.18,
      description: "Office paper, corrugated cardboard boxes, notebooks, clean newspapers"
    },
    ewaste: {
      id: "ewaste",
      label: "E-Waste & Batteries",
      color: "#8A1C14",
      badgeClass: "stream-ewaste",
      icon: "fa-bolt-lightning",
      densityKgPerLiter: 0.65,
      description: "Lithium batteries, small consumer electronics, fluorescent bulbs, power cables"
    },
    landfill: {
      id: "landfill",
      label: "Residual Landfill",
      color: "#3E444A",
      badgeClass: "stream-landfill",
      icon: "fa-trash-can",
      densityKgPerLiter: 0.30,
      description: "Non-recyclable wrappers, soiled film plastics, broken ceramics, sanitary waste"
    }
  },

  // Telemetry Thresholds
  thresholds: {
    normalMax: 59,
    warningMax: 79,
    criticalMin: 80,
    overflowTrigger: 85
  },

  // Fleet & Fleet Routing Constants
  fleet: {
    truckCapacityLiters: 1500,
    fuelConsumptionLitersPerKm: 0.22,
    costPerLiterFuel: 1.45, // USD
    co2KgPerLiterDiesel: 2.68,
    speedKmH: 22 // Campus speed limit
  }
};
