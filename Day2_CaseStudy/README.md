# Pharma Shipment Risk Analyzer

A professional, modern web application for real-time monitoring and risk assessment of pharmaceutical shipments. Built with React, TypeScript, and Recharts.

## Features

- **File Upload**: Drag-and-drop Excel (.xlsx) file upload with automatic parsing
- **Real-time Analytics**: Immediate risk scoring and shipment analysis
- **Risk Distribution**: Visual breakdown of low/medium/high risk shipments with Pie and Bar charts
- **High-Risk Monitoring**: Table view of top 5 highest-risk shipments with temperature alerts
- **AI Recommendations**: Intelligent, priority-based recommendations based on shipment data
- **Temperature Tracking**: Identifies and highlights temperature excursions
- **Responsive Design**: Fully responsive interface with Tailwind CSS
- **Professional UI**: Clean, modern design with Lucide React icons

## Project Structure

```
Day2_CaseStudy/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx              # Excel file upload component
│   │   ├── StatsCards.tsx              # Statistics cards and distribution chart
│   │   ├── RiskDistributionChart.tsx   # Interactive risk distribution visualization
│   │   ├── TopRiskyShipments.tsx       # Top 5 highest-risk shipments table
│   │   └── AIRecommendations.tsx       # AI-generated recommendations
│   ├── types/
│   │   └── shipment.ts                 # TypeScript type definitions
│   ├── App.tsx                         # Main application component
│   ├── main.jsx                        # Application entry point
│   └── index.css                       # Tailwind CSS styles
├── package.json                        # Project dependencies
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── index.html                          # HTML template
└── backend-server.js                   # Backend API server
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Navigate to the project directory:
   ```bash
   cd /home/labuser/Downloads/claude-training-pwc/Day2_CaseStudy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Start both the frontend and backend servers:
```bash
npm run dev:full
```

Or run them separately:

**Frontend only (Vite dev server):**
```bash
npm run dev
```
Frontend will be available at: http://localhost:5173

**Backend only:**
```bash
npm run server
```
Backend will be available at: http://localhost:3000

### Production Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Excel File Format

The application expects an Excel (.xlsx) file with the following columns:

### Required Columns:
- **ID**: Unique shipment identifier (e.g., SHIP-00001)
- **Destination**: Destination location/city
- **Risk Score**: Numerical risk score (0-10)
- **Temperature**: Current temperature in Celsius
- **Status**: Shipment status (e.g., "In Transit", "Delivered", "Delayed")

### Optional Columns:
- **Temperature Excursion**: Boolean (Yes/No or True/False) indicating temperature breach
- **Carrier**: Shipping carrier name
- **Departure Date**: Date when shipment departed
- **Estimated Arrival**: Expected delivery date
- **Product Type**: Type of pharmaceutical product

### Example Excel Row:
| ID | Destination | Risk Score | Temperature | Status | Temperature Excursion |
|----|-------------|-----------|-------------|--------|----------------------|
| SHIP-00001 | New York | 8.5 | -15 | In Transit | Yes |
| SHIP-00002 | Los Angeles | 4.2 | -20 | Delivered | No |

## Component Details

### FileUpload Component
- Drag-and-drop interface for Excel files
- Automatic XLSX parsing using the `xlsx` library
- Visual feedback for successful uploads
- Error handling and validation

### StatsCards Component
- Displays total shipments count
- Shows high-risk shipments count and percentage
- Displays temperature excursion count
- Includes bar chart of risk distribution

### RiskDistributionChart Component
- Interactive Pie or Bar chart toggle
- Color-coded by risk level (Green/Yellow/Red)
- Hover tooltips with detailed information
- Legend with counts for each risk category

### TopRiskyShipments Component
- Table view of top 5 highest-risk shipments
- Displays shipment ID, destination, risk score, temperature, and status
- Highlights rows with temperature excursions
- Responsive table with hover effects

### AIRecommendations Component
- Analyzes shipment data to generate recommendations
- Categorizes recommendations by priority (High/Medium/Low)
- Provides actionable items for each recommendation
- Color-coded by priority level

## Dependencies

### Production Dependencies:
- **react** (^18.2.0) - UI library
- **react-dom** (^18.2.0) - React DOM bindings
- **recharts** (^2.10.3) - React charting library
- **lucide-react** (^0.263.1) - Icon library
- **xlsx** (^0.18.5) - Excel file parsing

### Development Dependencies:
- **vite** (^4.3.0) - Build tool
- **@vitejs/plugin-react** (^4.0.0) - Vite React plugin
- **tailwindcss** (^3.3.0) - Utility-first CSS framework
- **postcss** (^8.4.24) - CSS transformations
- **autoprefixer** (^10.4.14) - CSS vendor prefixing
- **concurrently** (^8.2.2) - Run multiple commands concurrently

## Styling

The application uses **Tailwind CSS** for all styling with a custom color palette for risk levels:

- **Low Risk**: Green (#10b981)
- **Medium Risk**: Amber (#f59e0b)
- **High Risk**: Red (#ef4444)

Custom component classes are defined in `src/index.css`:
- `.card` - Standard card container
- `.stat-card` - Statistics card styling
- `.btn-primary` / `.btn-secondary` - Button styles
- `.badge-low` / `.badge-medium` / `.badge-high` - Risk badges

## API Endpoints (Backend)

The backend server provides the following endpoints:

- `GET /api/shipments` - Get all shipments
- `GET /api/shipments/:id` - Get a specific shipment
- `POST /api/shipments` - Create a new shipment
- `GET /api/analytics` - Get analytics summary

## Performance Considerations

- Components are optimized with React.FC and proper prop typing
- Recharts visualizations are wrapped in ResponsiveContainer for responsive design
- File upload uses efficient XLSX parsing
- Tailwind CSS provides optimized production builds with tree-shaking

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Excel file not parsing
- Ensure file is in .xlsx format
- Check that required columns exist
- Verify column headers match expected format

### Charts not displaying
- Ensure shipments array is populated
- Check browser console for errors
- Verify Recharts is properly installed

### Styling issues
- Run `npm install` to ensure Tailwind CSS is installed
- Check that postcss.config.js is properly configured
- Clear cache: `rm -rf node_modules/.cache`

## Development Notes

- TypeScript is configured for type safety
- Components are functional with React hooks
- Styling follows Tailwind CSS conventions
- Icons from Lucide React library (consistent with Day2 project)

## Future Enhancements

- Backend database integration
- Real-time WebSocket updates
- Advanced filtering and search
- Export reports (PDF/CSV)
- User authentication
- Historical data tracking
- Predictive risk modeling

## License

MIT License - See LICENSE file for details
