let envUrl = import.meta.env.VITE_API_URL;
if (!envUrl || envUrl.includes('localhost:5000')) {
  envUrl = 'https://45gjru746d.execute-api.ap-south-1.amazonaws.com';
}
const API_BASE = envUrl;

export const apiClient = {
  getToken() {
    return localStorage.getItem('ggsc_jwt');
  },
  
  setToken(token) {
    if (token) {
      localStorage.setItem('ggsc_jwt', token);
    } else {
      localStorage.removeItem('ggsc_jwt');
    }
  },

  // Decode JWT payload without verification (for client-side fallback only)
  getTokenPayload() {
    try {
      const token = this.getToken();
      if (!token) return null;
      const base64 = token.split('.')[1];
      if (!base64) return null;
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  async get(endpoint) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE}${endpoint}${separator}_t=${Date.now()}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  }
};
export default apiClient;
