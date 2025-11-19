#!/bin/bash
# Startup script for Video Intelligence Agent

# Set strict error handling
set -e

# ==============================
# PATH Configuration
# ==============================

# Start with a clean, reliable PATH
# Add common npm/node locations first
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

# Try to add NVM paths if they exist (but don't fail if they don't)
if [ -d "$HOME/.nvm/versions/node" ]; then
    # Find the latest node version in NVM
    LATEST_NODE=$(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sort -V | tail -1)
    if [ -n "$LATEST_NODE" ] && [ -d "$HOME/.nvm/versions/node/$LATEST_NODE/bin" ]; then
        export PATH="$HOME/.nvm/versions/node/$LATEST_NODE/bin:$PATH"
        echo "Added NVM node version: $LATEST_NODE"
    fi
fi

# ==============================
# Find npm command
# ==============================

NPM_CMD=""

# Method 1: Check if npm is in PATH
if command -v npm >/dev/null 2>&1; then
    NPM_CMD=$(command -v npm)
    echo "Found npm in PATH: $NPM_CMD"
# Method 2: Check common Homebrew locations
elif [ -x "/opt/homebrew/bin/npm" ]; then
    NPM_CMD="/opt/homebrew/bin/npm"
    echo "Found npm at: $NPM_CMD"
elif [ -x "/usr/local/bin/npm" ]; then
    NPM_CMD="/usr/local/bin/npm"
    echo "Found npm at: $NPM_CMD"
# Method 3: Try to use node to find npm (if node exists)
elif command -v node >/dev/null 2>&1; then
    NODE_DIR=$(dirname "$(command -v node)")
    if [ -x "$NODE_DIR/npm" ]; then
        NPM_CMD="$NODE_DIR/npm"
        echo "Found npm alongside node: $NPM_CMD"
    fi
fi

# Verify npm was found and is executable
if [ -z "$NPM_CMD" ]; then
    echo "================================================"
    echo "ERROR: npm command not found!"
    echo "================================================"
    echo ""
    echo "Current PATH:"
    echo "$PATH"
    echo ""
    echo "Searched locations:"
    echo "  - command -v npm"
    echo "  - /opt/homebrew/bin/npm"
    echo "  - /usr/local/bin/npm"
    echo "  - ~/.nvm/versions/node/*/bin/npm"
    echo ""
    echo "Please ensure Node.js and npm are installed."
    echo "Visit: https://nodejs.org/"
    exit 127
fi

if [ ! -x "$NPM_CMD" ]; then
    echo "ERROR: npm found but not executable: $NPM_CMD"
    exit 126
fi

echo "✓ Using npm: $NPM_CMD"
echo "✓ npm version: $($NPM_CMD --version 2>&1 || echo 'unknown')"

# ==============================
# Project Configuration
# ==============================

# Absolute path to your project
PROJECT_DIR="/Users/sarthakhanda/Documents/Cursor-Exp/video intelligence agent"

echo "✓ Project directory: $PROJECT_DIR"

# Verify project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "ERROR: Project directory does not exist: $PROJECT_DIR"
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR" || {
    echo "ERROR: Could not change to project directory: $PROJECT_DIR"
    exit 1
}

# Verify package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in: $PROJECT_DIR"
    exit 1
fi

echo "✓ Changed to project directory"

# ==============================
# Port Management
# ==============================

# Check if port 3000 is already in use
PORT_PID=$(lsof -ti:3000 2>/dev/null || true)

if [ -n "$PORT_PID" ]; then
    echo "⚠ Port 3000 is already in use by process $PORT_PID"
    echo "Attempting to kill existing process..."

    # Try graceful kill first
    kill "$PORT_PID" 2>/dev/null || true
    sleep 2

    # Check if still running, force kill if needed
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "Forcing kill of process $PORT_PID..."
        kill -9 "$PORT_PID" 2>/dev/null || true
        sleep 1
    fi

    # Final check
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "ERROR: Could not free port 3000. Please manually kill the process."
        exit 1
    fi

    echo "✓ Port 3000 is now free"
fi

echo "================================================"
echo "Starting Next.js development server..."
echo "================================================"

# Start Next.js development server
# Use exec to replace the shell process with npm
exec "$NPM_CMD" run dev
