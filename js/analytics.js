/**
 * GreenTrack - Sustainability & Collection Analytics Engine
 * Chart.js visualizations, ESG performance counters, and report generation
 */

class AnalyticsManager {
  constructor() {
    this.charts = {
      composition: null,
      trends: null,
      efficiency: null,
      zones: null
    };
  }

  init() {
    if (typeof Chart === 'undefined') {
      console.warn("Chart.js not loaded yet, will re-attempt when ready.");
      return;
    }

    // Classic font and color defaults for Chart.js
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = "#4A5652";

    this.renderCompositionChart();
    this.renderTrendsChart();
    this.renderEfficiencyChart();
    this.renderZoneChart();
    this.renderHistoryTable();

    // Re-render when state changes
    window.appState.on('bins-updated', () => this.refreshAll());
    window.appState.on('history-updated', () => {
      this.refreshAll();
      this.renderHistoryTable();
    });
  }

  refreshAll() {
    if (this.charts.composition) this.updateCompositionChart();
    if (this.charts.zones) this.updateZoneChart();
  }

  // Chart 1: Waste Composition by Stream (Donut)
  renderCompositionChart() {
    const ctx = document.getElementById('chartWasteComposition');
    if (!ctx) return;

    const data = this.calculateStreamVolumes();

    this.charts.composition = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            '#2D6A4F', // Organic
            '#1D6996', // Recyclable
            '#995D13', // Paper
            '#8A1C14', // E-waste
            '#3E444A'  // Landfill
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { weight: 600 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.parsed} kg (${context.dataset.data.reduce((a,b)=>a+b,0) ? Math.round(context.parsed / context.dataset.data.reduce((a,b)=>a+b,0) * 100) : 0}%)`;
              }
            }
          }
        }
      }
    });
  }

  updateCompositionChart() {
    const data = this.calculateStreamVolumes();
    this.charts.composition.data.labels = data.labels;
    this.charts.composition.data.datasets[0].data = data.values;
    this.charts.composition.update();
  }

  calculateStreamVolumes() {
    const bins = window.appState.bins;
    const totals = { organic: 0, recyclable: 0, paper: 0, ewaste: 0, landfill: 0 };

    bins.forEach(b => {
      if (totals[b.stream] !== undefined) {
        totals[b.stream] += (b.weightKg || 0);
      }
    });

    return {
      labels: ['Organic & Compost', 'Dry Recyclables', 'Paper & Cardboard', 'E-Waste', 'Residual Landfill'],
      values: [
        parseFloat(totals.organic.toFixed(1)),
        parseFloat(totals.recyclable.toFixed(1)),
        parseFloat(totals.paper.toFixed(1)),
        parseFloat(totals.ewaste.toFixed(1)),
        parseFloat(totals.landfill.toFixed(1))
      ]
    };
  }

  // Chart 2: 24-Hour Fill Velocity & Peak Trends (Line)
  renderTrendsChart() {
    const ctx = document.getElementById('chartFillTrends');
    if (!ctx) return;

    this.charts.trends = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
          {
            label: 'Dining Commons (Lunch Peak)',
            data: [15, 32, 48, 88, 92, 70, 85, 78, 45],
            borderColor: '#2D6A4F',
            backgroundColor: 'rgba(45, 106, 79, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5
          },
          {
            label: 'Student Union Plaza',
            data: [10, 20, 42, 65, 81, 75, 70, 60, 30],
            borderColor: '#1D6996',
            backgroundColor: 'rgba(29, 105, 150, 0.05)',
            fill: true,
            tension: 0.35,
            borderWidth: 2
          },
          {
            label: 'University Library',
            data: [5, 12, 28, 40, 48, 55, 62, 58, 35],
            borderColor: '#995D13',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: (val) => `${val}%`
            },
            grid: { color: '#EFECE4' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Chart 3: Fleet Optimization Comparison (Bar)
  renderEfficiencyChart() {
    const ctx = document.getElementById('chartEfficiency');
    if (!ctx) return;

    this.charts.efficiency = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Route Distance (km)', 'Collection Time (min)', 'Fuel Used (L)', 'CO₂ Emitted (kg)'],
        datasets: [
          {
            label: 'Traditional Fixed Route',
            data: [6.8, 55, 1.85, 4.95],
            backgroundColor: '#C8BFAC',
            borderRadius: 4
          },
          {
            label: 'GreenTrack TSP Optimized',
            data: [2.9, 26, 0.72, 1.93],
            backgroundColor: '#1B4D36',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#EFECE4' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Chart 4: Campus Zone Distribution (Horizontal Bar)
  renderZoneChart() {
    const ctx = document.getElementById('chartZoneDistribution');
    if (!ctx) return;

    const data = this.calculateZoneVolumes();

    this.charts.zones = new Chart(ctx, {
      type: 'bar',
      indexAxis: 'y',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Accumulated Waste (Liters)',
          data: data.values,
          backgroundColor: '#C59B51',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#EFECE4' }
          },
          y: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  updateZoneChart() {
    const data = this.calculateZoneVolumes();
    this.charts.zones.data.labels = data.labels;
    this.charts.zones.data.datasets[0].data = data.values;
    this.charts.zones.update();
  }

  calculateZoneVolumes() {
    const bins = window.appState.bins;
    const zoneMap = {};

    bins.forEach(b => {
      const z = b.zone || 'General';
      const vol = Math.round((b.capacity * b.currentFill) / 100);
      zoneMap[z] = (zoneMap[z] || 0) + vol;
    });

    const sortedZones = Object.entries(zoneMap).sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedZones.map(item => item[0]),
      values: sortedZones.map(item => item[1])
    };
  }

  // Render Collection History Table
  renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    const history = window.appState.history;
    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #73807B; padding: 1.5rem;">No past collection records yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = history.map(h => {
      const dateFormatted = new Date(h.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr>
          <td><strong style="color: var(--color-primary-900);">${h.id}</strong></td>
          <td style="color: var(--color-ink-muted);">${dateFormatted}</td>
          <td><span class="status-pill normal"><i class="fa-solid fa-check"></i> ${h.binsEmptied} Bins</span></td>
          <td><strong>${h.totalLitersCollected} L</strong> (${h.totalWeightKg} kg)</td>
          <td>${h.distanceKm} km</td>
          <td style="color: #2E7D32;"><strong>-${h.co2PreventedKg} kg CO₂e</strong></td>
          <td style="font-size: 0.78rem; color: #4A5652;">${h.operator}</td>
        </tr>
      `;
    }).join('');
  }

  // Export CSV Data
  exportCsvAuditLog() {
    const bins = window.appState.bins;
    let csv = "Bin ID,Name,Zone,Stream,Capacity (L),Current Fill (%),Weight (kg),Latitude,Longitude,Sensor Type,Battery (%),Last Ping\n";

    bins.forEach(b => {
      csv += `"${b.id}","${b.name}","${b.zone}","${b.stream}",${b.capacity},${b.currentFill},${b.weightKg},${b.lat},${b.lng},"${b.sensorType}",${b.battery},"${b.lastPing}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GreenTrack_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.appUI) {
      window.appUI.showToast('📄 Report Exported', 'Campus waste audit CSV generated and downloaded.', 'success');
    }
  }

  // Print Report View
  triggerPrint() {
    window.print();
  }
}

// Global analytics singleton
window.analyticsManager = new AnalyticsManager();
