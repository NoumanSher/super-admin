import { api } from './api';

export const authService = {
  /**
   * Log in platform administrator
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    const data = await api.post('/platform/auth/login', { email, password });
    if (data.success && data.accessToken) {
      localStorage.setItem('platform_admin_token', data.accessToken);
      localStorage.setItem('platform_admin_user', JSON.stringify(data.admin));
      return { success: true, admin: data.admin };
    }
    throw new Error(data.message || 'Login failed');
  },

  /**
   * Log out administrator
   */
  logout() {
    localStorage.removeItem('platform_admin_token');
    localStorage.removeItem('platform_admin_user');
  },

  /**
   * Get current logged in administrator
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('platform_admin_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('platform_admin_token');
  },

  /**
   * Check if user is authenticated by fetching profile
   */
  async checkSession() {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      const data = await api.get('/platform/auth/me');
      if (data.success && data.admin) {
        localStorage.setItem('platform_admin_user', JSON.stringify(data.admin));
        return data.admin;
      }
      return null;
    } catch (err) {
      console.log(err)
      this.logout();
      return null;
    }
  }
};
