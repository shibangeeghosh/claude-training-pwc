# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ALCOA+ Data Integrity Dashboard** – A single-page HTML application for Eli Lilly Operations Team that documents and demonstrates the ALCOA+ framework for pharmaceutical data integrity compliance.

**Purpose:** Provide an interactive educational and reference dashboard for understanding and validating ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate, plus Complete, Consistent, Enduring, Available).

## Architecture

### Single File Structure
- **alcoa_plus.html** – Self-contained, standalone HTML file containing all HTML, CSS, and JavaScript

### Design Pattern
- Embedded CSS and JavaScript (no external dependencies)
- Server-side deployment agnostic (works with any static file server)
- Fully responsive grid-based layout for mobile and desktop

### Key Features
1. **Principle Cards** – Interactive expandable sections for each of the 9 ALCOA+ principles
2. **Test Data Dropdowns** – Each principle card has realistic test data samples (3 per principle)
3. **Live Dashboard** – Metrics panel that updates based on selected principles:
   - Selected principles count
   - Compliance rate calculation
   - Test records reviewed
   - Audit status indicator (Pass/Warning/Fail)
4. **Data Display** – Selected principles' test data shown in dedicated dashboard section

## Running the Application

### Local Development Server
```bash
# Start HTTP server on port 8000 (from project directory)
python3 -m http.server 8000

# Access application
http://localhost:8000/alcoa_plus.html
```

### Using Alternative Servers
```bash
# Node.js http-server
npx http-server -p 8000

# Node.js built-in server (if available)
node -e "require('http').createServer((req, res) => require('fs').readFile('.' + req.url, (e, d) => res.end(d))).listen(8000)"
```

## Development Tasks

### Adding New Test Data
Test data is stored in the JavaScript `principleData` object within the `<script>` section. Add new samples by expanding entries in this structure:
```javascript
const principleData = {
    'PrincipleName': {
        records: 3,           // Number of test samples
        compliance: 100,      // Percentage (0-100)
        summary: 'Description...'
    },
    // Add more principles here
};
```

### Modifying Principle Cards
Each principle card includes:
- Icon (emoji in `principle-icon` span)
- Title with badge (CORE or PLUS)
- Definition quote
- Details paragraph
- Checklist with key practices
- Test data section (hidden by default, shown via toggle)

### Adding New Principles
1. Add new card div with `data-principle` attribute
2. Add button with `onclick="toggleTestData(this)"`
3. Add test-data div with sample items
4. Update `principleData` object with compliance data

### Styling Customization
- **Primary Color:** `#667eea` (purple-blue)
- **Secondary Color:** `#764ba2` (purple)
- **Grid Layout:** CSS Grid with `minmax(300px, 1fr)` for responsive cards
- **Animations:** Smooth transitions and slide-down animations on dropdown toggle

## Browser Compatibility
- Modern browsers with ES6 support (Chrome, Firefox, Safari, Edge)
- Responsive design: tested at 768px breakpoint for mobile
- No external JavaScript libraries required

## Data Structure

### Test Data Format
Each test data item within a principle's dropdown shows realistic pharmaceutical operations scenarios:
- Batch records with IDs and timestamps
- User actions with authentication details
- Compliance status indicators (✓ PASS / ✗ FAIL / ⚠ WARNING)
- Relevant measurements or validation results

### Dashboard Metrics Calculation
- **Compliance Rate:** Average of compliance percentages across selected principles
- **Records Reviewed:** Sum of all test records from selected principles
- **Audit Status:** Derived from average compliance (≥90% = PASS, 70-89% = WARNING, <70% = FAIL)

## Future Enhancement Ideas
- Export compliance report to PDF
- Add data filtering by principle type (CORE vs PLUS)
- Implement audit trail logging for selections
- Add regulatory reference links (21 CFR Part 11, ICH GCP)
- Create principle-specific compliance calculators
- Add dark mode toggle
