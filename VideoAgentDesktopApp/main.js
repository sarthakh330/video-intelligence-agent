const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let backendProcess;

// ==============================
// CONFIGURATION - UPDATE THESE PATHS
// ==============================

// Determine script path based on environment
// In development: __dirname points to the project folder
// In production: script is in app.asar.unpacked
const getScriptPath = () => {
  const isDev = !app.isPackaged;

  if (isDev) {
    // Development mode - script is in same folder as main.js
    return path.join(__dirname, 'start-server.sh');
  } else {
    // Production mode - script is in app.asar.unpacked
    // __dirname in prod is typically: /path/to/App.app/Contents/Resources/app.asar
    // We need: /path/to/App.app/Contents/Resources/app.asar.unpacked/start-server.sh
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'start-server.sh');
  }
};

const CONFIG = {
  // Path to your backend start script (Python, Node, etc.)
  // Examples:
  //   Python: '/path/to/backend/start_server.py'
  //   Node: '/path/to/backend/server.js'
  backendScript: getScriptPath(),

  // Command to run the backend (e.g., 'python3', 'node', etc.)
  backendCommand: 'bash',

  // URL where your frontend is served (after backend starts)
  // Examples: 'http://localhost:3000', 'http://localhost:8000'
  frontendUrl: 'http://localhost:3000',

  // Port to check for backend readiness
  backendPort: 3000,

  // Maximum time to wait for backend (milliseconds)
  startupTimeout: 60000
};

// ==============================
// HELPER FUNCTIONS
// ==============================

/**
 * Check if backend server is reachable
 */
function checkBackendReady(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 1000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Wait for backend to be ready with exponential backoff
 */
async function waitForBackend(port, timeout) {
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < timeout) {
    const isReady = await checkBackendReady(port);

    if (isReady) {
      console.log('✓ Backend is ready!');
      return true;
    }

    // Exponential backoff: 100ms, 200ms, 400ms, 800ms, then 1000ms max
    const delay = Math.min(100 * Math.pow(2, attempt), 1000);
    await new Promise(resolve => setTimeout(resolve, delay));
    attempt++;

    console.log(`Waiting for backend... (attempt ${attempt})`);
  }

  console.error('✗ Backend startup timeout');
  return false;
}

/**
 * Start the backend subprocess
 */
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend process...');
    console.log(`Command: ${CONFIG.backendCommand} ${CONFIG.backendScript}`);

    // Spawn the backend process
    backendProcess = spawn(CONFIG.backendCommand, [CONFIG.backendScript], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env
    });

    // Log backend output
    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code}, signal ${signal}`);
      if (code !== 0 && code !== null) {
        // Backend crashed, show error and quit
        let errorMessage = `Backend process exited unexpectedly with code ${code}`;

        // Provide helpful error messages for common exit codes
        if (code === 126) {
          errorMessage += '\n\nExit code 126: Permission denied or script not executable.\n\nThis usually means:\n1. The start-server.sh script is not executable\n2. The script has incorrect permissions\n\nPlease report this issue.';
        } else if (code === 127) {
          errorMessage += '\n\nExit code 127: Command not found.\n\nThe script tried to run a command that does not exist.';
        } else if (code === 1) {
          errorMessage += '\n\nThe backend script encountered an error. Check that:\n1. All dependencies are installed\n2. Your .env file is configured\n3. The project path is correct';
        }

        dialog.showErrorBox('Backend Error', errorMessage);
        app.quit();
      }
    });

    // Give the process a moment to start, then resolve
    setTimeout(() => resolve(), 500);
  });
}

/**
 * Stop the backend subprocess
 */
function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend process...');
    backendProcess.kill('SIGTERM');

    // Force kill after 5 seconds if still running
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('Force killing backend process...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);

    backendProcess = null;
  }
}

/**
 * Create the main Electron window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
    show: false // Don't show until ready
  });

  // Load the frontend URL
  mainWindow.loadURL(CONFIG.frontendUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Optional: Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

// ==============================
// APP LIFECYCLE
// ==============================

/**
 * Initialize the application
 */
async function initialize() {
  try {
    // Step 1: Start backend
    await startBackend();

    // Step 2: Wait for backend to be ready
    console.log('Waiting for backend to be ready...');
    const isReady = await waitForBackend(CONFIG.backendPort, CONFIG.startupTimeout);

    if (!isReady) {
      dialog.showErrorBox(
        'Startup Error',
        `Backend did not start within ${CONFIG.startupTimeout / 1000} seconds.\n\nPlease check:\n1. Backend script path is correct\n2. Backend command is correct\n3. Required dependencies are installed`
      );
      app.quit();
      return;
    }

    // Step 3: Create window and load frontend
    createWindow();

  } catch (error) {
    console.error('Initialization error:', error);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start application: ${error.message}`
    );
    app.quit();
  }
}

// When Electron is ready
app.whenReady().then(initialize);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Clean up backend process before quitting
app.on('before-quit', () => {
  stopBackend();
});

// Handle any unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});
