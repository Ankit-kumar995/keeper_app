import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // ← sirf yeh change karo
  withCredentials: true,
});

export default API;