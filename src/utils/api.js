import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://gemini-backend-1-gq8i.onrender.com'
    : 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
