/**
 * ArtNova AI — Core Application Utilities (js/app.js)
 * Toast notifications, active navigation state, modal handlers, shop switcher, copy utilities.
 */

window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-weight: 700; color: ${type === 'success' ? 'var(--brand)' : type === 'error' ? '#ef4444' : 'var(--clay)'}">${icons[type] || '•'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

window.formatCurrency = function(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

window.copyToClipboard = function(text, successMsg = 'Link copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      window.showToast(successMsg, 'success');
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
};

function fallbackCopy(text, successMsg) {
  const input = document.createElement('textarea');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  window.showToast(successMsg, 'success');
}

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Shop Switcher UI builder
function setupShopSwitcher() {
  if (!window.Store) return;
  const profileCard = document.querySelector('.seller-profile-card');
  if (!profileCard) return;

  const activeShop = window.Store.getActiveShop();
  const allShops = window.Store.getAllShops();

  // Populate active shop info in sidebar
  const nameEl = profileCard.querySelector('h4');
  if (nameEl) nameEl.textContent = activeShop.shopName;

  const avatarEl = profileCard.querySelector('.seller-profile-avatar img');
  if (avatarEl && activeShop.avatar) {
    avatarEl.src = activeShop.avatar;
  }

  // Make profile card interactive with a sleek dropdown
  profileCard.style.cursor = 'pointer';
  profileCard.style.position = 'relative';

  // Remove existing dropdown if any
  const oldMenu = document.getElementById('shop-switcher-menu');
  if (oldMenu) oldMenu.remove();

  const menu = document.createElement('div');
  menu.id = 'shop-switcher-menu';
  menu.style.display = 'none';
  menu.style.position = 'absolute';
  menu.style.top = '100%';
  menu.style.left = '0';
  menu.style.right = '0';
  menu.style.marginTop = '6px';
  menu.style.background = '#ffffff';
  menu.style.border = '1px solid var(--border)';
  menu.style.borderRadius = 'var(--radius-md)';
  menu.style.boxShadow = 'var(--shadow-lg)';
  menu.style.padding = '8px';
  menu.style.zIndex = '100';

  menu.innerHTML = `
    <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--muted); padding: 4px 8px 6px;">
      Your Artisan Shops
    </div>
    ${allShops.map(s => `
      <div 
        class="switcher-shop-item" 
        data-shop-id="${s.id}"
        style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; ${s.id === activeShop.id ? 'background: var(--brand-soft); color: var(--brand); font-weight: 600;' : 'color: var(--ink);'}"
      >
        <div>
          <div>${s.shopName}</div>
          <div style="font-size: 0.72rem; color: var(--muted);">${s.location || 'Artisan Hub'} &bull; ${s.products.length} items</div>
        </div>
        ${s.id === activeShop.id ? '<span>✓</span>' : ''}
      </div>
    `).join('')}
    <div style="border-top: 1px solid var(--border); margin-top: 6px; padding-top: 6px;">
      <a 
        href="auth.html" 
        onclick="localStorage.setItem('open_signup_tab', 'true')"
        style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; font-size: 0.82rem; font-weight: 600; color: var(--brand); border-radius: var(--radius-sm);"
      >
        <span>➕</span> Open Another Shop
      </a>
    </div>
  `;

  profileCard.appendChild(menu);

  profileCard.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
  });

  menu.querySelectorAll('.switcher-shop-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const shopId = item.getAttribute('data-shop-id');
      window.Store.switchShop(shopId);
      window.showToast(`Switched active shop!`, 'info');
      setTimeout(() => window.location.reload(), 300);
    });
  });

  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupShopSwitcher();

  // If redirected from "Open Another Shop", auto-activate signup tab
  if (window.location.pathname.includes('auth.html') && localStorage.getItem('open_signup_tab')) {
    localStorage.removeItem('open_signup_tab');
    const signupTab = document.getElementById('tab-signup');
    if (signupTab) signupTab.click();
  }

  // Active navigation link highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  document.querySelectorAll('.mobile-bottom-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Global logout handlers
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        window.Store.logout();
        window.location.href = 'auth.html';
      }
    });
  });
});
