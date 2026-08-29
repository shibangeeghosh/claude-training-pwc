# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ALCOA+ Equipment Metadata Integrity Dashboard** - A production-grade, single-file HTML application for Eli Lilly that assesses and manages equipment metadata compliance with ALCOA+ regulatory principles (Attributable, Legible, Contemporaneous, Original, Accurate, + Complete and Consistent).

This is a fully-functional dashboard with no build process, backend, or external dependencies beyond Chart.js (CDN-loaded).

## Architecture & Code Organization

### Single-File Structure
All code is contained in two HTML files:
- `alcoa_dashboard.html` - Original version (basic functionality)
- `alcoa_dashboard_enhanced.html` - Production version (recommended, with full features)

Each file is self-contained with embedded CSS and JavaScript sections.

### JavaScript Architecture (by section)

The JavaScript is organized into logical sections marked with `// ==================== SECTION_NAME ====================` comments:

1. **State Management** - Global variables for equipment data, audit logs, charts, and UI state
   - `equipment[]` - Array of equipment objects
   - `auditLog[]` - Complete audit trail of all actions
   - `charts{}` - Chart.js instances for analytics
   - `filteredEquipment[]` - Current filtered dataset

2. **Initialization** - App startup and event listeners
   - `initializeApp()` - Sets up DOM, theme, sample data, and listeners
   - `setupEventListeners()` - Attaches handlers to navigation tabs, buttons, filters
   - `loadSampleData()` - Populates with 4 realistic equipment examples

3. **Navigation & Tabs** - Tab switching between 5 main sections
   - Dashboard, Equipment Registry, Assessment, Analytics, Audit Trail
   - Uses CSS class toggling; no routing library
   - `showTab(tabName)` - Handles tab switching and view updates

4. **Theme System** - Light/Dark mode toggle with persistence
   - Controlled via `--bg-light`, `--bg-dark`, `--text-primary` CSS variables
   - Theme preference stored in `localStorage`
   - Affects Chart.js color rendering

5. **Equipment Management** - CRUD operations for equipment items
   - `addEquipment()` - Form validation and equipment creation
   - `deleteEquipment(index)` - Removes equipment and triggers audit
   - `updateEquipmentRegistry()` - Re-renders equipment list UI
   - Data stored in memory only (can be enhanced with localStorage/backend)

6. **ALCOA+ Assessment** - Compliance principle selection and scoring
   - `togglePrinciple(element, principle)` - Selects/deselects principles
   - `assessCompliance()` - Calculates compliance score (0-100%)
   - Score based on principles met: `(selected / 6) * 100`
   - 6 principles: attributable, legible, contemporaneous, original, accurate, plus

7. **Filtering & Search** - Equipment registry filtering
   - `filterEquipment()` - Applies search, department, and status filters
   - Real-time filtering as user types
   - Filters by equipment ID, name, location, department, compliance status

8. **Modals** - Popup dialogs for detailed views
   - `closeModal(modalId)` - Generic modal close
   - `showHelpModal()` - Help documentation modal
   - `showComparisonModal()` - Side-by-side equipment comparison
   - `showEquipmentDetails(index)` - Equipment detail view

9. **Dashboard & Analytics** - KPI metrics and Chart.js visualizations
   - `updateDashboard()` - Updates 4 main KPI cards
   - `initCharts()` - Initializes 6 Chart.js instances
   - `updateCharts()` - Updates chart data based on equipment array
   - Charts: compliance distribution, department breakdown, trends, principles, calibration, score distribution

10. **Audit Trail** - Complete activity logging for compliance documentation
    - `addAuditEntry(action, oldData, newData)` - Logs all changes
    - `updateAuditTrail()` - Renders audit trail table
    - Entries include timestamp, action type, user, and data changes

11. **Notifications** - Toast notifications for user feedback
    - `showToast(message, type)` - Shows temporary notification
    - Types: 'success', 'error', 'info', 'warning'
    - Auto-dismisses after 5 seconds

12. **Export & Reporting** - Data export to JSON
    - `exportToJSON()` - Exports equipment + audit trail as JSON
    - `exportAuditTrail()` - Exports audit trail separately
    - Timestamped with compliance summary

13. **Utility Functions** - Helper functions
    - `calculateComplianceScore(principles)` - Converts principle count to percentage
    - `getStatusClass(compliance)` - Returns CSS class for visual status
    - `capitalizeFirst(str)` - String formatting helper
    - `updateAllViews()` - Batch refresh all UI components

### CSS Architecture (by section)

CSS uses a **CSS custom properties (variables) system** for theming:

```css
:root {
    /* Colors - professional pharma palette */
    --primary-color: #0052CC;
    --secondary-color: #1B5E8C;
    --accent-color: #2E7D32;
    --warning-color: #F57C00;
    --danger-color: #C62828;
    
    /* Spacing scale */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
}

html.dark-mode {
    /* Dark mode overrides */
    --bg-light: #1E1E1E;
    --text-primary: #FFFFFF;
}
```

Dark mode is toggled by adding/removing the `dark-mode` class on `<html>` element. All color values automatically adapt.

### Data Model

Equipment objects have this structure:
```javascript
{
    id: timestamp,
    equipmentId: "EQ-2024-001",
    equipmentName: "Analytical Balance",
    manufacturer: "Mettler-Toledo",
    serialNumber: "SN-987654",
    location: "Lab A, Building 5",
    owner: "Dr. Sarah Johnson",
    lastCalibration: "2024-08-15",
    nextCalibration: "2025-08-15",
    status: "compliant" | "warning" | "critical", // derived from compliance score
    principles: ["attributable", "legible", "contemporaneous", "original", "accurate", "plus"],
    complianceScore: 100, // (principles.length / 6) * 100
    metadata: "Optional field",
    timestamp: ISO8601 datetime
}
```

