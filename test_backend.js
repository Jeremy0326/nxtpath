// Quick test to check if backend is running
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

async function testBackend() {
  console.log('Testing backend connection...');
  
  try {
    // Test if server is running
    const response = await axios.get(`${BASE_URL}/career-fairs/fairs/`);
    console.log('✅ Backend is running!');
    console.log(`Status: ${response.status}`);
    console.log(`Data length: ${response.data.length || response.data.results?.length || 'N/A'}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 8000');
    } else {
      console.log('❌ Error connecting to backend:', error.message);
    }
    return false;
  }
}

testBackend();
