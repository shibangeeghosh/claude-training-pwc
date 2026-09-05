---
name: build-deploy
description: Build for production and prepare for deployment
skills:
  - Production build
  - Vite bundling
  - Build optimization
  - Deployment prep
---

# Build & Deploy Skill

Handles production builds and deployment preparation.

## Build Commands

### Production Build
```bash
npm run build
```
Creates optimized production bundle in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Serves production build locally at http://localhost:4173 for testing.

## Build Process

### What Happens
1. React components compiled to JavaScript
2. CSS bundled and minified
3. Assets optimized and compressed
4. Vite creates optimized chunks
5. Source maps generated
6. Output to `dist/` folder

### Output Files
```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-*.js      # Main bundle
│   ├── index-*.css     # Styles
│   └── vendor-*.js     # Dependencies
└── manifest.json       # Build metadata
```

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Run `npm run preview` and test
- [ ] Check console for warnings/errors
- [ ] Verify all links work
- [ ] Test authentication flow
- [ ] Check API integration
- [ ] Verify environment variables
- [ ] Performance acceptable
- [ ] No debug code present
- [ ] Git status clean

## Environment Variables

### Production (.env.production)
```
VITE_APP_NAME=ALCOA+ QA Compliance
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.example.com
VITE_DB_HOST=production-db.example.com
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=info
```

### Local Testing (.env)
```
VITE_APP_NAME=ALCOA+ QA Compliance
VITE_API_BASE_URL=http://localhost:3001
VITE_DB_HOST=localhost
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
```

## Deployment Targets

### Static Hosting (Netlify, Vercel)
1. Build: `npm run build`
2. Deploy: Upload `dist/` folder
3. Configure: Point to `index.html` for SPA routing

### Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Local Server
```bash
# Start HTTP server for dist/
npx http-server dist/
```

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf dist node_modules
npm install
npm run build
```

### Large Bundle Size
- Check: `npm run build` output
- Analyze: `npm install -g source-map-explorer`
- Run: `source-map-explorer 'dist/**/*.js'`

### Performance Issues
- Minimize images
- Use code splitting
- Enable gzip compression
- Cache assets

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm run preview &
```

## Rollback Plan

If deployment fails:
1. Identify issue in build output
2. Fix code locally
3. Re-run build: `npm run build`
4. Re-deploy from `dist/`

## Monitoring

After deployment:
- Monitor error logs
- Check user reports
- Track performance metrics
- Watch for failed API calls
- Monitor authentication issues
