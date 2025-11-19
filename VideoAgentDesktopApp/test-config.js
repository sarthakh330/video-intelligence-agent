#!/usr/bin/env node
/**
 * Configuration Test Script
 * Run this before building the DMG to verify everything is configured correctly
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Colors for terminal output
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

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

console.log('\n' + '='.repeat(60));
logInfo('Testing Video Agent Desktop App Configuration');
console.log('='.repeat(60) + '\n');

let allTestsPassed = true;

// Test 1: Check required files
logInfo('Test 1: Checking required files...');
const requiredFiles = [
  { name: 'main.js', required: true },
  { name: 'preload.js', required: true },
  { name: 'package.json', required: true },
  { name: 'start-server.sh', required: true },
  { name: 'build/entitlements.mac.plist', required: true }
];

requiredFiles.forEach(({ name, required }) => {
  const filePath = path.join(__dirname, name);
  if (fs.existsSync(filePath)) {
    logSuccess(`Found: ${name}`);
  } else {
    if (required) {
      logError(`Missing required file: ${name}`);
      allTestsPassed = false;
    } else {
      logWarning(`Optional file not found: ${name}`);
    }
  }
});

// Test 2: Check start-server.sh
logInfo('\nTest 2: Checking start-server.sh configuration...');
const scriptPath = path.join(__dirname, 'start-server.sh');

if (fs.existsSync(scriptPath)) {
  // Check if executable
  try {
    fs.accessSync(scriptPath, fs.constants.X_OK);
    logSuccess('start-server.sh is executable');
  } catch (error) {
    logError('start-server.sh is not executable');
    logInfo('Fix with: chmod +x start-server.sh');
    allTestsPassed = false;
  }

  // Check script contents
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  // Check for absolute path
  if (scriptContent.includes('PROJECT_DIR=')) {
    const projectDirMatch = scriptContent.match(/PROJECT_DIR="(.+)"/);
    if (projectDirMatch) {
      const projectDir = projectDirMatch[1];
      logInfo(`Project directory: ${projectDir}`);

      if (fs.existsSync(projectDir)) {
        logSuccess('Project directory exists');

        // Check for package.json
        const packageJsonPath = path.join(projectDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          logSuccess('package.json found in project directory');

          // Check for required scripts
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.scripts && packageJson.scripts.dev) {
              logSuccess('npm run dev script exists');
            } else {
              logError('package.json missing "dev" script');
              allTestsPassed = false;
            }
          } catch (error) {
            logError(`Failed to parse package.json: ${error.message}`);
            allTestsPassed = false;
          }
        } else {
          logError('package.json not found in project directory');
          allTestsPassed = false;
        }
      } else {
        logError(`Project directory does not exist: ${projectDir}`);
        logInfo('Update PROJECT_DIR in start-server.sh');
        allTestsPassed = false;
      }
    } else {
      logError('Could not extract PROJECT_DIR from script');
      allTestsPassed = false;
    }
  } else {
    logError('PROJECT_DIR not set in start-server.sh');
    logInfo('Script must use absolute path for PROJECT_DIR');
    allTestsPassed = false;
  }
}

// Test 3: Check package.json build config
logInfo('\nTest 3: Checking package.json build configuration...');
const packageJsonPath = path.join(__dirname, 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (packageJson.build) {
    logSuccess('Build configuration found');

    // Check files array
    if (packageJson.build.files) {
      const requiredBuildFiles = ['main.js', 'preload.js', 'start-server.sh', 'package.json'];
      const missingFiles = requiredBuildFiles.filter(f => !packageJson.build.files.includes(f));

      if (missingFiles.length === 0) {
        logSuccess('All required files included in build');
      } else {
        logError(`Missing from build.files: ${missingFiles.join(', ')}`);
        allTestsPassed = false;
      }
    } else {
      logError('build.files array not found');
      allTestsPassed = false;
    }

    // Check mac config
    if (packageJson.build.mac) {
      logSuccess('macOS build configuration found');

      if (packageJson.build.mac.target) {
        logSuccess('Build target configured');
      } else {
        logError('Build target not configured');
        allTestsPassed = false;
      }
    } else {
      logError('macOS build configuration missing');
      allTestsPassed = false;
    }

    // Check DMG config
    if (packageJson.build.dmg) {
      logSuccess('DMG configuration found');
    } else {
      logWarning('DMG configuration not found (will use defaults)');
    }
  } else {
    logError('Build configuration missing in package.json');
    allTestsPassed = false;
  }
} catch (error) {
  logError(`Failed to parse package.json: ${error.message}`);
  allTestsPassed = false;
}

// Test 4: Check main.js configuration
logInfo('\nTest 4: Checking main.js configuration...');
const mainJsPath = path.join(__dirname, 'main.js');

try {
  const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

  // Check for CONFIG object
  if (mainJsContent.includes('const CONFIG = {')) {
    logSuccess('CONFIG object found');

    // Check for key configuration
    if (mainJsContent.includes('backendScript:')) {
      logSuccess('backendScript configured');
    } else {
      logError('backendScript not configured');
      allTestsPassed = false;
    }

    if (mainJsContent.includes('backendCommand:')) {
      logSuccess('backendCommand configured');
    } else {
      logError('backendCommand not configured');
      allTestsPassed = false;
    }

    if (mainJsContent.includes('frontendUrl:')) {
      logSuccess('frontendUrl configured');
    } else {
      logError('frontendUrl not configured');
      allTestsPassed = false;
    }

    // Check that spawn doesn't use problematic cwd
    if (mainJsContent.includes('spawn(CONFIG.backendCommand')) {
      const spawnMatch = mainJsContent.match(/spawn\(CONFIG\.backendCommand[^}]+\}/s);
      if (spawnMatch && !spawnMatch[0].includes('cwd: path.dirname')) {
        logSuccess('spawn configuration looks good (no problematic cwd)');
      } else if (spawnMatch && spawnMatch[0].includes('cwd: path.dirname')) {
        logWarning('spawn uses path.dirname for cwd - this may cause issues');
        logInfo('Consider removing cwd option from spawn');
      }
    }
  } else {
    logError('CONFIG object not found in main.js');
    allTestsPassed = false;
  }
} catch (error) {
  logError(`Failed to read main.js: ${error.message}`);
  allTestsPassed = false;
}

// Test 5: Check bash command
logInfo('\nTest 5: Checking bash command availability...');
const testBash = spawn('bash', ['--version'], {
  stdio: 'ignore',
  timeout: 5000
});

testBash.on('error', (error) => {
  logError('bash command not available');
  allTestsPassed = false;
  showResults();
});

testBash.on('exit', (code) => {
  if (code === 0) {
    logSuccess('bash command available');
  } else {
    logError('bash command failed');
    allTestsPassed = false;
  }
  showResults();
});

function showResults() {
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    logSuccess('✨ All tests passed! Ready to build DMG');
    logInfo('\nTo build the DMG, run:');
    log('  npm run dist:force', colors.blue);
    logInfo('\nOr test in development mode first:');
    log('  npm start', colors.blue);
  } else {
    logError('❌ Some tests failed. Please fix the issues above.');
    process.exit(1);
  }
  console.log('='.repeat(60) + '\n');
}
