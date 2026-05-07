/**
 * Centralized authentication utility to manage tokens and user roles.
 */

const TOKEN_KEYS = ['adminToken', 'userToken', 'patientToken'];
const ROLE_KEY = 'userRole';
const EMAIL_KEY = 'userEmail';
const NAME_KEY = 'userFullName';

export const auth = {
  /**
   * Retrieves the first available token from localStorage.
   */
  getToken: (): string | null => {
    for (const key of TOKEN_KEYS) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }
    return null;
  },

  /**
   * Sets the authentication token.
   * @param token The JWT token
   * @param isAdmin Whether to set it as an admin token
   */
  setToken: (token: string, isAdmin: boolean = false) => {
    const key = isAdmin ? 'adminToken' : 'userToken';
    localStorage.setItem(key, token);
  },

  /**
   * Sets user metadata
   */
  setUser: (data: { email?: string; role?: string; fullName?: string }) => {
    if (data.email) localStorage.setItem(EMAIL_KEY, data.email);
    if (data.role) localStorage.setItem(ROLE_KEY, data.role);
    if (data.fullName) localStorage.setItem(NAME_KEY, data.fullName);
  },

  /**
   * Checks if the user is an admin
   */
  isAdmin: (): boolean => {
    return localStorage.getItem(ROLE_KEY) === 'admin' || !!localStorage.getItem('adminToken');
  },

  /**
   * Clears all authentication data from localStorage.
   */
  logout: () => {
    TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('userDob');
    window.location.hash = '#/auth';
    window.location.reload();
  }
};
