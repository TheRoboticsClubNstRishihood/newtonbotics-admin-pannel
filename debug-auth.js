#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test different authentication scenarios
async function testAuth() {
  console.log('🔍 Debugging Authentication Issues...\n');
  
  const ports = [3000, 3001, 3005];
  
  for (const port of ports) {
    console.log(`📡 Testing port ${port}...`);
    
    // Test 1: No auth
    console.log('  Test 1: No authentication');
    await makeRequest(port, '/api/events', {});
    
    // Test 2: Invalid token
    console.log('  Test 2: Invalid token');
    await makeRequest(port, '/api/events', {
      'Authorization': 'Bearer invalid-token'
    });
    
    // Test 3: Mock token
    console.log('  Test 3: Mock token');
    await makeRequest(port, '/api/events', {
      'Authorization': 'Bearer mock-token'
    });
    
    // Test 4: Long token (like JWT)
    console.log('  Test 4: JWT-like token');
    await makeRequest(port, '/api/events', {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY4YTFiMmMzZDRlNWY2YTdiOGM5ZDAiLCJlbWFpbCI6ImFkbWluQG5ld3RvbmJvdGljcy5jb20iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyIqIl0sImlhdCI6MTczNTczODA5MiwiZXhwIjoxNzM1ODI0NDkyfQ.test'
    });
    
    console.log('');
  }
}

function makeRequest(port, path, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const response = data.substring(0, 100);
        console.log(`    Status: ${status}, Response: ${response}...`);
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`    Error: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('    Timeout');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

testAuth().catch(console.error);
