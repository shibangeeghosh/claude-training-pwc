---
name: dev-server
description: Start and manage the development server with hot reload
skills:
  - React development
  - Vite dev server
  - Hot module replacement
---

# Development Server Skill

Manages the ALCOA+ QA application development server.

## Commands

### Start Development Server
```bash
npm run dev
```
Server runs on http://localhost:3000 with hot module replacement enabled.

### With Debug Mode
```bash
npm run dev -- --debug
npm run dev -- --debug=verbose
npm run dev -- --debug=profile
```

### Monitor for Changes
The dev server automatically:
- Reloads on file changes
- Updates styles instantly
- Preserves component state
- Shows error overlays

## Common Tasks

### Check Server Status
```bash
# Server is running if you can access http://localhost:3000
curl http://localhost:3000
```

### Kill Dev Server
```bash
# Find process on port 3000
lsof -i :3000

# Kill by PID
kill -9 <PID>
```

### Troubleshooting

**Port already in use:**
```bash
# Change port
PORT=3001 npm run dev
```

**Module not found:**
```bash
# Reinstall dependencies
npm install
npm run dev
```

**Hot reload not working:**
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Restart dev server: `npm run dev`

## Development Workflow

1. Start dev server: `npm run dev`
2. Make code changes
3. Hot reload happens automatically
4. Test in browser at http://localhost:3000
5. Check console for errors/warnings
6. Commit when ready: `git commit`

## Files Watched

- `src/**/*.{js,jsx,css}`
- `index.html`
- `tailwind.config.js`
- `vite.config.js`

## Performance Tips

- Use React DevTools for debugging
- Enable debug mode for detailed logging
- Keep hot reload enabled for rapid iteration
- Monitor for console errors in real-time
