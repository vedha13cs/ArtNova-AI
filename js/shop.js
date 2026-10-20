/**
 * ArtNova AI — Public Storefront Module (js/shop.js)
 * Customer catalogue viewing, category tabs, product modal, and direct WhatsApp ordering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Record page view for seller analytics
  window.Store.recordView();

  // Elements
  const shopNameHeader = document.getElementById('public-shop-name');
  const shopOwnerHeader = document.getElementById('public-shop-owner');
  const shopBioHeader = document.getElementById('public-shop-bio');
  const shopGrid = document.getElementById('public-products-grid');
  const searchInput = document.getElementById('customer-search');
  const filterPills = document.querySelectorAll('.filter-pill');
  const btnShareShop = document.getElementById('btn-share-shop');

  // Modal elements
  const detailModal = document.getElementById('product-detail-modal');
  const detailImg = document.getElementById('modal-product-img');
  const detailTitle = document.getElementById('modal-product-title');
  const detailPrice = document.getElementById('modal-product-price');
  const detailCategory = document.getElementById('modal-product-category');
  const detailMaterial = document.getElementById('modal-product-material');
  const detailDesc = document.getElementById('modal-product-desc');
  const detailOrderBtn = document.getElementById('modal-order-whatsapp-btn');

  const user = window.Store.getUser();
  let currentCategory = 'All';
  let searchQuery = '';

  // Set Shop Brand Info
  if (shopNameHeader) shopNameHeader.textContent = user.shopName || 'Artisan Studio';
  if (shopOwnerHeader) shopOwnerHeader.textContent = `Handcrafted with devotion by ${user.name || 'Artisan'}`;
  if (shopBioHeader) shopBioHeader.textContent = user.bio || 'Curated handmade slow crafts, traditional artistry, and one-of-a-kind treasures.';

  // Share shop button
  if (btnShareShop) {
    btnShareShop.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: user.shopName,
          text: `Check out handmade crafts by ${user.name} on ArtNova AI!`,
          url: url
        }).catch(() => {});
      } else {
        window.copyToClipboard(url, 'Shop link copied to clipboard!');
      }
    });
  }

  // Render Public Products
  function renderPublicProducts() {
    if (!shopGrid) return;

    let items = window.Store.getProducts(true); // Active products only

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (currentCategory !== 'All') {
      items = items.filter(p => p.category === currentCategory);
    }

    if (items.length === 0) {
      shopGrid.innerHTML = `
        <div class="card text-center" style="grid-column: 1 / -1; padding: 60px 20px;">
          <span style="font-size: 3.5rem; display: block; margin-bottom: 12px;">🌿</span>
          <h3 style="font-size: 1.3rem; font-weight: 600; margin-bottom: 8px;">No creations found in this collection</h3>
          <p style="color: var(--muted);">Check back soon or explore our other handcrafted items.</p>
        </div>
      `;
      return;
    }

    shopGrid.innerHTML = items.map(p => {
      const phone = user.phone || '';
      const orderMessage = encodeURIComponent(`Hi ${user.name || ''}! I'm interested in ordering "${p.name}" (${window.formatCurrency(p.price)}) from ${user.shopName}. Is this available?`);
      const whatsappUrl = phone 
        ? `https://wa.me/${phone}?text=${orderMessage}`
        : `https://wa.me/?text=${orderMessage}`;

      return `
        <div class="product-card card-hover" style="cursor: pointer;" onclick="openProductDetail('${p._id}')">
          <div class="product-image-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <span class="product-category-tag">${p.category}</span>
          </div>
          <div class="product-body">
            <h4 class="product-title">${p.name}</h4>
            <p class="product-price">${window.formatCurrency(p.price)}</p>
            ${p.material ? `<p style="font-size: 0.8rem; color: var(--clay); font-weight: 500;">✦ ${p.material}</p>` : ''}
            <p class="product-desc">${p.description}</p>
            
            <div class="product-actions" style="margin-top: 14px;">
              <button 
                class="btn btn-whatsapp btn-block" 
                onclick="event.stopPropagation(); orderOnWhatsApp('${p._id}', '${p.name.replace(/'/g, "\\'")}', ${p.price})"
              >
                <span>💬</span> Order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Handle WhatsApp Order action
  window.orderOnWhatsApp = function(productId, productName, productPrice) {
    window.Store.recordClick(productId);

    const phone = user.phone ? user.phone.replace(/\D/g, '') : '';
    const text = encodeURIComponent(`Hello ${user.name}! I would love to order "${productName}" (${window.formatCurrency(productPrice)}) from your store ${user.shopName}. Please let me know how to proceed with payment and delivery!`);

    const targetUrl = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(targetUrl, '_blank');
  };

  // Open Product Detail Modal
  window.openProductDetail = function(productId) {
    const product = window.Store.getProductById(productId);
    if (!product) return;

    if (detailImg) detailImg.src = product.image;
    if (detailTitle) detailTitle.textContent = product.name;
    if (detailPrice) detailPrice.textContent = window.formatCurrency(product.price);
    if (detailCategory) detailCategory.textContent = product.category;
    if (detailMaterial) {
      detailMaterial.textContent = product.material ? `Material: ${product.material}` : '';
      detailMaterial.style.display = product.material ? 'block' : 'none';
    }
    if (detailDesc) detailDesc.textContent = product.description;

    if (detailOrderBtn) {
      detailOrderBtn.onclick = () => {
        window.orderOnWhatsApp(product._id, product.name, product.price);
      };
    }

    window.openModal('product-detail-modal');
  };

  // Category filters
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'All';
      renderPublicProducts();
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderPublicProducts();
    });
  }

  // Initial render
  renderPublicProducts();

  // Reactive store updates
  window.Store.on(() => {
    renderPublicProducts();
  });
});
