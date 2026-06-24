// Use global fetch

async function test() {
  const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@test.com', password: '12345678' })
  });
  const loginData = await loginRes.json();
  if (!loginData.data?.token) {
    console.error('Login failed:', loginData);
    return;
  }
  
  const token = loginData.data.token;
  const putRes = await fetch('http://127.0.0.1:5000/api/v1/students/me', {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      dob: '2000-01-01', gender: 'Male', category: 'General',
      address: undefined, city: undefined, state: undefined, pincode: undefined,
      course: 'B.Tech', institutionId: 1, otherInstitutionName: undefined,
      enrollmentYear: 2024, annualFamilyIncome: 100000, familySize: 4,
      bankAccountNo: '1234567890', bankIFSC: 'SBIN0001234', bankName: 'SBI'
    })
  });
  const putData = await putRes.json();
  console.log('Status:', putRes.status);
  console.log('Response:', putData);
}

test().catch(console.error);
