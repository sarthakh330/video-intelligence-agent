#!/usr/bin/env node
/**
 * Integration Test - Simulates actual app startup process
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

console.log('\n' + '='.repeat(60));
logInfo('Integration Test - Simulating App Startup');
console.log('='.repeat(60) + '\n');

let testProcess = null;
let testPassed = false;

// Cleanup function
function cleanup() {
  if (testProcess) {
    logInfo('Cleaning up test process...');
    testProcess.kill('SIGTERM');
    setTimeout(() => {
      if (testProcess && !testProcess.killed) {
        testProcess.kill('SIGKILL');
      }
    }, 3000);
  }
}

// Handle exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(testPassed ? 0 : 1);
});

// Test: Can we spawn the script like the app does?
logInfo('Test 1: Attempting to spawn start-server.sh...');

const scriptPath = path.join(__dirname, 'start-server.sh');
logInfo(`Script path: ${scriptPath}`);

testProcess = spawn('bash', [scriptPath], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env
});

let hasOutput = false;
let startTime = Date.now();
const STARTUP_TIMEOUT = 15000; // 15 seconds for test

// Capture output
testProcess.stdout.on('data', (data) => {
  hasOutput = true;
  const output = data.toString();
  logInfo(`[Server Output] ${output.trim()}`);

  // Check for successful startup indicators
  if (output.includes('Local:') || output.includes('localhost:3000') || output.includes('Ready')) {
    logSuccess('Server startup detected!');
    setTimeout(() => {
      testServerReachable();
    }, 2000);
  }
});

testProcess.stderr.on('data', (data) => {
  const output = data.toString();
  // Some stderr output is normal (npm warnings, etc)
  logInfo(`[Server Error] ${output.trim()}`);
});

testProcess.on('error', (error) => {
  logError(`Failed to spawn process: ${error.message}`);
  logError(`Error code: ${error.code}`);

  if (error.code === 'ENOENT') {
    logError('Bash command not found');
  } else if (error.code === 'EACCES') {
    logError('Permission denied - script not executable');
    logInfo('Fix with: chmod +x start-server.sh');
  }

  cleanup();
  process.exit(1);
});

testProcess.on('exit', (code, signal) => {
  if (code === 126) {
    logError('Exit code 126: Script found but not executable');
    logInfo('Fix with: chmod +x start-server.sh');
    logInfo('Also check that the script has Unix line endings (LF, not CRLF)');
  } else if (code === 127) {
    logError('Exit code 127: Command not found in script');
  } else if (code !== 0 && code !== null) {
    logError(`Process exited with code ${code}`);
    if (signal) {
      logInfo(`Signal: ${signal}`);
    }
  }

  if (code !== 0 && code !== null && !testPassed) {
    logError('\nIntegration test FAILED');
    process.exit(1);
  }
});

// Test if server is reachable
function testServerReachable() {
  logInfo('\nTest 2: Checking if server is reachable on port 3000...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    logSuccess(`Server responded with status: ${res.statusCode}`);
    testPassed = true;

    console.log('\n' + '='.repeat(60));
    logSuccess('✨ All integration tests PASSED!');
    logInfo('The app configuration is working correctly.');
    console.log('='.repeat(60) + '\n');

    cleanup();
    setTimeout(() => process.exit(0), 1000);
  });

  req.on('error', (error) => {
    logError(`Server not reachable: ${error.message}`);
    logError('This means the script started but the server is not responding');
    logInfo('Check that your project\'s "npm run dev" command works manually');

    cleanup();
    process.exit(1);
  });

  req.on('timeout', () => {
    logError('Server request timed out');
    cleanup();
    process.exit(1);
  });

  req.end();
}

// Timeout if nothing happens
setTimeout(() => {
  if (!hasOutput) {
    logError('No output received from script after 15 seconds');
    logError('The script may be stuck or not producing output');
    cleanup();
    process.exit(1);
  }
}, STARTUP_TIMEOUT);

logInfo('Waiting for server to start...');
logInfo('(This may take 30-60 seconds for Next.js to compile)\n');
