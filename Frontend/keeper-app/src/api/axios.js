import axios from "axios";

// सुरक्षित URL कॉन्फ़िगरेशन
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl}/api`;
  }
  // अगर एनवायरनमेंट वेरिएबल नहीं मिला, तो लोकलहोस्ट पर फॉलबैक करें
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Interceptor वैसा ही रहेगा...
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;