#!/usr/bin/env node
/**
 * Permission & Executable Tests
 * Validates that all files have correct permissions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
logInfo('Permission & Executable Tests');
console.log('='.repeat(60) + '\n');

let allTestsPassed = true;

// Test 1: Check file permissions
logInfo('Test 1: Checking file permissions...\n');

const filesToCheck = [
  { path: 'start-server.sh', shouldBeExecutable: true },
  { path: 'test-config.js', shouldBeExecutable: true },
  { path: 'test-integration.js', shouldBeExecutable: true },
  { path: 'test-permissions.js', shouldBeExecutable: true },
  { path: 'main.js', shouldBeExecutable: false },
  { path: 'preload.js', shouldBeExecutable: false },
  { path: 'package.json', shouldBeExecutable: false }
];

filesToCheck.forEach(({ path: filePath, shouldBeExecutable }) => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    logWarning(`File not found: ${filePath}`);
    return;
  }

  try {
    const stats = fs.statSync(fullPath);
    const mode = stats.mode;
    const isExecutable = !!(mode & fs.constants.S_IXUSR);

    if (shouldBeExecutable) {
      if (isExecutable) {
        logSuccess(`${filePath} is executable`);
      } else {
        logError(`${filePath} is NOT executable (required)`);
        logInfo(`  Fix with: chmod +x ${filePath}`);
        allTestsPassed = false;
      }
    } else {
      if (!isExecutable) {
        logSuccess(`${filePath} has correct permissions`);
      } else {
        logWarning(`${filePath} is executable (not required)`);
      }
    }

    // Show octal permissions
    const octal = (mode & parseInt('777', 8)).toString(8);
    logInfo(`  Permissions: ${octal}`);

  } catch (error) {
    logError(`Failed to check ${filePath}: ${error.message}`);
    allTestsPassed = false;
  }
});

// Test 2: Check shebang lines
logInfo('\nTest 2: Checking shebang lines in scripts...\n');

const scriptsToCheck = [
  'start-server.sh',
  'test-config.js',
  'test-integration.js',
  'test-permissions.js'
];

scriptsToCheck.forEach((scriptPath) => {
  const fullPath = path.join(__dirname, scriptPath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const firstLine = content.split('\n')[0];

  if (firstLine.startsWith('#!')) {
    logSuccess(`${scriptPath} has shebang: ${firstLine}`);

    // Verify the interpreter exists
    const interpreter = firstLine.replace('#!', '').split(' ')[0];
    if (interpreter.startsWith('/usr/bin/env')) {
      const command = firstLine.split(' ')[1];
      try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        logSuccess(`  Interpreter found: ${command}`);
      } catch (error) {
        logError(`  Interpreter not found: ${command}`);
        allTestsPassed = false;
      }
    }
  } else {
    logWarning(`${scriptPath} missing shebang line`);
    if (scriptPath.endsWith('.sh')) {
      logInfo(`  Should start with: #!/bin/bash`);
    } else if (scriptPath.endsWith('.js')) {
      logInfo(`  Should start with: #!/usr/bin/env node`);
    }
  }
});

// Test 3: Check line endings (CRLF vs LF)
logInfo('\nTest 3: Checking line endings (must be Unix LF)...\n');

scriptsToCheck.forEach((scriptPath) => {
  const fullPath = path.join(__dirname, scriptPath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');

  if (content.includes('\r\n')) {
    logError(`${scriptPath} has Windows line endings (CRLF)`);
    logInfo(`  Convert to Unix line endings with: dos2unix ${scriptPath}`);
    logInfo(`  Or in VS Code: Change End of Line Sequence to LF`);
    allTestsPassed = false;
  } else {
    logSuccess(`${scriptPath} has Unix line endings (LF)`);
  }
});

// Test 4: Try to execute start-server.sh with bash
logInfo('\nTest 4: Testing script execution...\n');

const startServerPath = path.join(__dirname, 'start-server.sh');

try {
  // Try to run bash --version through the script method
  logInfo('Testing: bash --version');
  const result = execSync('bash --version', {
    encoding: 'utf8',
    timeout: 5000
  });
  logSuccess('bash command works');

  // Check if we can read the script
  logInfo(`Testing: Can read ${startServerPath}`);
  fs.accessSync(startServerPath, fs.constants.R_OK);
  logSuccess('Script is readable');

  // Check if we can execute it
  logInfo(`Testing: Can execute ${startServerPath}`);
  try {
    fs.accessSync(startServerPath, fs.constants.X_OK);
    logSuccess('Script has execute permission');

    // Try to parse it (won't actually run, just check syntax)
    logInfo('Testing: bash -n start-server.sh (syntax check)');
    try {
      execSync(`bash -n "${startServerPath}"`, {
        encoding: 'utf8',
        timeout: 5000
      });
      logSuccess('Script syntax is valid');
    } catch (error) {
      logError('Script has syntax errors');
      logInfo(error.stderr || error.message);
      allTestsPassed = false;
    }

  } catch (error) {
    logError('Script does NOT have execute permission');
    logInfo(`Fix with: chmod +x ${startServerPath}`);
    allTestsPassed = false;
  }

} catch (error) {
  logError(`Execution test failed: ${error.message}`);
  allTestsPassed = false;
}

// Test 5: Check project path in script
logInfo('\nTest 5: Validating project path in start-server.sh...\n');

const scriptContent = fs.readFileSync(startServerPath, 'utf8');
const projectDirMatch = scriptContent.match(/PROJECT_DIR="(.+)"/);

if (projectDirMatch) {
  const projectDir = projectDirMatch[1];
  logInfo(`Found PROJECT_DIR: ${projectDir}`);

  if (fs.existsSync(projectDir)) {
    logSuccess('Project directory exists');

    const packageJsonPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      logSuccess('package.json found');

      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.scripts && packageJson.scripts.dev) {
          logSuccess('"dev" script exists');
        } else {
          logError('"dev" script missing from package.json');
          allTestsPassed = false;
        }
      } catch (error) {
        logError(`Failed to parse package.json: ${error.message}`);
        allTestsPassed = false;
      }
    } else {
      logError('package.json not found');
      allTestsPassed = false;
    }
  } else {
    logError(`Project directory does not exist: ${projectDir}`);
    allTestsPassed = false;
  }
} else {
  logError('PROJECT_DIR not found in script');
  allTestsPassed = false;
}

// Results
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  logSuccess('✨ All permission tests PASSED!');
  console.log('='.repeat(60) + '\n');
  process.exit(0);
} else {
  logError('❌ Some permission tests FAILED!');
  logInfo('\nCommon fixes:');
  logInfo('1. Make scripts executable: chmod +x start-server.sh');
  logInfo('2. Convert line endings: dos2unix start-server.sh');
  logInfo('3. Verify bash is installed: which bash');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}
