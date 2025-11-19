/**
 * Electron Builder Hooks
 * These run during the build process to fix permissions and other issues
 */

const fs = require('fs');
const path = require('path');

/**
 * afterPack hook - runs after the app is packaged but before DMG is created
 * This ensures the start-server.sh script is executable in the packaged app
 */
exports.afterPack = async function(context) {
  console.log('\n🔧 Running afterPack hook...');

  const { appOutDir, electronPlatformName, packager } = context;

  if (electronPlatformName !== 'darwin') {
    console.log('  Skipping (not macOS)');
    return;
  }

  // Find the app bundle
  const appName = packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);
  const resourcesPath = path.join(appPath, 'Contents', 'Resources');

  // Script will be in app.asar.unpacked (because of asarUnpack config)
  const scriptPath = path.join(resourcesPath, 'app.asar.unpacked', 'start-server.sh');

  console.log(`  App path: ${appPath}`);
  console.log(`  Resources path: ${resourcesPath}`);
  console.log(`  Script path: ${scriptPath}`);

  // Check if script exists
  if (fs.existsSync(scriptPath)) {
    console.log('  ✓ Found start-server.sh in app.asar.unpacked');

    // Make it executable
    try {
      fs.chmodSync(scriptPath, 0o755);
      console.log('  ✓ Made start-server.sh executable (755)');

      // Verify
      const stats = fs.statSync(scriptPath);
      const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);

      if (isExecutable) {
        console.log('  ✓ Verified: script is now executable');
      } else {
        console.error('  ✗ Warning: chmod succeeded but script is still not executable');
      }
    } catch (error) {
      console.error(`  ✗ Failed to chmod: ${error.message}`);
      throw error;
    }
  } else {
    console.error('  ✗ start-server.sh not found in packaged app!');
    console.error('  Make sure it is included in build.files in package.json');
    throw new Error('start-server.sh not found in packaged app');
  }

  console.log('✓ afterPack hook completed\n');
};

/**
 * beforeBuild hook - runs before building starts
 * Validates configuration
 */
exports.beforeBuild = async function(context) {
  console.log('\n🔍 Running beforeBuild hook...');

  // Get project directory from context - different field names depending on electron-builder version
  const projectDir = context.projectDir || context.appDir || __dirname;
  console.log(`  Project dir: ${projectDir}`);

  const scriptPath = path.join(projectDir, 'start-server.sh');

  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    throw new Error('start-server.sh not found! Build cannot continue.');
  }
  console.log('  ✓ start-server.sh exists');

  // Check if it's executable (in source)
  const stats = fs.statSync(scriptPath);
  const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);

  if (!isExecutable) {
    console.log('  ⚠ Warning: start-server.sh is not executable in source');
    console.log('  It will be made executable in the packaged app via afterPack hook');
  } else {
    console.log('  ✓ start-server.sh is executable in source');
  }

  console.log('✓ beforeBuild hook completed\n');
};
