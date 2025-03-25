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
