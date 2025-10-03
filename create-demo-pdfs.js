import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';

// Demo data based on seed data
const departments = ['Computer Science'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const subjects = [
  { code: 'CS101', name: 'Introduction to Programming' },
  { code: 'CS102', name: 'Advanced Java Programming' },
  { code: 'CS201', name: 'Python Programming' },
  { code: 'CS202', name: 'C Programming' },
  { code: 'CS301', name: 'Data Structures' },
  { code: 'CS302', name: 'Algorithms' },
  { code: 'CS303', name: 'Database Management' },
  { code: 'CS304', name: 'Web Development' },
  { code: 'CS401', name: 'Operating Systems' },
  { code: 'CS402', name: 'Computer Networks' },
  { code: 'CS403', name: 'Software Engineering' },
  { code: 'CS404', name: 'Machine Learning' }
];

// Create a simple demo PDF content
const createDemoPDF = (type, subject, semester) => {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 100
>>
stream
BT
72 720 Td
/F0 14 Tf
(${type}: ${subject.name}) Tj
0 -20 Td
/F0 12 Tf
(Semester: ${semester}) Tj
0 -20 Td
(Department: Computer Science) Tj
0 -40 Td
/F0 10 Tf
(This is a demo ${type.toLowerCase()} PDF for ${subject.name}) Tj
0 -20 Td
(Replace this with actual content) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000220 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
320
%%EOF`;

  return content;
};

// Login to get token
const loginUser = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    console.log('✅ User logged in for demo creation');
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
};

// Upload PDF
const uploadPDF = async (token, type, subject, semester, department) => {
  try {
    const pdfContent = createDemoPDF(type, subject, semester);
    const filename = `${type.toLowerCase()}-${subject.code}-sem${semester}.pdf`;

    // Write PDF content to file
    fs.writeFileSync(filename, pdfContent);

    const form = new FormData();
    form.append('subject', subject.name);
    form.append('topic', `${type} - ${subject.code}`);
    form.append('department', department);
    form.append('semester', semester);
    form.append('pdf', fs.createReadStream(filename));

    const response = await axios.post(`${API_BASE}/notes/save`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`✅ ${type} uploaded: ${subject.name} - Semester ${semester}`);

    // Clean up
    fs.unlinkSync(filename);

    return response.data.note;
  } catch (error) {
    console.error(`❌ ${type} upload failed for ${subject.name}:`, error.response?.data || error.message);
    // Clean up on error
    const filename = `${type.toLowerCase()}-${subject.code}-sem${semester}.pdf`;
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  }
};

// Main function
const createDemoContent = async () => {
  console.log('🚀 Creating Demo PDFs for Notes and Organizer...\n');

  const token = await loginUser();
  if (!token) {
    console.error('❌ Cannot proceed without authentication token');
    return;
  }

  let totalUploaded = 0;

  for (const department of departments) {
    for (const semester of semesters) {
      for (const subject of subjects) {
        // Upload Notes PDF
        await uploadPDF(token, 'Notes', subject, semester, department);
        totalUploaded++;

        // Upload Organizer PDF
        await uploadPDF(token, 'Organizer', subject, semester, department);
        totalUploaded++;

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  console.log(`\n✅ Demo creation completed! Total PDFs uploaded: ${totalUploaded}`);
  console.log('📁 All demo PDFs are stored in uploads/notes/ directory');
  console.log('🔄 You can now replace these demo PDFs with actual content');
};

createDemoContent().catch(console.error);
