# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build locally
```

The dev server runs on port 3000 and includes hot module replacement for instant feedback on changes.

## Project Overview

**ALCOA+ QA Compliance Management System** - A professional React application for Eli Lilly's QA department to track data integrity compliance across pharmaceutical manufacturing and clinical operations. The app manages compliance for all 8 ALCOA+ principles: Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, and Enduring.

## Architecture

### High-Level Structure

The application follows a tab-based single-page architecture with client-side state management:

- **App.jsx** - Root component managing tab navigation state (`activeTab` state)
- **3 Main Views** - Each view is a tab-switchable component:
  - Dashboard - Overview with charts and metrics
  - Compliance Tracker - Principle-by-principle compliance management
  - Data Records - Record management with search/filter

### Component Organization

```
src/
├── components/         # UI components
│   ├── Header.jsx      # Global header (branding, date)
│   ├── Dashboard.jsx   # Dashboard view with charts
│   ├── ComplianceTracker.jsx  # ALCOA+ principle tracker
│   ├── DataRecords.jsx # Record management view
│   └── StatCard.jsx    # Reusable stat metric card
├── App.jsx             # Root component with tab routing
├── main.jsx            # React entry point
└── index.css           # Global styles and Tailwind imports
```

### State Management Pattern

Simple React hooks-based approach:
- **App.jsx** - Uses `useState` for active tab navigation
- **ComplianceTracker.jsx** - Uses `useState` for compliance check objects and edit mode
- **DataRecords.jsx** - Uses `useState` for record data, search term, and filter status
- All state is local component state; no external state management library

**Data Structures:**
- Compliance check: `{ status: 'pass'|'warning'|'fail', percentage: 0-100, issues: number }`
- Data record: `{ id, title, principle, status, author, date, issues, percentage }`

## Styling System

### Tailwind CSS + Custom Eli Lilly Colors

**Custom color palette** (defined in `tailwind.config.js`):
- `eli-navy` (#001F3F) - Primary brand color, used in header gradient
- `eli-blue` (#0066CC) - Secondary brand, tab underlines, primary buttons
- `eli-light` (#E8F1F8) - Light backgrounds (stat summary cards)
- `eli-accent` (#00A8E8) - Chart progress bars and accents

**Color usage conventions:**
- Compliance status: Green (pass), Yellow (warning), Red (fail)
- Use `className` strings for responsive design (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- Apply custom CSS classes via `index.css`: `.card`, `.btn-primary`, `.btn-secondary`, `.compliance-badge`, etc.

### Responsive Design

- Mobile-first approach with Tailwind breakpoints
- Key layout uses:
  - `max-w-7xl mx-auto` - Container max width
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grids
  - `flex gap-4 flex-col sm:flex-row` - Flexible stacks

## Key Dependencies

- **React 18.2** - UI library with hooks
- **Vite 4.3** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Recharts 2.10** - Chart library (BarChart, LineChart, PieChart)
- **Lucide React 0.263** - Icon library (Shield, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, etc.)

## Common Patterns

### Tab Navigation Pattern
Used in App.jsx - simple conditional rendering based on `activeTab` state:
```jsx
const [activeTab, setActiveTab] = useState('dashboard')
// Buttons update state
// Content rendered: {activeTab === 'dashboard' && <Dashboard />}
```

### Status Badge Pattern
Used across components for compliance status display:
```jsx
const getStatusBadge = (status) => {
  switch (status) {
    case 'pass': return 'compliance-pass'  // green
    case 'warning': return 'compliance-warning'  // yellow
    case 'fail': return 'compliance-fail'  // red
  }
}
```

### Search & Filter Pattern
Used in DataRecords.jsx - combine search term and filter dropdown:
```jsx
const filtered = records.filter(r => 
  r.title.toLowerCase().includes(search) && 
  (filterStatus === 'all' || r.status === filterStatus)
)
```

### Chart Integration
Used in Dashboard.jsx - ResponsiveContainer wraps Recharts components:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={complianceData}>
    <XAxis dataKey="principle" />
    <Bar dataKey="compliance" fill="#0066CC" />
  </BarChart>
</ResponsiveContainer>
```

## Important Implementation Details

### Mock Data
All data is hardcoded in component files (not fetched from API):
- Dashboard: `complianceData`, `trendData`, `categoryData` arrays
- ComplianceTracker: `initialChecks` state object with 8 principles
- DataRecords: `initialRecords` array with 6 sample records

### Interactive Elements
- Status updates in ComplianceTracker use `toggleStatus()` function
- Records filtering happens in real-time via `filteredRecords` computed array
- Search input uses controlled component pattern with `onChange`

### Accessibility Considerations
- Semantic HTML with proper heading hierarchy (h1, h2, h3)
- Icon buttons paired with text labels (e.g., "Edit", "Delete")
- Color coding supplemented with text/icons (not color alone)
- Meaningful alt content via text labels on all interactive elements

## Development Workflow

When modifying or adding features:

1. **For UI changes** - Edit component JSX and update Tailwind classes. Changes reflect instantly with hot reload.
2. **For new charts** - Use Recharts components wrapped in ResponsiveContainer. Data arrays defined alongside components.
3. **For new views** - Create new component in `src/components/`, import in App.jsx, add tab button and conditional render.
4. **For styling** - Prefer Tailwind utility classes. Add custom CSS to `index.css` only for complex patterns.
5. **For state management** - Keep local with `useState`. If data sharing between distant components becomes needed, lift state to App.jsx or introduce Context API.

## Future Considerations

Current app uses mock data. When connecting to a backend:
- Consider creating a `hooks/` directory for custom hooks (useComplianceData, useRecords, etc.)
- Move API calls to separate `api/` or `services/` directory
- Consider adding Context API or state management library if multiple components need shared data
- The existing component structure supports this migration without major refactoring