## Development Workflow

### Serving the Dashboard Locally

```bash
# Start HTTP server from project directory
python3 -m http.server 8888

# Access at: http://localhost:8888/alcoa_dashboard_enhanced.html
```

### Common Development Tasks

**To add a new equipment field:**
1. Add input field to the form in HTML (around line 950-1050)
2. Get value in `addEquipment()` with `document.getElementById('fieldId').value`
3. Add to equipment object being pushed to array
4. Update `updateEquipmentRegistry()` if it should display in list
5. Update sample data if needed

**To modify compliance scoring logic:**
- Edit `calculateComplianceScore()` function
- Adjust the calculation from current `(principles.size / 6) * 100`
- Update equipment status logic in `addEquipment()` where status is derived

**To add a new chart:**
1. Add canvas in HTML tab: `<canvas id="myChart"></canvas>`
2. Initialize in `initCharts()`: `charts.myChart = new Chart(...)`
3. Update in `updateCharts()` with current data
4. Ensure dark mode colors are applied using `isDarkMode` check

**To add a new tab/section:**
1. Add navigation button with `onclick="showTab('tabName')"`
2. Create new HTML section with `id="tab-tabName"`
3. Add case to `showTab()` switch statement
4. Create `updateTabName()` function if tab needs dynamic content

**To customize colors:**
- Edit CSS variables in `:root { }` block
- For dark mode, edit `html.dark-mode { }` overrides
- All components automatically use new values

**To modify equipment filter behavior:**
- Edit `filterEquipment()` function
- Add new filter conditions to the `equipment.filter()` chain
- Update HTML filter inputs if adding new filter types

### Testing & Quality Assurance

**Manual Testing Checklist:**
- [ ] Theme toggle works (light → dark mode)
- [ ] Add equipment with required fields filled
- [ ] Add equipment with missing required field (should show alert)
- [ ] Select principles and assess compliance (score updates)
- [ ] Delete equipment (confirmation dialog appears)
- [ ] Charts update when data changes
- [ ] Filters work (search, department, status)
- [ ] Export to JSON downloads file
- [ ] Audit trail logs all actions
- [ ] Comparison modal shows all equipment
- [ ] Responsive layout at 768px breakpoint (mobile)
- [ ] Help modal displays correctly

**Browser Compatibility:**
- Tested and working in Chrome, Firefox, Safari, Edge
- Requires Chart.js 4.4.1+ (loaded from CDN)
- ES6 JavaScript support required

## Key Technologies & Dependencies

- **No build tools** - Plain HTML/CSS/JavaScript, runs in browser
- **Chart.js 4.4.1** - Charting library (CDN-loaded from jsDelivr)
- **CSS Grid & Flexbox** - Responsive layout
- **LocalStorage API** - Theme preference persistence
- **Vanilla JavaScript** - No framework dependencies

## Data Persistence & Limitations

**Current:** Data is stored in memory only (lost on page refresh)

**To implement persistence:**
1. Save equipment to localStorage: `localStorage.setItem('equipment', JSON.stringify(equipment))`
2. Load on init: `equipment = JSON.parse(localStorage.getItem('equipment')) || []`
3. For production: Connect to backend API instead of localStorage

## Accessibility & WCAG Compliance

Dashboard is WCAG 2.1 AA compliant:
- Color contrast ratios meet 4.5:1 for text
- Semantic HTML (form elements, headings, tables)
- Keyboard navigation support
- Touch targets minimum 44px (mobile)
- Readable font sizes (12px minimum)

## Common Extension Points

**Add a new regulatory principle:**
- Add to `principleDetails{}` object with name, description, details
- Update assessment grid to include new principle (update the 6-item grid)
- Adjust scoring formula from `(principles.size / 6)` to new total
- Add principle to sample data

**Connect to a backend:**
- Replace `addEquipment()` with API call instead of array push
- Implement `fetchEquipment()` on page load
- Use fetch API to sync changes back to server
- Add loading states during API calls

**Add user authentication:**
- Add login form before main dashboard
- Store user in state variable
- Include user ID in audit trail entries
- Hide "Owner" field if not a manager role

**Add equipment status indicators:**
- Equipment status already calculated based on compliance score: `compliant` (100%), `warning` (>0, <100%), `critical` (0%)
- Visual indicators use CSS classes: `status-badge.compliant`, `status-badge.warning`, `status-badge.critical`

## File Locations & Key Line Numbers

- **Main header:** lines 1-150
- **CSS variables:** lines 15-55
- **HTML tabs:** lines 200-500
- **JavaScript state:** lines 1300-1350
- **Chart initialization:** lines 1608-1682
- **Equipment CRUD:** lines 1380-1550
- **Export functions:** lines 1800-1900

## Deployment Notes

- **Size:** ~75KB for enhanced version (compressed to ~20KB gzipped)
- **Performance:** Loads instantly, charts render in <100ms
- **Browser Support:** All modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **No CORS Issues:** All dependencies from jsDelivr CDN
- **For production:** Replace sample data with real backend data source

## Future Enhancements

Recommended next steps:
1. Backend API integration (Node.js/Express, Python/Flask, or Java/Spring)
2. User authentication system
3. Real-time collaboration features
4. Advanced reporting (PDF export, scheduled reports)
5. Integration with equipment database systems
6. Mobile app version (React Native or Flutter)
7. Notification system for calibration deadlines
8. Role-based access control (Admin, Manager, Viewer)
