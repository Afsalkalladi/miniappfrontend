#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'https://miniapp-backend-0s1t.onrender.com/api';

// Test configuration
const TEST_USER = {
  telegram_id: '5469651459',
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User'
};

let authToken = null;

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testTelegramLogin() {
  console.log('🔐 Testing Telegram Login...');
  const result = await apiCall('POST', '/auth/telegram-login/', TEST_USER);
  
  if (result.success) {
    console.log('✅ Login successful:', result.data);
    if (result.data.token) {
      authToken = result.data.token;
      console.log('🔑 Auth token received');
    }
    return result.data;
  } else {
    console.log('❌ Login failed:', result.error);
    return null;
  }
}

async function testCloudinary() {
  console.log('☁️ Testing Cloudinary...');
  const result = await apiCall('GET', '/auth/test/cloudinary/');
  
  if (result.success) {
    console.log('✅ Cloudinary test:', result.data);
  } else {
    console.log('❌ Cloudinary test failed:', result.error);
  }
}

async function testAdminDashboard() {
  console.log('👑 Testing Admin Dashboard (should require auth)...');
  const result = await apiCall('GET', '/auth/admin/dashboard-stats/');
  
  if (result.success) {
    console.log('✅ Admin dashboard:', result.data);
  } else {
    console.log('❌ Admin dashboard (expected - no auth):', result.status, result.error);
  }
}

async function testStudentRegistration() {
  console.log('📝 Testing Student Registration...');
  
  const registrationData = {
    telegram_id: TEST_USER.telegram_id,
    username: TEST_USER.username,
    first_name: TEST_USER.first_name,
    last_name: TEST_USER.last_name,
    name: 'Test User',
    department: 'Computer Science',
    year_of_study: '3',
    mobile_number: '1234567890',
    room_no: '101',
    is_sahara_inmate: 'false',
    has_claim: 'false'
  };

  const result = await apiCall('POST', '/auth/register-student/', registrationData);
  
  if (result.success) {
    console.log('✅ Registration successful:', result.data);
  } else {
    console.log('❌ Registration failed:', result.error);
  }
}

async function testBillsEndpoint() {
  console.log('💰 Testing Bills Endpoint (should require auth)...');
  const result = await apiCall('GET', '/mess/bills/current/');
  
  if (result.success) {
    console.log('✅ Bills endpoint:', result.data);
  } else {
    console.log('❌ Bills endpoint (expected - no auth):', result.status, result.error);
  }
}

async function testAttendanceEndpoint() {
  console.log('📊 Testing Attendance Endpoint (should require auth)...');
  const result = await apiCall('GET', '/mess/attendance/my/');
  
  if (result.success) {
    console.log('✅ Attendance endpoint:', result.data);
  } else {
    console.log('❌ Attendance endpoint (expected - no auth):', result.status, result.error);
  }
}

async function testMessCutsEndpoint() {
  console.log('🍽️ Testing Mess Cuts Endpoint (should require auth)...');
  const result = await apiCall('GET', '/mess/mess-cuts/my/');
  
  if (result.success) {
    console.log('✅ Mess cuts endpoint:', result.data);
  } else {
    console.log('❌ Mess cuts endpoint (expected - no auth):', result.status, result.error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  try {
    // Test basic endpoints
    await testCloudinary();
    console.log('');
    
    // Test authentication flow
    const loginResult = await testTelegramLogin();
    console.log('');
    
    // Test registration if needed
    if (loginResult && loginResult.needs_registration) {
      await testStudentRegistration();
      console.log('');
    }
    
    // Test protected endpoints
    await testAdminDashboard();
    console.log('');
    
    await testBillsEndpoint();
    console.log('');
    
    await testAttendanceEndpoint();
    console.log('');
    
    await testMessCutsEndpoint();
    console.log('');
    
    console.log('🎉 All API tests completed!');
    
  } catch (error) {
    console.error('💥 Test runner error:', error);
  }
}

// Run tests
runAllTests();
