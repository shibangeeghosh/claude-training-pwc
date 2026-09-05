# Features Overview

## 1. FileUpload Component (`src/components/FileUpload.tsx`)

### Features:
- **Drag-and-Drop Interface**: Intuitive drag-and-drop zone for Excel files
- **Click to Browse**: Alternative method to select files via file dialog
- **Format Validation**: Ensures only .xlsx and .xls files are accepted
- **Real-time Parsing**: Automatically parses Excel files using XLSX library
- **Success Feedback**: Visual confirmation when file is loaded successfully
- **Error Handling**: Clear error messages for invalid files or parsing failures
- **Loading State**: Animated loader during file parsing
- **Clear Action**: Quick button to clear uploaded file and start over
- **Format Guide**: Built-in help showing expected Excel format

### Technical Details:
- Uses `xlsx` library for file parsing
- Binary string reading for Excel file processing
- Flexible column mapping (handles different column names)
- Converts Excel data to Shipment TypeScript interface

---

## 2. StatsCards Component (`src/components/StatsCards.tsx`)

### Features:
- **Total Shipments Card**: Displays count of all shipments
- **High-Risk Shipments Card**: Shows count and percentage of high-risk shipments
- **Temperature Excursions Card**: Displays count of temperature-breached shipments
- **Risk Distribution Chart**: Bar chart showing Low/Medium/High breakdown
- **Visual Icons**: Color-coded icons for each statistic (Blue, Red, Orange)
- **Percentage Calculations**: Automatically calculates percentages from total
- **Responsive Layout**: Grid layout that adapts to screen size

### Color Scheme:
- Blue: Total shipments (informational)
- Red: High-risk shipments (warning)
- Orange: Temperature excursions (caution)

### Technical Details:
- Uses Recharts BarChart component
- Responsive container for mobile compatibility
- Color-coded cells in chart
- Custom tooltips for data visualization

---

## 3. RiskDistributionChart Component (`src/components/RiskDistributionChart.tsx`)

### Features:
- **Dual Chart Types**: Toggle between Pie Chart and Bar Chart views
- **Interactive Buttons**: Easy switching between visualization types
- **Color-Coded Segments**: 
  - Green for Low Risk
  - Amber for Medium Risk
  - Red for High Risk
- **Hover Tooltips**: Detailed information on hover
- **Percentage Display**: Shows percentages and count for each risk level
- **Legend**: Visual legend showing all risk categories
- **Empty State**: Helpful message when no data available
- **Responsive Design**: Adapts to container size

### Risk Level Definitions:
- **Low Risk**: Score 0-3.9 (Green)
- **Medium Risk**: Score 4-6.9 (Amber)
- **High Risk**: Score 7-10 (Red)

### Technical Details:
- Uses Recharts PieChart and BarChart components
- ResponsiveContainer for dynamic sizing
- Cell component for custom coloring
- Custom tooltip styling

---

## 4. TopRiskyShipments Component (`src/components/TopRiskyShipments.tsx`)

### Features:
- **Top 5 Ranking**: Displays 5 highest-risk shipments
- **Sortable Table**: Automatically sorts by risk score (descending)
- **Multiple Columns**: 
  - Shipment ID
  - Destination
  - Risk Score with badge
  - Temperature in Celsius
  - Delivery Status
- **Temperature Excursion Alerts**: Visual indicators for shipments with temp issues
- **Hover Effects**: Row highlighting on hover
- **Risk Badges**: Color-coded risk level badges (Low/Medium/High)
- **Status Badges**: Color-coded status information
- **Alert Box**: Warning box when temperature excursions are detected
- **Empty State**: Helpful message when no shipments available

### Status Color Coding:
- Green: Delivered
- Blue: In Transit
- Red: Delayed
- Gray: Other statuses

### Technical Details:
- Sorts shipments by riskScore in descending order
- Slices array to get top 5
- Dynamic CSS classes for badges
- Alert component for temperature warnings

---

## 5. AIRecommendations Component (`src/components/AIRecommendations.tsx`)

### Features:
- **Smart Analysis**: Analyzes shipment data to generate recommendations
- **Priority Levels**: 
  - High Priority (Red) - Requires immediate action
  - Medium Priority (Yellow) - Important to address
  - Low Priority (Green) - Maintain current operations
- **Up to 4 Recommendations**: Generates up to 4 context-specific recommendations
- **Actionable Items**: Each recommendation includes 3-4 specific action items
- **Dynamic Generation**: Recommendations based on:
  - High-risk shipment count and percentage
  - Temperature excursion count
  - Average risk score
- **Visual Icons**: Priority-specific icons (Alert, Info, Check)
- **Professional Formatting**: Well-structured cards with clear hierarchy

