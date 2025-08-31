import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from '../models/Exam.js';

dotenv.config();

const testExamSystem = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/englearnai');
    console.log('Connected to MongoDB');

    // Check if exams exist
    const exams = await Exam.find({});
    console.log(`Found ${exams.length} exams in database`);

    if (exams.length === 0) {
      console.log('No exams found. Please run:');
      console.log('cd gemini-backend && node seeds/seedData.js');
    } else {
      console.log('Available exams:');
      exams.forEach(exam => {
        console.log(`- ${exam.title} (${exam.department}, Semester ${exam.semester})`);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error testing exam system:', error);
    mongoose.connection.close();
  }
};

testExamSystem();