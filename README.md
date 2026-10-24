# EcoVault — Intelligent Second-Life Battery Management System (BMS)
### National Sustainability Hackathon MVP

**EcoVault** is a circular energy-tech web application that repurposes retired electric vehicle (EV) battery packs for stationary microgrid energy storage. It features a deterministic, health-aware dynamic load allocation algorithm, real-time safety threshold monitoring, solar-battery balance simulation, and an EU-aligned Digital Battery Passport.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Dark Navy `#060B18`, Emerald `#10b981`, Amber `#f59e0b`, Rose `#ef4444`)
- **Data Visualizations**: Recharts (Dynamic BarCharts, PieCharts, Power Balances)
- **Icons**: Lucide React
- **State & Persistence**: Browser `localStorage` (Zero external APIs, 100% client-side deterministic execution)

---

## 📋 Hackathon Demonstration Checklist

| Step | Section | Action to Demonstrate to Judges | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **1** | **Overview Dashboard** | View live fleet cards, health distribution pie chart, and dynamic load bar chart. | All metrics reflect live module data; prototype banner is displayed. |
| **2** | **Battery Modules** | Click **"Enroll New Module"**, add `ECO-005` (SOH 88%, 49V, 26°C, 5.0 kWh). | New module immediately enrolls, appears in the grid, and saves to localStorage. |
| **3** | **Adaptive BMS** | Move the **Load Demand Slider** from `1200W` to `5500W` or click **"High Afternoon Peak"**. | Green modules take priority; Yellow takes a smaller share; Red receives **0 W**. |
| **4** | **Safety Center** | In the Fault Injector, click **"🔥 Thermal Spike (51.5°C)"**. | Critical alert triggers instantly, card pulses red, and click **"Isolate Contactor"** disconnects it. |
| **5** | **Solar & Load Sim** | Adjust the **Solar Generation Slider** (e.g. `4500W`) against load demand. | Microgrid flow updates in real-time showing battery charge/discharge and grid import/export. |
| **6** | **Battery Passport** | Inspect `ECO-001` or `ECO-003`, view EV donor vehicle, QR code, and click **"Log Maintenance Event"**. | New timestamped inspection entry is appended to the immutable event log. |
| **7** | **Reset Demo** | Click **"Reset Demo"** in the top navigation bar. | Dataset resets to pristine benchmark state (`ECO-001`, `ECO-002`, `ECO-003`). |

---

## 📐 Deterministic Allocation Logic

```
For each active module:
  - Green Tier (SOH >= 80%): Weight = (SOH / 100)^1.3 * 1.6
  - Yellow Tier (50% <= SOH < 80%): Weight = (SOH / 100) * 0.65
  - Red Tier (SOH < 50%): Weight = 0 (Quarantined by Contactor Interlock)

Load is distributed proportionally up to each module's maximum rated inverter power.
Any demand exceeding total capacity is flagged with an Overload Warning.
```

---

*EcoVault — Developed for the National Sustainability Hackathon. All telemetry and sensor signals are simulated for prototype evaluation.*
