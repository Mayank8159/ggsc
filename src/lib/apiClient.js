const API_BASE = import.meta.env.VITE_API_URL || '';

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
