/**
 * ArtNova AI — API Bridge (js/api.js)
 * Automatically communicates with Node/Express backend if available,
 * and seamlessly falls back to the client-side reactive store if running offline or static.
 */

const API_BASE = window.location.origin.includes('5000') 
  ? '/api' 
  : 'http://localhost:5000/api';

window.ArtNovaAPI = {
  // Check if backend is reachable
  async isBackendLive() {
    try {
      const res = await fetch(`${API_BASE}/me`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      return res.status !== 0;
    } catch {
      return false;
    }
  },

  // Auth: Register
  async register(userData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        window.Store.setToken(data.token);
        window.Store.saveUser(data.user);
        return data;
      }
    } catch (e) {
      console.log('Using local store for registration');
    }

    // Offline / Local fallback
    const slug = (userData.shopName || 'shop')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const user = {
      id: 'user-' + Date.now(),
      name: userData.name,
      shopName: userData.shopName,
      slug: slug || 'artisan-shop',
      email: userData.email,
      phone: userData.phone ? userData.phone.replace(/\D/g, '') : '',
      bio: userData.bio || ''
    };
    window.Store.saveUser(user);
    window.Store.setToken('token-' + Date.now());
    return { token: window.Store.getToken(), user };
  },

  // Auth: Login
  async login(id, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        window.Store.setToken(data.token);
        window.Store.saveUser(data.user);
        return data;
      }
    } catch (e) {
      console.log('Using local store for login');
    }

    // Offline / Local fallback
    const currentUser = window.Store.getUser();
    window.Store.setToken('token-' + Date.now());
    return { token: window.Store.getToken(), user: currentUser };
  },

  // Get current user stats
  async getMe() {
    const token = window.Store.getToken();
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          const data = await res.json();
          window.Store.saveUser(data.user);
          return data;
        }
      } catch (e) {}
    }

    return {
      user: window.Store.getUser(),
      stats: window.Store.getStats()
    };
  },

  // AI Description Generator
  async generateDescription(productDetails) {
    const token = window.Store.getToken();
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/describe`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(productDetails),
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          const data = await res.json();
          return data.description;
        }
      } catch (e) {}
    }

    // Creative Local AI Artisan Engine
    const { name, category, material, price } = productDetails;
    const cat = (category || 'handcrafted treasure').toLowerCase();
    const mat = material ? `from carefully selected ${material.toLowerCase()}` : 'with sustainable artisan materials';
    const priceText = price ? `Affordably priced at ₹${price}` : 'Priced with honesty';

    const templates = [
      `Discover the soul of slow handmade art in this one-of-a-kind ${name}. Sculpted and finished ${mat}, it merges authentic artisanal heritage with contemporary elegance. ${priceText}, it brings warmth and organic texture directly to your home.`,
      `Lovingly handcrafted ${mat}, the ${name} is an exquisite expression of ${cat} artistry. Every curve and detail reflects patient traditional handwork, creating an heirloom piece that carries personal meaning and unmatched charm.`,
      `Bring timeless artisan beauty into your lifestyle with this handcrafted ${name}. Created ${mat}, this unique ${cat} piece celebrates human touch and conscious crafting. A beautiful, conscious purchase to cherish for years.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  },

  // Upload image to Cloudinary (or client-side canvas fallback)
  async uploadImage(file) {
    const token = window.Store.getToken();
    if (token) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
          signal: AbortSignal.timeout(10000)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {}
    }

    // Client-side instant image processing via FileReader & Canvas
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalUrl = e.target.result;
        // Generate enhanced version using HTML5 Canvas filter
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          // Enhanced studio lighting: increase contrast, saturation & brightness
          ctx.filter = 'contrast(1.15) brightness(1.08) saturate(1.18)';
          ctx.drawImage(img, 0, 0);
          
          const enhancedUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ original: originalUrl, enhanced: enhancedUrl });
        };
        img.src = originalUrl;
      };
      reader.readAsDataURL(file);
    });
  },

  // Save product
  async saveProduct(productData) {
    const token = window.Store.getToken();
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(productData),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const saved = await res.json();
          window.Store.addProduct(saved);
          return saved;
        }
      } catch (e) {}
    }

    return window.Store.addProduct(productData);
  }
};
