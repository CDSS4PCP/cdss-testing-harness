#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);

const scriptBasePath = path.resolve(__dirname);

if (process.platform === 'win32') {
  spawn(path.join(scriptBasePath, 'run_tests.bat'), args, { stdio: 'inherit' });
} else {
  spawn(path.join(scriptBasePath, 'run_tests.sh'), args, { stdio: 'inherit' });
}
