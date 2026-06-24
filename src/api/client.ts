import axios from 'axios';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — unwrap ApiResponse + handle 401 with refresh
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 200) {
        return body.data;
      }
      const error = new Error(body.message || 'Request failed');
      (error as any).code = body.code;
      return Promise.reject(error);
    }
    return body;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      // Try token refresh on 401 (unless it's already a refresh request or login)
      if (status === 401 && !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/register')) {
        originalRequest._retry = true;

        try {
          await axios.post('/api/auth/refresh', {}, { withCredentials: true });
          // Retry the original request
          return client(originalRequest);
        } catch {
          // Refresh failed — redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }
      }

      // If 401 on refresh itself, redirect
      if (status === 401 && originalRequest.url?.includes('/auth/refresh')) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      const msg = error.response.data?.message || error.message;
      return Promise.reject(new Error(msg));
    }

    return Promise.reject(error);
  }
);

export default client;
