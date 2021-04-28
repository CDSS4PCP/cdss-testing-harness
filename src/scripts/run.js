#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);

const scriptBasePath = path.resolve(__dirname);

if (process.platform === 'win32') {
  const runTests = spawn(path.join(scriptBasePath, 'run_tests.bat'), args, { stdio: 'inherit' });
  runTests.on('close', (code) => {
    process.exit(code);
  });
} else {
  const runTests = spawn(path.join(scriptBasePath, 'run_tests.sh'), args, { stdio: 'inherit' });
  runTests.on('close', (code) => {
    process.exit(code);
  });
}
