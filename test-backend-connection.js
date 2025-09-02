#!/usr/bin/env node

const fetch = require('node-fetch');

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');
  
  // Test different ports
  const ports = [3001, 3005];
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY4YTFiMmMzZDRlNWY2YTdiOGM5ZDAiLCJlbWFpbCI6ImFkbWluQG5ld3RvbmJvdGljcy5jb20iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyIqIl0sImlhdCI6MTczNTczODA5MiwiZXhwIjoxNzM1ODI0NDkyfQ.test';
  
  for (const port of ports) {
    console.log(`📡 Testing port ${port}...`);
    
    try {
      // Test GET events
      const getResponse = await fetch(`http://localhost:${port}/api/events`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        const eventCount = data.data?.items?.length || 0;
        console.log(`✅ Port ${port}: GET /api/events - SUCCESS (${eventCount} events)`);
        
        // Test DELETE if we have events
        if (eventCount > 0) {
          const firstEventId = data.data.items[0]._id;
          console.log(`🗑️  Testing DELETE /api/events/${firstEventId}...`);
          
          const deleteResponse = await fetch(`http://localhost:${port}/api/events/${firstEventId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${testToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (deleteResponse.ok) {
            console.log(`✅ Port ${port}: DELETE /api/events/${firstEventId} - SUCCESS`);
          } else {
            const errorData = await deleteResponse.json().catch(() => ({}));
            console.log(`❌ Port ${port}: DELETE /api/events/${firstEventId} - FAILED (${deleteResponse.status})`);
            console.log(`   Error: ${errorData.message || 'Unknown error'}`);
          }
        }
      } else {
        const errorData = await getResponse.json().catch(() => ({}));
        console.log(`❌ Port ${port}: GET /api/events - FAILED (${getResponse.status})`);
        console.log(`   Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Port ${port}: Connection failed - ${error.message}`);
    }
    
    console.log('');
  }
  
  // Check environment file
  console.log('📄 Checking .env.local file...');
  const fs = require('fs');
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    console.log(`✅ .env.local content: ${envContent.trim()}`);
  } catch (error) {
    console.log(`❌ Could not read .env.local: ${error.message}`);
  }
  
  console.log('\n🔧 Recommendations:');
  console.log('1. If port 3005 works but frontend calls 3001, restart Next.js dev server');
  console.log('2. If both ports fail, check if backend is running');
  console.log('3. If authentication fails, check token format');
}

testBackendConnection().catch(console.error);
