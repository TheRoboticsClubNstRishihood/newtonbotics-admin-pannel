#!/usr/bin/env node

const http = require('http');

console.log('🔧 Fixing Authentication Issue...\n');

// Step 1: Test the real backend (port 3005) with DELETE operation
async function testRealBackend() {
  console.log('📡 Testing Real Backend (Port 3005)...');
  
  return new Promise((resolve) => {
    // First, get events to find an ID to delete
    const getOptions = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/events',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    };
    
    const getReq = http.request(getOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data.items.length > 0) {
            const eventId = response.data.items[0]._id;
            console.log(`✅ Found event to delete: ${eventId}`);
            
            // Now test DELETE
            const deleteOptions = {
              hostname: 'localhost',
              port: 3005,
              path: `/api/events/${eventId}`,
              method: 'DELETE',
              headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
              }
            };
            
            const deleteReq = http.request(deleteOptions, (deleteRes) => {
              let deleteData = '';
              deleteRes.on('data', (chunk) => deleteData += chunk);
              deleteRes.on('end', () => {
                if (deleteRes.statusCode === 200) {
                  console.log('✅ DELETE operation successful on real backend');
                  resolve(true);
                } else {
                  console.log(`❌ DELETE failed: ${deleteRes.statusCode}`);
                  console.log(`Response: ${deleteData}`);
                  resolve(false);
                }
              });
            });
            
            deleteReq.on('error', (err) => {
              console.log(`❌ DELETE request error: ${err.message}`);
              resolve(false);
            });
            
            deleteReq.end();
          } else {
            console.log('❌ No events found or invalid response');
            resolve(false);
          }
        } catch (err) {
          console.log(`❌ JSON parse error: ${err.message}`);
          resolve(false);
        }
      });
    });
    
    getReq.on('error', (err) => {
      console.log(`❌ GET request error: ${err.message}`);
      resolve(false);
    });
    
    getReq.end();
  });
}

// Step 2: Check environment configuration
function checkEnvironment() {
  console.log('\n📄 Checking Environment Configuration...');
  
  const fs = require('fs');
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    console.log('✅ .env.local content:');
    console.log(envContent);
    
    // Check if both variables are set
    const hasBackendUrl = envContent.includes('BACKEND_URL=');
    const hasNextPublicBackendUrl = envContent.includes('NEXT_PUBLIC_BACKEND_URL=');
    
    if (hasBackendUrl && hasNextPublicBackendUrl) {
      console.log('✅ Both BACKEND_URL and NEXT_PUBLIC_BACKEND_URL are configured');
      return true;
    } else {
      console.log('❌ Missing environment variables');
      return false;
    }
  } catch (err) {
    console.log(`❌ Error reading .env.local: ${err.message}`);
    return false;
  }
}

// Step 3: Provide recommendations
function provideRecommendations(backendWorks, envConfigured) {
  console.log('\n🔧 Recommendations:');
  
  if (backendWorks && envConfigured) {
    console.log('✅ Backend is working and environment is configured correctly');
    console.log('🔄 Next steps:');
    console.log('1. Restart your Next.js development server');
    console.log('2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('3. Try the delete operation again');
  } else if (!backendWorks) {
    console.log('❌ Backend DELETE operation is failing');
    console.log('🔍 This suggests an authentication issue with your real backend');
    console.log('💡 Check if your backend requires specific JWT tokens');
  } else if (!envConfigured) {
    console.log('❌ Environment variables are not configured correctly');
    console.log('🔧 Fix the .env.local file and restart the Next.js server');
  }
}

// Main execution
async function main() {
  const backendWorks = await testRealBackend();
  const envConfigured = checkEnvironment();
  provideRecommendations(backendWorks, envConfigured);
  
  console.log('\n📋 Summary:');
  console.log(`- Backend DELETE test: ${backendWorks ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Environment config: ${envConfigured ? '✅ PASS' : '❌ FAIL'}`);
  
  if (backendWorks && envConfigured) {
    console.log('\n🎉 Issue should be resolved after restarting Next.js server!');
  } else {
    console.log('\n⚠️  Additional debugging needed');
  }
}

main().catch(console.error);





