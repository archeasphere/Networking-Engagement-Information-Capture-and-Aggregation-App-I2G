import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'https://backend-service-ndyt.onrender.com/api',
  headers: {
    'Content-Type': 'application/json', // Default for most requests
  },
});

// 🔐 Attach JWT to every request
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Optional: Handle 401 Unauthorized (e.g., token expired)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized – token may be expired.');
      // Optionally log out user or redirect
      // await AsyncStorage.removeItem('userToken');
      // router.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default API;


/*
import axios from "axios";

// ✅ Replace this with your actual Render API URL
const API_BASE_URL = "https://backend-service-ndyt.onrender.com";

// ✅ Create an Axios instance for all API requests
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Example: Function to fetch data from the backend
export const fetchData = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error);
    throw error;
  }
};

// ✅ Example: Function to post data (e.g., user registration)
export const postData = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error);
    throw error;
  }
};

*/
