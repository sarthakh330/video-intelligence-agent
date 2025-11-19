# Video Agent Desktop App

Electron wrapper for the Video Intelligence Agent project, packaged as a macOS desktop application.

## Quick Start

### 1. Configure Paths

Open `main.js` and update the `CONFIG` object at the top of the file:

```javascript
const CONFIG = {
  // Path to your backend start script
  backendScript: '/absolute/path/to/your/backend/start_script.py',

  // Command to run the backend
  backendCommand: 'python3',  // or 'node', 'npm', etc.

  // URL where your frontend is served
  frontendUrl: 'http://localhost:3000',

  // Port to check for backend readiness
  backendPort: 3000,

  // Maximum startup wait time (milliseconds)
  startupTimeout: 30000
};
```

### 2. Build the DMG

```bash
cd VideoAgentDesktopApp
npm run dist
```

The `.dmg` file will be created in: `VideoAgentDesktopApp/dist/Video Agent-1.0.0-arm64.dmg`

### 3. Install and Run

Double-click the `.dmg` file, drag "Video Agent" to Applications, and launch it.

---

## Configuration Details

### Backend Script Path

**Absolute path required.** Examples:

- Python FastAPI: `/Users/yourname/project/backend/main.py`
- Node.js Express: `/Users/yourname/project/backend/server.js`
- Shell script: `/Users/yourname/project/backend/start.sh`

### Backend Command

The command used to execute your backend script:

- `python3` - for Python scripts
- `node` - for Node.js scripts
- `npm` - if using `npm start`
- Custom command as needed

### Frontend URL

The URL where your web frontend will be served after the backend starts:

- Next.js dev: `http://localhost:3000`
- React/Vite: `http://localhost:5173`
- Python server: `http://localhost:8000`

Must match where your backend serves the frontend.

### Backend Port

The port the app will ping to verify the backend is ready. Usually the same as the port in `frontendUrl`.

---

## Available Scripts

### Development

```bash
npm start
```

Launches the Electron app in development mode. Useful for testing before building the DMG.

### Build DMG

```bash
npm run dist
```

Creates a macOS DMG installer. Output: `dist/Video Agent-1.0.0-arm64.dmg`

### Build Directory Only

```bash
npm run dist:dir
```

Creates the `.app` bundle without packaging into DMG (faster for testing).

### Clean Build

```bash
npm run clean
```

Removes the `dist/` and `build/` output directories.

---

## How It Works

1. **App Launch**: User opens the desktop app
2. **Backend Start**: Electron spawns your backend as a subprocess
3. **Health Check**: Polls backend port until it responds (with timeout)
4. **Window Load**: Once backend is ready, loads frontend URL in Electron window
5. **App Quit**: When user closes app, Electron kills the backend subprocess

---

## Project Structure

```
VideoAgentDesktopApp/
├── main.js                     # Electron main process (backend management)
├── preload.js                  # Secure IPC bridge
├── package.json                # Dependencies and build config
├── build/
│   └── entitlements.mac.plist  # macOS security entitlements
├── assets/
│   └── ICON_INFO.txt           # Icon placeholder (optional)
└── dist/                       # Build output (created after npm run dist)
    └── Video Agent-1.0.0-arm64.dmg
```

---

## Customization

### Change App Name

Edit `package.json`:

```json
"build": {
  "productName": "Your App Name",
  "appId": "com.yourcompany.yourapp"
}
```

### Add Custom Icon

1. Create a 1024x1024 PNG icon
2. Convert to `.icns`:
   ```bash
   # macOS built-in tool
   mkdir icon.iconset
   sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
   iconutil -c icns icon.iconset
   ```
3. Place `icon.icns` in `assets/` directory

### Adjust Window Size

Edit `main.js` in the `createWindow()` function:

```javascript
mainWindow = new BrowserWindow({
  width: 1400,   // Change width
  height: 900,   // Change height
  // ...
});
```

### Enable DevTools

Uncomment in `main.js`:

```javascript
mainWindow.webContents.openDevTools();
```

---

## Troubleshooting

### Backend doesn't start

**Check:**
1. `backendScript` path is absolute and correct
2. `backendCommand` is installed (`which python3` / `which node`)
3. Backend has required dependencies installed
4. Run backend manually first to verify it works

**Debug:** Run `npm start` and check console output.

### Backend starts but app shows error

**Check:**
1. `frontendUrl` matches where your backend serves the frontend
2. `backendPort` is correct
3. Backend is actually listening on the expected port

**Test:** Open `frontendUrl` in a browser after starting backend manually.

### Build fails

**Check:**
1. All dependencies installed: `npm install`
2. Xcode Command Line Tools installed: `xcode-select --install`
3. Sufficient disk space for build

### DMG won't open / "damaged" error

**On macOS:**
```bash
xattr -cr "Video Agent.app"
```

Or right-click the app and select "Open" to bypass Gatekeeper.

---

## System Requirements

- macOS 10.15 (Catalina) or later
- Node.js 18.x or later
- Your backend runtime (Python 3.x, Node.js, etc.)

---

## Notes

- This app does NOT bundle your existing project code
- You must configure paths to point to your actual backend/frontend
- Backend runs as a subprocess - all output is logged to console
- Backend is automatically terminated when app quits

---

## Next Steps

1. Update `CONFIG` in `main.js` with your actual paths
2. Test with `npm start` to verify everything works
3. Build DMG with `npm run dist`
4. Install and test the DMG
5. Distribute the `.dmg` file to users

Questions? Check the Electron documentation: https://www.electronjs.org/docs
