// Test script for API endpoints
const API_BASE_URL = 'https://miniapp-backend-0s1t.onrender.com/api';

async function testAPI() {
  console.log('🔍 Testing API endpoints...\n');

  // Test 1: Telegram Login
  console.log('1. Testing Telegram Login...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/telegram-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: '123456789',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      })
    });
    
    const data = await response.json();
    console.log('✅ Login Response:', data);
    
    if (data.token) {
      console.log('🔑 JWT Token received:', data.token.substring(0, 20) + '...');
      
      // Test 2: Get Profile
      console.log('\n2. Testing Get Profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('✅ Profile Response:', profileData);
      
      // Test 3: Get Current Bill
      console.log('\n3. Testing Get Current Bill...');
      const billResponse = await fetch(`${API_BASE_URL}/mess/bills/current/`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const billData = await billResponse.json();
      console.log('📄 Bill Response:', billData);
      
      // Test 4: Get All Bills
      console.log('\n4. Testing Get All Bills...');
      const allBillsResponse = await fetch(`${API_BASE_URL}/mess/bills/all/`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const allBillsData = await allBillsResponse.json();
      console.log('📋 All Bills Response:', allBillsData);
      
      // Test 5: Get My Attendance
      console.log('\n5. Testing Get My Attendance...');
      const attendanceResponse = await fetch(`${API_BASE_URL}/mess/attendance/my/`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const attendanceData = await attendanceResponse.json();
      console.log('📊 Attendance Response:', attendanceData);
      
      // Test 6: Get My Mess Cuts
      console.log('\n6. Testing Get My Mess Cuts...');
      const messCutsResponse = await fetch(`${API_BASE_URL}/mess/mess-cuts/my/`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const messCutsData = await messCutsResponse.json();
      console.log('🍽️ Mess Cuts Response:', messCutsData);
      
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testAPI();
