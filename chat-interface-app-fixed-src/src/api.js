// src/api.js
import axios from 'axios';

// Get the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Helper to get the auth token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Create an axios instance for authenticated requests
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to automatically add the Authorization header
authAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- AUTHENTICATION ---
export const loginUser = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, params);
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
  return response.data;
};

// --- RAG & CHAT ---
export const askQuestion = async (query, lang = 'en', sessionId = null, assistants = null) => {
  const payload = { query, lang };
  if (sessionId) payload.session_id = sessionId;
  if (assistants) payload.assistants = assistants;
  const response = await authAxios.post('/api/ask', payload);
  return response.data;
};



// --- AGENT CONFIGURATION ---
export const getSupervisorProfile = async () => {
  const response = await authAxios.get('/api/get-supervisor-profile');
  return response.data;
};

export const saveSupervisorProfile = async (profile) => {
  const response = await authAxios.post('/api/save-supervisor-profile', profile);
  return response.data;
};

export const getAssistantsConfig = async () => {
  const response = await authAxios.get('/api/get-assistants-config');
  return response.data;
};

export const saveAssistantsConfig = async (assistants) => {
  const response = await authAxios.post('/api/save-assistants-config', { assistants });
  return response.data;
};

// --- KNOWLEDGE BASE ---
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await authAxios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
// src/api.js

export const getWebSocketUrl = (sessionId) => {
    const token = localStorage.getItem('authToken');
    
    // --- ADD THIS DEBUGGING BLOCK ---
    console.log("Attempting to get WebSocket URL. Token from localStorage:", token);
    if (!token || token === 'undefined') {
        alert("Authentication error: No valid token found. Please log in again.");
        // We can also force a logout here
        localStorage.removeItem('authToken');
        window.location.reload();
        throw new Error("Cannot connect to WebSocket without a valid token.");
    }
    // --- END OF DEBUGGING BLOCK ---
    
    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const wsApiUrl = `${wsProtocol}://${API_BASE_URL.split('//')[1]}`;
    
    const finalUrl = `${wsApiUrl}/ws?session_id=${sessionId}&token=${token}`;
    console.log("Constructed WebSocket URL:", finalUrl); // Log the final URL
    return finalUrl;
}