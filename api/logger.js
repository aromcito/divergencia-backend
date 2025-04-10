const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs', 'auth.log');

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFile(logPath, logMessage, (err) => {
    if (err) console.error('❌ Error al escribir el log:', err);
  });
};

module.exports = { logToFile };
