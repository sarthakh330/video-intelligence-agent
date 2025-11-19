/**
 * Preload script for Electron
 *
 * This script runs in a sandboxed context before the renderer process loads.
 * It provides a secure bridge between the renderer (frontend) and main process.
 *
 * With contextIsolation enabled, this is the only way to safely expose
 * Node.js/Electron APIs to the frontend without security risks.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
// These will be available as window.electronAPI in your frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Send a message to the main process
  // sendMessage: (channel, data) => {
  //   // Whitelist channels for security
  //   const validChannels = ['toMain'];
  //   if (validChannels.includes(channel)) {
  //     ipcRenderer.send(channel, data);
  //   }
  // },

  // Example: Receive messages from the main process
  // onMessage: (channel, callback) => {
  //   const validChannels = ['fromMain'];
  //   if (validChannels.includes(channel)) {
  //     ipcRenderer.on(channel, (event, ...args) => callback(...args));
  //   }
  // },

  // Platform information
  platform: process.platform,

  // App version (if needed)
  // appVersion: () => ipcRenderer.invoke('app-version')
});

console.log('Preload script loaded successfully');
