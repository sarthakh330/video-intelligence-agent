/**
 * Configuration Examples
 *
 * Copy one of these examples to the CONFIG object in main.js
 */

// Example 1: Python FastAPI backend + Next.js frontend
const PYTHON_NEXTJS = {
  backendScript: '/Users/yourname/project/backend/main.py',
  backendCommand: 'python3',
  frontendUrl: 'http://localhost:3000',
  backendPort: 3000,
  startupTimeout: 30000
};

// Example 2: Node.js Express backend + React frontend
const NODE_REACT = {
  backendScript: '/Users/yourname/project/backend/server.js',
  backendCommand: 'node',
  frontendUrl: 'http://localhost:5173',
  backendPort: 5173,
  startupTimeout: 30000
};

// Example 3: Shell script that starts everything
const SHELL_SCRIPT = {
  backendScript: '/Users/yourname/project/start-all.sh',
  backendCommand: 'bash',
  frontendUrl: 'http://localhost:8000',
  backendPort: 8000,
  startupTimeout: 45000
};

// Example 4: NPM script (requires shell wrapper)
// Create a shell script like:
// #!/bin/bash
// cd /path/to/project && npm run dev
const NPM_SCRIPT = {
  backendScript: '/Users/yourname/project/start-dev.sh',
  backendCommand: 'bash',
  frontendUrl: 'http://localhost:3000',
  backendPort: 3000,
  startupTimeout: 60000
};

module.exports = {
  PYTHON_NEXTJS,
  NODE_REACT,
  SHELL_SCRIPT,
  NPM_SCRIPT
};
