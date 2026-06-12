// const BASE_URL = 'http://localhost:7418/api';
const BASE_URL = 'https://pakshipper-backend.vercel.app/api';

/**
 * Perform a fetch request to the backend platform routes
 * @param {string} endpoint - The endpoint path (e.g., '/platform/auth/login')
 * @param {object} options - Standard fetch options
 */
export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add platform token if it exists in localStorage
  const token = localStorage.getItem('platform_admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401 && endpoint !== '/platform/auth/login') {
        localStorage.removeItem('platform_admin_token');
        localStorage.removeItem('platform_admin_user');
        window.dispatchEvent(new Event('auth_session_expired'));
      }
      
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
