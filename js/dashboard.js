/**
 * ArtNova AI — Dashboard Module (js/dashboard.js)
 * Real-time analytics, recent products feed, and store shortcuts for the active shop.
 */

document.addEventListener('DOMContentLoaded', () => {
  const statProducts = document.getElementById('stat-products');
  const statViews = document.getElementById('stat-views');
  const statClicks = document.getElementById('stat-clicks');
  const recentGrid = document.querySelector('.grid-cols-4');
  const greetingEl = document.querySelector('h1');

  function renderDashboard() {
    if (!window.Store) return;
    const activeShop = window.Store.getActiveShop();
    const stats = window.Store.getStats();
    const products = activeShop.products || [];

    // Personalize greeting
    if (greetingEl) {
      greetingEl.textContent = `Good Morning, ${activeShop.ownerName || 'Artisan'}! 👋`;
    }

    // Update stat numbers matching Screen 3
    if (statProducts) statProducts.textContent = stats.productsCount || products.length || 0;
    if (statViews) statViews.textContent = (stats.views || 0).toLocaleString();
    if (statClicks) statClicks.textContent = stats.clicks || 0;

    // Render Recent Products (up to 4)
    if (recentGrid) {
      if (products.length === 0) {
        recentGrid.innerHTML = `
          <div class="card text-center" style="grid-column: 1 / -1; padding: 48px 20px;">
            <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🏺</span>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">No products added to ${activeShop.shopName} yet</h3>
            <p style="color: var(--muted); margin-bottom: 20px;">Use our AI Image Studio to publish your first craft listing.</p>
            <a href="add-product.html" class="btn btn-primary">+ Add Product</a>
          </div>
        `;
        return;
      }

      const recentItems = products.slice(0, 4);
      recentGrid.innerHTML = recentItems.map(p => `
        <div class="product-card">
          <div class="product-image-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
          </div>
          <div class="product-body">
            <h4 class="product-title">${p.name}</h4>
            <p class="product-price">₹${p.price}</p>
            <div style="margin-top: 6px;">
              <span class="badge-active">Active</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  renderDashboard();

  window.Store.on(() => {
    renderDashboard();
  });
});
