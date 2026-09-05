# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pharma Shipment Risk Analyzer** — A React + TypeScript web application for real-time monitoring and risk assessment of pharmaceutical shipments. Users upload Excel files containing shipment data, and the system provides:
- Risk scoring and classification (low/medium/high)
- Temperature excursion detection (target: 2-8°C for pharma)
- Interactive visualizations with Recharts
- AI-generated recommendations based on data patterns

## Development Stack

- **Frontend**: React 18, TypeScript (strict mode), Vite, Tailwind CSS
- **Visualization**: Recharts, Lucide React icons
- **Data Parsing**: XLSX (Excel file parsing)
- **Backend**: Node.js + Express (lightweight API, optional)
- **Styling**: Tailwind CSS with custom risk-level colors (green/amber/red)

## Common Development Commands

```bash
# Install dependencies (required first)
npm install

# Start frontend dev server (Vite on port 5173)
npm run dev

# Start backend Express server (port 3000)
npm run server

# Run both frontend + backend concurrently
npm run dev:full

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Architecture

### Entry Points
- **Frontend**: `src/index.tsx` → renders React app into `public/index.html`
- **Backend**: `backend-server.js` → Express API (optional, for future integration)

### Core Data Flow
1. **FileUpload** component (drag-drop interface) → parses Excel with XLSX library
2. Parsed data mapped to `Shipment` interface via column mapping
3. `App.tsx` manages shipments state
4. Child components receive shipments and call utility functions
5. `riskCalculator.ts` provides business logic for all calculations

### File Organization

```
src/
├── components/           # React functional components
│   ├── FileUpload.tsx        # Excel parsing and upload UI
│   ├── StatsCards.tsx        # Four metric cards (total, high-risk, excursions, distribution)
│   ├── RiskDistributionChart.tsx  # Pie/bar chart toggle
│   ├── TopRiskyShipments.tsx      # Top 5 table with temp alerts
│   └── AIRecommendations.tsx      # Context-aware recommendations
├── types/               # TypeScript interfaces
│   └── shipment.ts
├── utils/              # Business logic
│   └── riskCalculator.ts
├── App.tsx             # Main orchestrator component
├── index.tsx           # React entry point
└── index.css           # Tailwind CSS with custom classes
```

## Risk Calculation Logic

**File**: `src/utils/riskCalculator.ts`

The system assigns a risk score (0-100) based on three factors:
- **Temperature deviation** (50 points max): Checks if temp is outside 2-8°C range; penalty scales with deviation
- **Humidity deviation** (30 points max): Checks if humidity is outside 30-70% range; penalty scales with deviation
- **Data age** (20 points max): Shipments older than 7 days accumulate age-based penalty

Risk classification:
- **Low**: Score ≤ 35
- **Medium**: Score 36-70
- **High**: Score > 70

Key functions:
- `calculateRiskScore()` — Dynamic scoring based on current conditions
- `classifyRisk()` — Maps score to level
- `identifyTemperatureExcursions()` — Filters shipments outside 2-8°C
- `getRiskBreakdown()` — Counts shipments per risk level
- `getTopRiskyShipments()` — Sorts by risk score, returns top N

## Component Development Patterns

All components follow functional React with TypeScript:

```tsx
interface ComponentProps {
  shipments: Shipment[];
}

export const ComponentName: React.FC<ComponentProps> = ({ shipments }) => {
  // Logic here
  return (/* JSX */);
};
```

### Key Patterns
- **State management**: App.tsx holds `shipments` state; child components are presentational
- **Props**: All data passed down; no prop drilling (small component tree)
- **Styling**: Tailwind classes; custom classes in `index.css` (`.card`, `.stat-card`, `.badge-*`)
- **Charts**: Wrapped in Recharts `ResponsiveContainer` for mobile responsiveness
- **Icons**: Lucide React; import as `import { IconName } from 'lucide-react'`

## Excel Upload

**Column Mapping** (case-insensitive):
- `ID` → `id`
- `Destination` → `destination`
- `Temperature (°C)` or `Temperature` → `temperature`
- `Humidity (%)` or `Humidity` → `humidity`
- `Risk Score` → `riskScore`
- `Has Temperature Excursion` → `hasTemperatureExcursion` (parsed as boolean)
- `Last Updated` → `lastUpdated` (parsed as Date)

**Parsing Logic**: In `FileUpload.tsx`, the XLSX library reads the workbook, and column headers are normalized (trimmed, lowercased) for flexible matching.

## UI/UX Details

- **Color Scheme**:
  - Low risk: Green (#10b981)
  - Medium risk: Amber (#f59e0b)
  - High risk: Red (#ef4444)
- **Layout**: Responsive grid (Tailwind); 2-column layout on desktop, stacked on mobile
- **Empty State**: Shown when no shipments uploaded; encourages file selection
- **Charts**: Pie chart by default; toggle to bar chart in RiskDistributionChart
- **Footer**: Metadata (shipment count, last updated timestamp)

## Vite Configuration

**Dev Server** (localhost:5173):
- API requests to `/api/*` proxied to `localhost:3000` (backend)
- Rewrite removes `/api` prefix before forwarding
- Hot module reloading enabled by default

## TypeScript Configuration

- **Target**: ES2020
- **Strict Mode**: Enabled (all strict checks active)
- **JSX**: react-jsx (modern JSX transform)
- **No Implicit Locals/Parameters**: Unused variables/parameters flagged
- **Module Resolution**: Node (standard resolution)
- **Base URL**: `./src` (allows imports from `src/` root)

## Adding New Features

### To Add a New Metric Card
1. Add calculation function to `src/utils/riskCalculator.ts`
2. Call it in `StatsCards.tsx`
3. Add new card div with Tailwind classes (`.stat-card`)

### To Add a New Chart
1. Create component in `src/components/NewChart.tsx`
2. Use Recharts components (ResponsiveContainer, PieChart/BarChart, etc.)
3. Import Shipment type for props
4. Add to `App.tsx` grid layout

### To Modify Risk Calculation
- Update thresholds in `src/utils/riskCalculator.ts` (TEMPERATURE_MIN, HUMIDITY_MIN, etc.)
- Adjust point allocations in `calculateRiskScore()`
- Update classification thresholds in `classifyRisk()`

## Deployment Considerations

- **Frontend Build**: `npm run build` outputs to `dist/` directory
- **Backend**: Optional; for production, run `npm run server` on separate port or integrate into existing API
- **Environment Variables**: Currently hardcoded; add `.env.local` support if needed
- **CORS**: Backend Express handles CORS; Vite dev server proxies API calls

## Troubleshooting

**Excel file not parsing**
- Verify file is `.xlsx` (not `.xls` or `.csv`)
- Check column headers match expected names (case-insensitive)
- Ensure required columns present: ID, Destination, Temperature, Humidity, Risk Score

**Charts not rendering**
- Confirm shipments array populated (use browser DevTools)
- Check data types (Risk Score should be number, dates should be Date objects)
- Verify Recharts responsiveness (resize browser window)

**Styling issues**
- Run `npm install` to ensure Tailwind CSS dependencies
- Clear Vite cache: `rm -rf dist .vite`
- Check that `tailwind.config.js` and `postcss.config.js` exist
