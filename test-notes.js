import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';

// Test user registration
const registerUser = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      college: 'Test College'
    });
    console.log('✅ User registered:', response.data.user.name);
    return response.data.token;
  } catch (error) {
    if (error.response?.data?.error === 'User already exists') {
      // Try login instead
      console.log('User already exists, trying login...');
      return await loginUser();
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return null;
  }
};

// Test user login
const loginUser = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User logged in:', response.data.user.name);
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
};

// Test getting notes (should be empty initially)
const getNotes = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Notes retrieved:', response.data.length, 'notes');
    return response.data;
  } catch (error) {
    console.error('❌ Get notes failed:', error.response?.data || error.message);
  }
};

// Test PDF upload
const uploadPDF = async (token) => {
  try {
    // Create a simple test PDF content (this won't be a real PDF, just for testing)
    const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n72 720 Td\n/F0 12 Tf\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000200 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n284\n%%EOF';

    // Write test content to a temporary file
    fs.writeFileSync('test.pdf', testContent);

    const form = new FormData();
    form.append('subject', 'Mathematics');
    form.append('topic', 'Calculus');
    form.append('department', 'CSE');
    form.append('semester', 4);
    form.append('pdf', fs.createReadStream('test.pdf'));

    const response = await axios.post(`${API_BASE}/notes/save`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ PDF uploaded successfully:', response.data.note.topic);

    // Clean up test file
    fs.unlinkSync('test.pdf');

    return response.data.note;
  } catch (error) {
    console.error('❌ PDF upload failed:', error.response?.data || error.message);
    // Clean up test file if it exists
    if (fs.existsSync('test.pdf')) {
      fs.unlinkSync('test.pdf');
    }
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Notes API Tests...\n');

  // Register/Login user
  const token = await registerUser();
  if (!token) {
    console.error('❌ Cannot proceed without authentication token');
    return;
  }

  console.log('');

  // Test getting notes (should be empty)
  await getNotes(token);

  console.log('');

  // Test PDF upload
  const uploadedNote = await uploadPDF(token);

  console.log('');

  // Test getting notes again (should have 1 note)
  if (uploadedNote) {
    await getNotes(token);
  }

  console.log('\n✅ Tests completed!');
};

runTests().catch(console.error);
