# Setup Guide - Pharma Shipment Risk Analyzer

Follow this guide to set up and run the Pharma Shipment Risk Analyzer locally.

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for version control)
- **Code Editor** (VS Code recommended)

To check if Node.js is installed:
```bash
node --version
npm --version
```

## Step 1: Navigate to Project Directory

```bash
cd /home/labuser/Downloads/claude-training-pwc/Day2_CaseStudy
```

## Step 2: Install Dependencies

This will download and install all required packages (React, Tailwind CSS, Recharts, etc.):

```bash
npm install
```

This may take 2-5 minutes depending on your internet speed. You'll see a list of installed packages.

## Step 3: Start Development Servers

### Option A: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev:full
```

This command will:
- Start the Vite development server (Frontend)
- Start the Node.js backend server
- Display URLs where you can access the application

### Option B: Run Frontend Only

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Option C: Run Backend Only

```bash
npm run server
```

Backend will be available at: **http://localhost:3000**

## Step 4: Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

You should see the Pharma Shipment Risk Analyzer dashboard with the file upload section.

## Step 5: Upload Sample Data

1. Download or create an Excel file (.xlsx) with shipment data
   - See `SAMPLE_DATA.md` for template and sample rows
   - Required columns: ID, Destination, Risk Score, Temperature, Status

2. In the application, drag and drop your Excel file onto the upload area
   - Or click to browse and select a file

3. The system will parse the file and display:
   - Statistics cards (total shipments, high-risk count, etc.)
   - Risk distribution chart
   - Table of top 5 risky shipments
   - AI-generated recommendations

## Project Structure

```
Day2_CaseStudy/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx
│   │   ├── StatsCards.tsx
│   │   ├── RiskDistributionChart.tsx
│   │   ├── TopRiskyShipments.tsx
│   │   └── AIRecommendations.tsx
│   ├── types/
│   │   └── shipment.ts
│   ├── App.tsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── backend-server.js
```

## Development Workflow

### Making Changes

1. **Edit component files** in `src/components/` or `src/App.tsx`
2. **Save the file** (Ctrl+S or Cmd+S)
3. **Vite will automatically refresh** your browser
   - No need to manually restart the dev server

### Adding New Dependencies

If you need to add a new package:

```bash
npm install package-name
```

Then restart the dev server (Ctrl+C and npm run dev).

### Common Development Tasks

**Format code:**
```bash
npm run format
```

**Check for TypeScript errors:**
```bash
npx tsc --noEmit
```

**Build for production:**
```bash
npm run build
```

## Troubleshooting

### Port Already in Use

If you get an error like "Port 5173 is already in use":

**Kill the process using the port:**

On macOS/Linux:
```bash
lsof -i :5173
kill -9 <PID>
```

On Windows:
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Excel File Not Parsing

- Ensure the file is in .xlsx format (not .xls or .csv)
- Check that required columns exist: ID, Destination, Risk Score, Temperature, Status
- Verify column headers match (case-insensitive)
- Try with sample data first (see SAMPLE_DATA.md)

### Dependencies Not Installing

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Module Not Found Error

1. Check spelling of imports in your code
2. Ensure all dependencies are installed: `npm install`
3. Restart the dev server: Ctrl+C and `npm run dev`

## Building for Production

To create an optimized production build:

```bash
npm run build
```

This creates a `dist` folder with optimized and minified files.

To preview the production build locally:

```bash
npm run preview
```

## Environment Variables

Create a `.env.local` file in the project root if you need environment variables:

```
VITE_API_URL=http://localhost:3000
```

Access in your code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Performance Tips

1. **Use React DevTools** browser extension for debugging
2. **Check Network tab** in browser DevTools to see file sizes
3. **Monitor** bundle size with `npm run build` output

## API Endpoints (Backend)

When backend is running on `localhost:3000`:

- `GET /api/shipments` - Get all shipments
- `GET /api/shipments/:id` - Get specific shipment
- `POST /api/shipments` - Create new shipment
- `GET /api/analytics` - Get analytics summary

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run server` | Start backend server |
| `npm run dev:full` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm install` | Install dependencies |

## VS Code Extensions (Recommended)

To enhance your development experience, install:

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Thunder Client** or **REST Client** (for API testing)
- **GitLens** (for git integration)

## Next Steps

1. ✓ Install Node.js and npm
2. ✓ Run `npm install` in project directory
3. ✓ Start dev server with `npm run dev:full`
4. ✓ Open `http://localhost:5173`
5. ✓ Create sample Excel file
6. ✓ Upload and test with your data
7. ✓ Explore the dashboard and features

## Support

For issues or questions:

1. Check this setup guide
2. Review `README.md` for feature documentation
3. Check `SAMPLE_DATA.md` for data format help
4. Review browser console for errors (F12 key)

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [Recharts Documentation](https://recharts.org)
- [TypeScript Documentation](https://www.typescriptlang.org)

Happy developing! 🚀
