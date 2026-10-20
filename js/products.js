/**
 * ArtNova AI — Products Management Module (js/products.js)
 * Full inventory list, live search, category filtering, visibility toggle, deletion.
 */

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('inventory-grid');
  const searchInput = document.getElementById('search-products');
  const filterPills = document.querySelectorAll('.filter-pill');
  const countBadge = document.getElementById('products-count');

  let currentCategory = 'All';
  let searchQuery = '';
  let productToDelete = null;

  function renderInventory() {
    if (!productsGrid) return;

    const activeShop = window.Store.getActiveShop();
    let items = activeShop.products || [];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (currentCategory !== 'All') {
      items = items.filter(p => p.category === currentCategory);
    }

    if (countBadge) {
      countBadge.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    if (items.length === 0) {
      productsGrid.innerHTML = `
        <div class="card text-center" style="grid-column: 1 / -1; padding: 50px 20px;">
          <span style="font-size: 3rem; display: block; margin-bottom: 10px;">📦</span>
          <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 6px;">No products found</h3>
          <p style="color: var(--muted); margin-bottom: 18px;">Try modifying your search or add a new handmade item.</p>
          <a href="add-product.html" class="btn btn-primary">+ Add New Product</a>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = items.map(p => `
      <div class="product-card" id="card-${p._id}">
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <span class="product-category-tag">${p.category}</span>
        </div>
        <div class="product-body">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
            <h4 class="product-title">${p.name}</h4>
            <span class="badge ${p.active ? 'badge-active' : 'badge-hidden'}">${p.active ? 'Active' : 'Hidden'}</span>
          </div>
          <p class="product-price">${window.formatCurrency(p.price)}</p>
          ${p.material ? `<p style="font-size: 0.8rem; color: var(--clay);">✦ ${p.material}</p>` : ''}
          <p class="product-desc">${p.description}</p>
          <div class="product-actions">
            <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="toggleProductVisibility('${p._id}')">
              ${p.active ? 'Hide' : 'Show'}
            </button>
            <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="confirmDeleteProduct('${p._id}', '${p.name.replace(/'/g, "\\'")}')">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Global functions attached to window for click events
  window.toggleProductVisibility = function(id) {
    const updated = window.Store.toggleProductStatus(id);
    if (updated) {
      window.showToast(`Product "${updated.name}" is now ${updated.active ? 'Visible' : 'Hidden'}.`, 'info');
      renderInventory();
    }
  };

  window.confirmDeleteProduct = function(id, name) {
    productToDelete = id;
    const modal = document.getElementById('delete-modal');
    const deleteNameEl = document.getElementById('delete-product-name');
    if (deleteNameEl) deleteNameEl.textContent = name;
    if (modal) window.openModal('delete-modal');
  };

  // Confirm delete button inside modal
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (productToDelete) {
        window.Store.deleteProduct(productToDelete);
        window.showToast('Product deleted from catalogue.', 'info');
        window.closeModal('delete-modal');
        productToDelete = null;
        renderInventory();
      }
    });
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderInventory();
    });
  }

  // Category filter tabs
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'All';
      renderInventory();
    });
  });

  // Initial render
  renderInventory();

  // Listen to store updates
  window.Store.on(() => {
    renderInventory();
  });
});
