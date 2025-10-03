import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EnhancedCourse from '../models/EnhancedCourse.js';
import CertificateCourse from '../models/CertificateCourse.js';
import Exam from '../models/Exam.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await EnhancedCourse.deleteMany({});
    await CertificateCourse.deleteMany({});
    await Exam.deleteMany({});
    console.log('Cleared existing data');

    // Create Certificate Courses
    const javaCertificateCourses = [
      {
        title: "Java Programming Masterclass",
        description: "Comprehensive Java course covering basics to advanced concepts",
        platform: "Udemy",
        courseUrl: "https://www.udemy.com/course/java-programming-masterclass/",
        certificateUrl: "https://www.udemy.com/certificate/UC-12345",
        duration: "80 hours",
        level: "Beginner",
        language: "Java",
        category: "Programming",
        rating: 4.7,
        tags: ["Java", "OOP", "Spring", "Maven"]
      },
      {
        title: "Java Fundamentals",
        description: "Learn Java programming from scratch with hands-on examples",
        platform: "Unacademy",
        courseUrl: "https://unacademy.com/course/java-fundamentals",
        certificateUrl: "https://unacademy.com/certificate/java-fundamentals",
        duration: "40 hours",
        level: "Beginner",
        language: "Java",
        category: "Programming",
        rating: 4.5,
        tags: ["Java", "Core Java", "Programming"]
      },
      {
        title: "Advanced Java Programming",
        description: "Deep dive into advanced Java concepts and frameworks",
        platform: "DataFlair",
        courseUrl: "https://data-flair.training/blogs/java-tutorial/",
        certificateUrl: "https://data-flair.training/certificates/java-advanced",
        duration: "60 hours",
        level: "Advanced",
        language: "Java",
        category: "Programming",
        rating: 4.6,
        tags: ["Java", "Advanced", "Multithreading", "Collections"]
      }
    ];

    const pythonCertificateCourses = [
      {
        title: "Python for Everybody",
        description: "Complete Python course for beginners with projects",
        platform: "Coursera",
        courseUrl: "https://www.coursera.org/specializations/python",
        certificateUrl: "https://www.coursera.org/account/accomplishments/verify/12345",
        duration: "32 hours",
        level: "Beginner",
        language: "Python",
        category: "Programming",
        rating: 4.8,
        tags: ["Python", "Data Science", "Machine Learning"]
      },
      {
        title: "Python Django Web Development",
        description: "Build web applications with Python and Django",
        platform: "YouTube",
        courseUrl: "https://youtube.com/playlist?list=PL12345",
        certificateUrl: "https://youtube.com/certificate/django",
        duration: "25 hours",
        level: "Intermediate",
        language: "Python",
        category: "Web Development",
        rating: 4.4,
        tags: ["Python", "Django", "Web Development"]
      },
      {
        title: "Python Data Structures",
        description: "Master Python data structures and algorithms",
        platform: "FreeCodeCamp",
        courseUrl: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        certificateUrl: "https://www.freecodecamp.org/certification/fcc-python",
        duration: "30 hours",
        level: "Intermediate",
        language: "Python",
        category: "Programming",
        rating: 4.6,
        tags: ["Python", "Data Structures", "Algorithms"]
      }
    ];

    const cCertificateCourses = [
      {
        title: "C Programming for Beginners",
        description: "Learn C programming from basics to advanced concepts",
        platform: "Udemy",
        courseUrl: "https://www.udemy.com/course/c-programming-for-beginners/",
        certificateUrl: "https://www.udemy.com/certificate/UC-C123",
        duration: "45 hours",
        level: "Beginner",
        language: "C",
        category: "Programming",
        rating: 4.5,
        tags: ["C", "Programming", "Pointers", "Memory Management"]
      },
      {
        title: "C Programming Tutorial",
        description: "Complete C programming tutorial with examples",
        platform: "DataFlair",
        courseUrl: "https://data-flair.training/blogs/c-programming-tutorial/",
        certificateUrl: "https://data-flair.training/certificates/c-programming",
        duration: "35 hours",
        level: "Beginner",
        language: "C",
        category: "Programming",
        rating: 4.3,
        tags: ["C", "Programming", "System Programming"]
      }
    ];

    // Insert certificate courses
    const javaCerts = await CertificateCourse.insertMany(javaCertificateCourses);
    const pythonCerts = await CertificateCourse.insertMany(pythonCertificateCourses);
    const cCerts = await CertificateCourse.insertMany(cCertificateCourses);

    // Create Enhanced Courses
    const enhancedCourses = [
      {
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        description: "Fundamental concepts of programming using Java",
        department: "Computer Science",
        semester: 1,
        credits: 3,
        instructor: "Dr. Smith",
        language: "Java",
        category: "Core Programming",
        difficulty: "Beginner",
        prerequisites: ["Basic Mathematics"],
        outcomes: ["Understand programming fundamentals", "Write basic Java programs", "Understand OOP concepts"],
        linkedCertificateCourses: [javaCerts[0]._id, javaCerts[1]._id],
        syllabus: [
          { topic: "Introduction to Java", duration: "1 week", description: "Java basics and setup" },
          { topic: "Variables and Data Types", duration: "1 week", description: "Primitive and reference types" },
          { topic: "Control Structures", duration: "2 weeks", description: "Loops and conditionals" }
        ]
      },
      {
        courseCode: "CS102",
        courseName: "Advanced Java Programming",
        description: "Advanced Java concepts including collections, multithreading, and exception handling",
        department: "Computer Science",
        semester: 2,
        credits: 4,
        instructor: "Dr. Johnson",
        language: "Java",
        category: "Core Programming",
        difficulty: "Intermediate",
        prerequisites: ["CS101", "Data Structures"],
        outcomes: ["Master Java collections", "Understand multithreading", "Build complex applications"],
        linkedCertificateCourses: [javaCerts[2]._id],
        syllabus: [
          { topic: "Collections Framework", duration: "2 weeks", description: "Lists, Sets, Maps" },
          { topic: "Multithreading", duration: "2 weeks", description: "Threads and synchronization" },
          { topic: "Exception Handling", duration: "1 week", description: "Try-catch and custom exceptions" }
        ]
      },
      {
        courseCode: "CS201",
        courseName: "Python Programming",
        description: "Introduction to Python programming for data science and web development",
        department: "Computer Science",
        semester: 2,
        credits: 3,
        instructor: "Dr. Williams",
        language: "Python",
        category: "Core Programming",
        difficulty: "Beginner",
        prerequisites: ["CS101"],
        outcomes: ["Write Python programs", "Understand data structures", "Work with libraries"],
        linkedCertificateCourses: [pythonCerts[0]._id, pythonCerts[1]._id, pythonCerts[2]._id],
        syllabus: [
          { topic: "Python Basics", duration: "1 week", description: "Syntax and data types" },
          { topic: "Data Structures", duration: "2 weeks", description: "Lists, dictionaries, sets" },
          { topic: "Functions and Modules", duration: "2 weeks", description: "Creating and using functions" }
        ]
      },
      {
        courseCode: "CS202",
        courseName: "C Programming",
        description: "System programming using C language",
        department: "Computer Science",
        semester: 1,
        credits: 3,
        instructor: "Dr. Brown",
        language: "C",
        category: "Core Programming",
        difficulty: "Beginner",
        prerequisites: ["Basic Computer Knowledge"],
        outcomes: ["Understand C syntax", "Work with pointers", "Memory management"],
        linkedCertificateCourses: [cCerts[0]._id, cCerts[1]._id],
        syllabus: [
          { topic: "C Basics", duration: "1 week", description: "Variables and data types" },
          { topic: "Pointers", duration: "2 weeks", description: "Pointer arithmetic and memory" },
          { topic: "Structures", duration: "1 week", description: "User-defined data types" }
        ]
      }
    ];

    await EnhancedCourse.insertMany(enhancedCourses);

    // Create Sample Exams
    const sampleExams = [
      {
        title: "Java Fundamentals Midterm",
        department: "Computer Science",
        semester: 1,
        course: "CS101 - Introduction to Programming",
        duration: 60,
        questions: [
          {
            question: "What is the main method signature in Java?",
            options: ["public static void main(String[] args)", "public void main(String args)", "static void main(String[] args)", "public static main(String[] args)"],
            correctAnswer: "public static void main(String[] args)"
          },
          {
            question: "Which of the following is not a primitive data type in Java?",
            options: ["int", "boolean", "String", "double"],
            correctAnswer: "String"
          },
          {
            question: "What does OOP stand for?",
            options: ["Object Oriented Programming", "Object Operation Program", "Oriented Object Protocol", "Object Order Programming"],
            correctAnswer: "Object Oriented Programming"
          }
        ]
      },
      {
        title: "Python Programming Quiz",
        department: "Computer Science",
        semester: 2,
        course: "CS201 - Python Programming",
        duration: 45,
        questions: [
          {
            question: "What is the correct way to create a list in Python?",
            options: ["list = []", "list = {}", "list = ()", "list = ''"],
            correctAnswer: "list = []"
          },
          {
            question: "Which keyword is used to define a function in Python?",
            options: ["function", "def", "define", "fun"],
            correctAnswer: "def"
          },
          {
            question: "What is the output of print(2 ** 3)?",
            options: ["6", "8", "9", "5"],
            correctAnswer: "8"
          }
        ]
      },
      {
        title: "C Programming Basics",
        department: "Computer Science",
        semester: 1,
        course: "CS202 - C Programming",
        duration: 90,
        questions: [
          {
            question: "What is the correct header file for input/output in C?",
            options: ["#include <iostream>", "#include <stdio.h>", "#include <input.h>", "#include <output.h>"],
            correctAnswer: "#include <stdio.h>"
          },
          {
            question: "Which operator is used to access the value at a pointer's address?",
            options: ["*", "&", "->", "."],
            correctAnswer: "*"
          },
          {
            question: "What is the size of int in most modern systems?",
            options: ["2 bytes", "4 bytes", "8 bytes", "1 byte"],
            correctAnswer: "4 bytes"
          }
        ]
      },
      {
        title: "Advanced Java Concepts",
        department: "Computer Science",
        semester: 2,
        course: "CS102 - Advanced Java Programming",
        duration: 75,
        questions: [
          {
            question: "Which collection class is synchronized?",
            options: ["ArrayList", "HashMap", "Vector", "HashSet"],
            correctAnswer: "Vector"
          },
          {
            question: "What is the purpose of the 'synchronized' keyword?",
            options: ["To improve performance", "To handle exceptions", "To control thread access", "To manage memory"],
            correctAnswer: "To control thread access"
          },
          {
            question: "Which interface is used for sorting objects in Java?",
            options: ["Comparable", "Comparator", "Sortable", "Orderable"],
            correctAnswer: "Comparable"
          }
        ]
      }
    ];

    await Exam.insertMany(sampleExams);
    console.log('Sample data seeded successfully');
    console.log(`Created ${sampleExams.length} sample exams`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seedData();