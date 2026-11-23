# GreenTrack — Waste Segregation & Collection Optimizer

> **A Smart Waste Management & Route Optimization Platform for Campuses & EcoDistricts**  
> *Crafted with a timeless classic heritage aesthetic and tactile modern textures.*

---

## 🏛️ Executive Summary

**GreenTrack** is an intelligent waste segregation, bin monitoring, and collection routing platform tailored for university campuses and modern residential eco-districts. It unifies edge IoT sensor telemetry, client-side computer vision waste categorization, and Traveling Salesperson (TSP) route optimization to solve two critical operational failures in municipal/campus waste management:
1. **Preventing Overflowing Bins:** Real-time continuous fill monitoring with automatic alerts before bins spill onto walkways.
2. **Eliminating Unnecessary Trips:** Dynamic collection lists that dispatch compactor trucks only to bins that genuinely need emptying, computing the shortest, most fuel-efficient route.

---

## ✨ Key Features & Capabilities

### 1. 🔍 AI & Manual Waste Categorization Engine
- **Visual Image Classification:**
  - Integrated with **TensorFlow.js & MobileNet** for client-side visual classification with automatic heuristic computer vision fallback.
  - Optical scanning viewport with laser scan animation and crosshair telemetry.
  - **1-Click Test Presets:** Instant evaluation with 6 pre-built vector samples:
    - *Clear PET Plastic Water Bottle* (Recyclable #1)
    - *Fresh Banana Peel* (Organic Compost)
    - *Corrugated Shipping Box* (Paper & Cardboard)
    - *Lithium-Ion / Alkaline Battery* (Hazardous E-Waste)
    - *Disposable Coffee Cup with Plastic Lid* (Composite Landfill / Split Guide)
    - *Aluminum Soda Can* (Recyclable Metal)
  - Custom file upload via drag-and-drop or file selector.
- **Deep Segregation Guidance:**
  - AI confidence score (e.g. 97.4%).
  - Multi-material split breakdown (e.g., separating coffee cup lid, paper cup, and cardboard sleeve).
  - Preparation directives (rinse, crush, tape battery terminals).
  - Environmental ESG metrics: Avoided $\text{CO}_2\text{e}$ in kilograms and estimated landfill decomposition time.
  - **Nearest Available Bin:** Automatically identifies the nearest campus bin matching the waste stream that has available capacity ($<85\%$), with a 1-click **"View on Map"** locator.
- **Manual 150+ Item Campus Waste Catalog:**
  - Fast instant search bar with stream filter pills.
  - Categorized directory spanning organics, dry recyclables, paper, e-waste, and landfill residuals.

---

### 2. 🗺️ Interactive Campus Map & Live Bin Monitoring
- **Geospatial Campus View:**
  - Built with **Leaflet.js** and CartoDB Voyager tiles, styled with classic warm ivory tones and heritage architectural borders.
  - Custom SVG bin markers color-coded by stream:
    - 🟢 **Organic & Compost** (`#2D6A4F`)
    - 🔵 **Dry Recyclables** (`#1D6996`)
    - 🟡 **Paper & Cardboard** (`#995D13`)
    - 🔴 **E-Waste & Batteries** (`#8A1C14`)
    - ⚫ **Residual Landfill** (`#3E444A`)
  - **Live Dynamic Gauges:** Real-time fill percentage badges ($0\%$ to $100\%$) and pulsing critical warning rings when fill reaches $\ge 80\%$.
  - **Central Recovery Depot Marker:** Marks the fleet departure and material recovery transfer facility.
  - **Interactive Popups:** Custom classic plaques showing bin name, zone, volume (L), weight (kg), IoT sensor model, battery level, last ping, with quick actions to **Empty** or **Adjust**.

---

### 3. 📡 Sensor Feed & Clearly Labelled Simulation Engine
- **Telemetry Mode Indicator:**
  - Prominent header pill: `Sensor Feed: Simulated Live Telemetry (Active)`.
- **Automated Live Simulation:**
  - Subtle natural waste accumulation jitter every 4 seconds.
  - Automatic threshold notifications when bins reach critical fill.
- **Preset Telemetry Scenarios:**
  - 🍱 *Dining Commons Lunch Rush:* Spikes dining bins by $+25\text{--}35\%$.
  - 🎉 *Campus Athletics Surge:* Spikes quad and arena recyclables by $+30\text{--}40\%$.
  - 🚨 *Critical 95% Overflow Injection:* Sets 5 key campus receptacles to urgent pickup status.
  - ✨ *Baseline Nominal Reset:* Restores all bins to nominal operational levels ($15\text{--}35\%$).
- **Manual Telemetry Override:**
  - Interactive slider in the Bin Inspector to test any fill level ($0\text{--}100\%$) on the fly.

---

### 4. 🚚 TSP Pickup Route Optimizer & Driver Dispatch
- **Dynamic Collection Queue:**
  - Auto-flags bins exceeding the pickup threshold ($\ge 75\%$).
  - Calculates total accumulated liters and checks against the compactor truck's rated capacity ($1,500\text{ L}$).
- **Algorithmic TSP Solver:**
  - Starts and concludes at the **Central Resource Recovery Depot**.
  - Employs **Nearest-Neighbor heuristic with 2-Opt local search refinement** to eliminate crossing paths.
  - Haversine geodesic calculations with campus roadway multipliers.
- **Efficiency & ESG Impact Benchmarking:**
  - Compares the optimized route against an uncoordinated traditional pickup run.
  - Reports **Distance Saved (km and %)**, **Fuel Saved (L)**, **Operational Cost Reduction (\$)**, and **Avoided $\text{CO}_2\text{e}$ Emissions (kg)**.
- **Live Driver Dispatch Simulator:**
  - Step-by-step interactive collection run that animates the route on the map.
  - Audio chimes synthesized via the **Web Audio API** upon arriving and emptying each receptacle.
  - Victory fanfare upon finishing the loop, logging the trip directly into the persistent history table.

---

### 5. 📊 ESG Sustainability & Fleet Analytics
- **Visual Chart Dashboards (Chart.js):**
  1. *Waste Stream Composition:* Donut chart of mass breakdown by stream in kilograms.
  2. *Hourly Fill Velocity:* 24-hour accumulation curves highlighting dining lunch rush and dorm peaks.
  3. *Fleet Route Efficiency:* Bar comparison of traditional vs. GreenTrack TSP mileage, fuel, and emissions.
  4. *Campus Zone Distribution:* Horizontal bar chart of accumulated waste volume across campus sectors.
- **Auditing & Reporting:**
  - Complete history log of past collection runs.
  - **1-Click CSV Export:** Downloads a complete audit log of all registered receptacles and their sensor telemetry.
  - **Print-Ready ESG Report:** Formatted for archival sustainability reviews.

---

### 6. 📋 Bin Registry & Inventory Management
- Register new bins with location name, campus zone, waste stream, container capacity, initial fill, and sensor type.
- **Interactive Map Pin Picker:** Click anywhere on the Leaflet campus map to automatically populate latitude and longitude coordinates.
- Full local persistence via **Browser LocalStorage** with a **"Reset Demo Data"** safety trigger.

---

## 🎨 Design Philosophy: Classic Design with Modern Texture

GreenTrack deliberately departs from generic flat software dashboards by adopting an architectural, heritage aesthetic:
- **Classic Typography:** Google Fonts `Cinzel` for formal crests and section titles, `Newsreader` for archival sub-labels, and `Plus Jakarta Sans` / `JetBrains Mono` for crisp telemetry readouts.
- **Earthy Botanical Palette:** Deep heritage forest green (`#143D2B`), warm antique brass/gold (`#C59B51`), crisp parchment stone (`#F7F5F0`), and vintage card cream (`#FAF8F4`).
- **Tactile Textures:**
  - Procedural SVG fractal noise grain overlay.
  - Double hairline rules and heraldic dashed borders.
  - Beveled physical buttons with metallic edge highlights.
  - Frosted glassmorphism floating toolbars (`backdrop-filter: blur(12px)`).
  - Fluid SVG wave cylinder gauges with smooth CSS cubic-bezier transitions.

---

## 🚀 How to Run the Platform

The application has **zero runtime dependencies** (no Node.js, Python, or npm installation needed). It runs directly in any modern web browser.

1. Navigate to the project directory:
   `c:\Users\NIKHIL VERMA\OneDrive\Desktop\Test Report`
2. Double-click or open **`index.html`** in **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Safari**.
3. Explore the live interactive platform:
   - Click **AI Classifier** and click any of the 6 test sample cards to watch optical recognition in action.
   - Click **Route Optimizer** and test **"Simulate Driver Run"** to see the compactor truck visit and empty bins.
   - Click **Sensor Scenarios** to simulate a lunch rush or high-traffic festival.
   - Click **ESG Analytics** to inspect live Chart.js graphs and export the CSV audit report.

---

*GreenTrack — Engineered for sustainable campuses and zero-waste communities.*
