import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { 'Content-Type': 'application/json' }
});
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Optionally log error
    }
    return Promise.reject(error);
  }
);

export default api;
