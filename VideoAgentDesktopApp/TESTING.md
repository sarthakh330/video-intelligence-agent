# Testing Guide

This document describes the comprehensive test suite for the Video Agent Desktop App.

## Test Suite Overview

We have created **3 comprehensive test files** that validate different aspects of the application:

### 1. **test-permissions.js** - Permission & Executable Tests
Validates that all files have correct permissions and can be executed.

**What it tests:**
- File permissions (executable bits)
- Shebang lines in scripts
- Line endings (must be Unix LF, not Windows CRLF)
- Script syntax validation
- Project path validation

**Run:** `npm run test:permissions`

---

### 2. **test-config.js** - Configuration Tests
Validates the app configuration before building.

**What it tests:**
- Required files exist
- start-server.sh configuration
- Project directory exists and has package.json
- package.json build configuration
- main.js configuration
- Backend command availability

**Run:** `npm run test:config`

---

### 3. **test-integration.js** - Integration Tests
Simulates the actual app startup process to verify everything works end-to-end.

**What it tests:**
- Can spawn the start-server.sh script
- Backend starts successfully
- Server becomes reachable on the configured port
- Full startup flow works as expected

**Run:** `npm run test:integration`

⚠️ **Warning:** This test actually starts your server and takes 30-60 seconds. It will automatically clean up when done.

---

## Running Tests

### Run Pre-Build Tests (Recommended before every build)
```bash
npm test
```
This runs both permission and configuration tests.

### Run All Tests (Including Integration)
```bash
npm run test:all
```
This runs all 3 test suites including the full integration test.

### Run Individual Tests
```bash
npm run test:permissions  # Just permission tests
npm run test:config       # Just configuration tests
npm run test:integration  # Just integration tests (starts server)
```

---

## When to Run Tests

### Before Building DMG
```bash
npm test          # Quick validation
npm run dist      # Builds DMG (runs tests automatically)
```

### After Changing Configuration
```bash
npm run test:config
```

### After Modifying Scripts
```bash
npm run test:permissions
```

### Verifying Full Startup Flow
```bash
npm run test:integration  # Takes 30-60 seconds
```

---

## Test Output

### ✅ Success
All tests passed! You'll see green checkmarks for each test:
```
✓ start-server.sh is executable
✓ Project directory exists
✓ spawn configuration looks good
```

### ❌ Failure
Failed tests show red X marks with helpful error messages:
```
✗ start-server.sh is NOT executable (required)
  Fix with: chmod +x start-server.sh
```

---

## Common Issues & Fixes

### Exit Code 126: Permission Denied
**Problem:** Script is not executable

**Fix:**
```bash
chmod +x VideoAgentDesktopApp/start-server.sh
```

### CRLF Line Endings
**Problem:** Windows line endings cause "bad interpreter" errors

**Fix:**
```bash
dos2unix VideoAgentDesktopApp/start-server.sh
```
Or in VS Code: Change "End of Line Sequence" to LF

### Project Directory Not Found
**Problem:** PROJECT_DIR in start-server.sh points to wrong location

**Fix:** Edit `start-server.sh` and update the PROJECT_DIR variable with the correct absolute path

---

## Build Hooks

The test suite works with two build hooks that run during DMG creation:

### beforeBuild Hook
- Runs before packaging starts
- Validates configuration
- Checks that start-server.sh exists

### afterPack Hook
- Runs after app is packaged
- Makes start-server.sh executable in the packaged app
- Verifies the script is in the correct location (app.asar.unpacked)

These hooks are defined in [build-hooks.js](build-hooks.js).

---

## Integration with CI/CD

To integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd VideoAgentDesktopApp
    npm install
    npm test

- name: Build DMG
  run: |
    cd VideoAgentDesktopApp
    npm run dist
```

---

## Debugging Test Failures

### Enable Verbose Logging
Tests output detailed information about what they're checking. Look for:
- File paths being tested
- Permission values (octal)
- Configuration values
- Error messages with suggested fixes

### Manual Verification
If tests pass but the app still fails:

1. **Check the built app manually:**
```bash
ls -la "VideoAgentDesktopApp/dist/mac-arm64/Video Agent.app/Contents/Resources/app.asar.unpacked/"
```

2. **Verify script permissions in built app:**
```bash
ls -l "VideoAgentDesktopApp/dist/mac-arm64/Video Agent.app/Contents/Resources/app.asar.unpacked/start-server.sh"
```

3. **Test script directly:**
```bash
bash "VideoAgentDesktopApp/start-server.sh"
```

---

## Test Coverage

| Area | Covered By |
|------|------------|
| File permissions | test-permissions.js |
| Configuration validity | test-config.js |
| Script syntax | test-permissions.js |
| Line endings | test-permissions.js |
| Path resolution | test-config.js |
| Build configuration | test-config.js |
| Backend spawn | test-integration.js |
| Server startup | test-integration.js |
| Port reachability | test-integration.js |

---

## Maintaining Tests

### Adding New Tests
1. Create a new test file or add to existing ones
2. Follow the same output format (using logSuccess, logError, etc.)
3. Add to package.json scripts
4. Document in this guide

### Test File Structure
```javascript
// 1. Imports
const fs = require('fs');
const path = require('path');

// 2. Logging functions
function logSuccess(message) { ... }
function logError(message) { ... }

// 3. Test logic
let allTestsPassed = true;
// ... run tests ...

// 4. Results
if (allTestsPassed) {
  process.exit(0);
} else {
  process.exit(1);
}
```

---

## FAQ

**Q: Do I need to run tests manually?**
A: No, `npm run dist` automatically runs tests before building.

**Q: Can I skip tests?**
A: Yes, use `npm run dist:force` to build without tests (not recommended).

**Q: Why does test:integration take so long?**
A: It actually starts your Next.js server, which needs time to compile. This is normal.

**Q: Can tests run in parallel?**
A: Yes, test:permissions and test:config can run in parallel. test:integration should run separately.

**Q: What if tests pass but the app still fails?**
A: Check the Console.app logs for more details about what's happening when the app runs.

---

## Related Files

- [test-permissions.js](test-permissions.js) - Permission tests
- [test-config.js](test-config.js) - Configuration tests
- [test-integration.js](test-integration.js) - Integration tests
- [build-hooks.js](build-hooks.js) - Build hooks
- [package.json](package.json) - Test scripts configuration

---

**Last Updated:** November 2025
**Test Suite Version:** 1.0.0
