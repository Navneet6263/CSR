fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'bgcheckofficer@test.com', password: '12345678' })
})
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', JSON.stringify(data, null, 2));
  })
  .catch(console.error);