### Recommendation Triggers:
1. **High-Risk Management**: Triggered when high-risk shipments exist
2. **Temperature Control**: Triggered when temperature excursions exist
3. **Overall Risk Mitigation**: Triggered when average risk score > 5
4. **Maintain Operations**: Default recommendation when no issues detected

### Technical Details:
- Dynamic recommendation generation algorithm
- Context-aware messaging
- Color-coded priority system
- Action items formatted as bulleted lists

---

## 6. App.tsx - Main Application Component

### Features:
- **Orchestration**: Coordinates all child components
- **State Management**: Manages shipment data using React useState
- **Professional Header**: 
  - Application branding
  - Icon and title display
  - Subtitle with description
- **Sticky Navigation**: Header remains visible while scrolling
- **Responsive Layout**: 
  - Mobile-first design
  - Grid layouts that adapt to screen size
  - Max-width container for readability
- **Empty State**: Welcoming message before data upload
- **Dashboard Sections**: 
  - File upload area
  - Statistics cards
  - Charts and recommendations
  - Top risky shipments table
- **Professional Footer**: 
  - Features overview
  - Data format info
  - Support information
- **Last Updated Timestamp**: Shows when data was analyzed

### Layout Structure:
```
┌─────────────────────────────────────┐
│           Header                    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│       File Upload Section           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      Statistics Cards (3x)          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│   Charts Section (2 Column)         │
│  ┌──────────────┬──────────────┐   │
│  │ Risk Distrib │ Recommend.   │   │
│  └──────────────┴──────────────┘   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│   Top Risky Shipments Table         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│           Footer                    │
└─────────────────────────────────────┘
```

---

## Styling System

### Tailwind CSS Utilities Used:
- **Spacing**: Grid gaps, padding, margins
- **Colors**: Risk-level colors (green/yellow/red)
- **Typography**: Font sizes, weights, colors
- **Responsive**: Breakpoints (md:, lg:)
- **Effects**: Shadows, transitions, hover states
- **Animations**: Spinners for loading states

### Custom CSS Classes (in `src/index.css`):
- `.card` - Standard card container with shadow and border
- `.stat-card` - Statistics display card
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.badge-low` - Low risk badge
- `.badge-medium` - Medium risk badge
- `.badge-high` - High risk badge

---

## Data Flow

```
1. User uploads Excel file
   ↓
2. FileUpload component parses Excel
   ↓
3. Parsed data stored in App component state
   ↓
4. Data passed as props to all components
   ↓
5. Components analyze and display data:
   - StatsCards: Calculate statistics
   - RiskDistributionChart: Visualize distribution
   - TopRiskyShipments: Sort and display top items
   - AIRecommendations: Generate insights
```

---

## Type System

### Shipment Interface:
```typescript
{
  id: string;                    // Unique identifier
  destination: string;           // Delivery destination
  riskScore: number;            // Risk score (0-10)
  temperature: number;          // Temperature in Celsius
  temperatureExcursion: boolean; // Temperature breach flag
  status: string;               // Shipment status
  carrier: string;              // Shipping carrier
  departureDate: string;        // Departure date
  estimatedArrival: string;     // Expected arrival
  productType: string;          // Product type
}
```

---

## Performance Considerations

- **Efficient Rendering**: React functional components with proper key props
- **Responsive Charts**: Recharts ResponsiveContainer prevents layout shifts
- **File Parsing**: XLSX library efficiently handles large Excel files
- **CSS Optimization**: Tailwind CSS tree-shakes unused styles
- **Lazy Rendering**: Components only render when data is available

---

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and structure
- **Color Not Only**: Icons and text also indicate status
- **Keyboard Navigation**: All buttons are keyboard accessible
- **ARIA Labels**: Meaningful labels for screen readers
- **Sufficient Contrast**: Color combinations meet WCAG standards
- **Responsive Text**: Font sizes scale appropriately

---

## Browser Compatibility

- **Chrome/Edge**: Full support (v90+)
- **Firefox**: Full support (v88+)
- **Safari**: Full support (v14+)
- **Mobile Browsers**: Responsive design works on iOS/Android

---

## Future Enhancement Opportunities

1. **Data Export**: Export analytics to PDF/CSV
2. **Real-time Updates**: WebSocket integration for live data
3. **Advanced Filtering**: Filter shipments by various criteria
4. **Predictive Analytics**: Machine learning for risk prediction
5. **Historical Tracking**: Database integration for historical data
6. **User Authentication**: Multi-user support with login
7. **Custom Reports**: User-defined report generation
8. **API Integration**: Connect to actual shipping APIs
9. **Mobile App**: Native mobile application
10. **Notifications**: Email/SMS alerts for high-risk shipments

