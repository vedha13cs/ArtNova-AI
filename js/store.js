/**
 * ArtNova AI — Multi-Shop Reactive Data Store (js/store.js)
 * Enables any artisan to create, own, customize, and manage their own independent shop.
 * Isolated inventory, custom slugs, personalized WhatsApp orders, and real-time persistence.
 */

const STORAGE_KEYS = {
  SHOPS: 'artnova_shops_v3',
  ACTIVE_SHOP_ID: 'artnova_active_shop_id_v3',
  INITIALIZED: 'artnova_multi_shop_seeded_v3'
};

// Seed Shop 1: Kavya Creations (Mangaluru)
const KAVYA_SHOP = {
  id: 'shop-kavya',
  ownerName: 'Kavya',
  shopName: 'Kavya Creations',
  slug: 'kavya-handmade',
  email: 'kavya@artnova.ai',
  phone: '919876543210',
  location: 'Mangaluru',
  tagline: 'Handmade with Love • Mangaluru',
  bio: 'Unique handmade products crafted with passion and tradition in the coastal craft haven of Mangaluru.',
  avatar: 'assets/images/artisan-hands.jpg',
  stats: { productsCount: 6, views: 1248, clicks: 326 },
  products: [
    {
      _id: 'prod-001',
      name: 'Beaded Necklace',
      category: 'Jewellery',
      material: 'Natural Jade & Beads',
      price: 499,
      active: true,
      image: 'assets/images/beaded-necklace.jpg',
      original: 'assets/images/beaded-necklace.jpg',
      enhanced: 'assets/images/beaded-necklace.jpg',
      description: "Discover the beauty of handmade jewellery with this elegant beaded necklace. Perfect for everyday wear and special occasions, this unique piece adds a charming touch to your style.",
      clicks: 142
    },
    {
      _id: 'prod-002',
      name: 'Clay Pot',
      category: 'Pottery',
      material: 'Natural Terracotta Clay',
      price: 299,
      active: true,
      image: 'assets/images/terracotta-vase.jpg',
      original: 'assets/images/terracotta-vase.jpg',
      enhanced: 'assets/images/terracotta-vase.jpg',
      description: "Handcrafted terracotta clay pot with traditional etched motifs. Fired in natural kiln to give organic earthy tones.",
      clicks: 86
    },
    {
      _id: 'prod-003',
      name: 'Macrame Wall Hanging',
      category: 'Home Decor',
      material: 'Organic Cotton Cord',
      price: 799,
      active: true,
      image: 'assets/images/macrame-decor.jpg',
      original: 'assets/images/macrame-decor.jpg',
      enhanced: 'assets/images/macrame-decor.jpg',
      description: "Intricately hand-knotted macrame wall hanging tapestry on natural driftwood. Brings a warm bohemian vibe to any room.",
      clicks: 58
    },
    {
      _id: 'prod-004',
      name: 'Handmade Earrings',
      category: 'Jewellery',
      material: 'Antique Brass & Terracotta',
      price: 349,
      active: true,
      image: 'assets/images/handmade-earrings.jpg',
      original: 'assets/images/handmade-earrings.jpg',
      enhanced: 'assets/images/handmade-earrings.jpg',
      description: "Bohemian handcrafted dangle earrings with intricate filigree details and lightweight comfort.",
      clicks: 24
    },
    {
      _id: 'prod-005',
      name: 'Fabric Tote Bag',
      category: 'Accessories',
      material: 'Canvas Cotton',
      price: 399,
      active: true,
      image: 'assets/images/fabric-tote-bag.jpg',
      original: 'assets/images/fabric-tote-bag.jpg',
      enhanced: 'assets/images/fabric-tote-bag.jpg',
      description: "Sustainable handmade cotton canvas tote bag with hand-printed botanical artwork.",
      clicks: 11
    },
    {
      _id: 'prod-006',
      name: 'Decorative Candle',
      category: 'Home Decor',
      material: 'Soy Wax & Dried Botanicals',
      price: 299,
      active: true,
      image: 'assets/images/decorative-candle.jpg',
      original: 'assets/images/decorative-candle.jpg',
      enhanced: 'assets/images/decorative-candle.jpg',
      description: "Hand-poured pure soy wax candle adorned with dried flowers and soothing essential oils.",
      clicks: 5
    }
  ]
};

// Seed Shop 2: Mitti & Clay Co. (Jaipur)
const MITTI_SHOP = {
  id: 'shop-mitti',
  ownerName: 'Aarav Joshi',
  shopName: 'Mitti & Clay Co.',
  slug: 'mitti-clay',
  email: 'aarav@artnova.ai',
  phone: '919811223344',
  location: 'Jaipur',
  tagline: 'Ancestral Pottery • Jaipur',
  bio: 'Heritage blue pottery, rustic clay cookware, and handcrafted planters handmade in the pink city.',
  avatar: 'assets/images/terracotta-vase.jpg',
  stats: { productsCount: 3, views: 640, clicks: 118 },
  products: [
    {
      _id: 'prod-201',
      name: 'Jaipur Terracotta Heritage Vase',
      category: 'Pottery',
      material: 'Pure Riverbed Clay',
      price: 549,
      active: true,
      image: 'assets/images/terracotta-vase.jpg',
      original: 'assets/images/terracotta-vase.jpg',
      enhanced: 'assets/images/terracotta-vase.jpg',
      description: "Sculpted on a traditional manual wheel and wood-fired to terracotta perfection with geometric carvings.",
      clicks: 65
    },
    {
      _id: 'prod-202',
      name: 'Botanical Driftwood Hanging',
      category: 'Home Decor',
      material: 'Natural Cotton',
      price: 899,
      active: true,
      image: 'assets/images/macrame-decor.jpg',
      original: 'assets/images/macrame-decor.jpg',
      enhanced: 'assets/images/macrame-decor.jpg',
      description: "Hand-knotted textured wall art inspired by Rajasthan folk tapestries.",
      clicks: 38
    },
    {
      _id: 'prod-203',
      name: 'Handcrafted Terracotta Drop Earrings',
      category: 'Jewellery',
      material: 'Baked Clay & Brass',
      price: 320,
      active: true,
      image: 'assets/images/handmade-earrings.jpg',
      original: 'assets/images/handmade-earrings.jpg',
      enhanced: 'assets/images/handmade-earrings.jpg',
      description: "Lightweight baked terracotta clay earrings hand-painted with natural mineral dyes.",
      clicks: 15
    }
  ]
};

class ArtNovaStore {
  constructor() {
    this.init();
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('artnova_')) {
        this.notify('storage_sync');
      }
    });
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      const initialShops = [KAVYA_SHOP, MITTI_SHOP];
      this.saveAllShops(initialShops);
      this.setActiveShopId(KAVYA_SHOP.id);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  notify(type, data = null) {
    window.dispatchEvent(new CustomEvent('artnova:change', { detail: { type, data } }));
  }

  on(callback) {
    window.addEventListener('artnova:change', (e) => callback(e.detail));
  }

  // Multi-shop Management
  getAllShops() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SHOPS);
      return raw ? JSON.parse(raw) : [KAVYA_SHOP, MITTI_SHOP];
    } catch {
      return [KAVYA_SHOP, MITTI_SHOP];
    }
  }

  saveAllShops(shops) {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
    this.notify('shops_updated', shops);
  }

  getActiveShopId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SHOP_ID) || KAVYA_SHOP.id;
  }

  setActiveShopId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SHOP_ID, id);
    this.notify('active_shop_changed', id);
  }

  // Get current active shop for seller dashboard
  getActiveShop() {
    const shops = this.getAllShops();
    const activeId = this.getActiveShopId();
    return shops.find(s => s.id === activeId) || shops[0] || KAVYA_SHOP;
  }

  // Find any shop by slug (used by public customer storefront)
  getShopBySlug(slug) {
    const shops = this.getAllShops();
    if (!slug) return this.getActiveShop();
    const cleanSlug = slug.toLowerCase().trim();
    return shops.find(s => s.slug === cleanSlug) || shops[0] || KAVYA_SHOP;
  }

  // Create a brand new shop (allows anyone to own their own shop)
  createShop(shopData) {
    const shops = this.getAllShops();
    
    // Auto-generate clean slug
    let baseSlug = (shopData.shopName || 'artisan-shop')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'artisan';
    
    let slug = baseSlug;
    let counter = 1;
    while (shops.some(s => s.slug === slug)) {
      slug = `${baseSlug}-${++counter}`;
    }

    const newShop = {
      id: 'shop-' + Date.now(),
      ownerName: shopData.ownerName || shopData.name || 'Artisan Creator',
      shopName: shopData.shopName || 'My Artisan Studio',
      slug: slug,
      email: shopData.email || `${slug}@artnova.ai`,
      phone: (shopData.phone || '919876543210').replace(/\D/g, ''),
      location: shopData.location || 'India',
      tagline: `Handmade with Love • ${shopData.location || 'Artisan Workshop'}`,
      bio: shopData.bio || `Welcome to ${shopData.shopName}! We create handmade, slow-crafted authentic treasures with passion and care.`,
      avatar: 'assets/images/artisan-hands.jpg',
      stats: { productsCount: 0, views: 12, clicks: 0 },
      products: []
    };

    shops.push(newShop);
    this.saveAllShops(shops);
    this.setActiveShopId(newShop.id);

    return newShop;
  }

  // Update existing shop profile
  updateShopProfile(updatedFields) {
    const shops = this.getAllShops();
    const activeShop = this.getActiveShop();
    const index = shops.findIndex(s => s.id === activeShop.id);

    if (index !== -1) {
      shops[index] = { ...shops[index], ...updatedFields };
      this.saveAllShops(shops);
      return shops[index];
    }
    return activeShop;
  }

  // Switch seller's active shop
  switchShop(shopId) {
    this.setActiveShopId(shopId);
  }

  // Compatibility getter for existing modules
  getUser() {
    const shop = this.getActiveShop();
    return {
      id: shop.id,
      name: shop.ownerName,
      shopName: shop.shopName,
      slug: shop.slug,
      email: shop.email,
      phone: shop.phone,
      location: shop.location,
      tagline: shop.tagline,
      bio: shop.bio
    };
  }

  // Get products for active shop or specific slug
  getProducts(activeOnly = false, shopSlug = null) {
    const shop = shopSlug ? this.getShopBySlug(shopSlug) : this.getActiveShop();
    let list = shop.products || [];
    if (activeOnly) {
      list = list.filter(p => p.active !== false);
    }
    return list;
  }

  getProductById(id, shopSlug = null) {
    const list = this.getProducts(false, shopSlug);
    return list.find(p => p._id === id) || null;
  }

  // Add product to the active shop
  addProduct(productData) {
    const shops = this.getAllShops();
    const activeShop = this.getActiveShop();
    const shopIndex = shops.findIndex(s => s.id === activeShop.id);

    if (shopIndex === -1) return null;

    const newProduct = {
      _id: 'prod-' + Date.now(),
      name: productData.name.trim(),
      category: productData.category || 'Jewellery',
      price: Number(productData.price) || 499,
      material: productData.material || '',
      description: productData.description || '',
      image: productData.image || 'assets/images/beaded-necklace.jpg',
      original: productData.original || productData.image,
      enhanced: productData.enhanced || productData.image,
      active: true,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    shops[shopIndex].products.unshift(newProduct);
    shops[shopIndex].stats.productsCount = shops[shopIndex].products.length;
    this.saveAllShops(shops);

    return newProduct;
  }

  toggleProductStatus(id) {
    const shops = this.getAllShops();
    const activeShop = this.getActiveShop();
    const shopIndex = shops.findIndex(s => s.id === activeShop.id);

    if (shopIndex !== -1) {
      const item = shops[shopIndex].products.find(p => p._id === id);
      if (item) {
        item.active = !item.active;
        this.saveAllShops(shops);
        return item;
      }
    }
    return null;
  }

  deleteProduct(id) {
    const shops = this.getAllShops();
    const activeShop = this.getActiveShop();
    const shopIndex = shops.findIndex(s => s.id === activeShop.id);

    if (shopIndex !== -1) {
      shops[shopIndex].products = shops[shopIndex].products.filter(p => p._id !== id);
      shops[shopIndex].stats.productsCount = shops[shopIndex].products.length;
      this.saveAllShops(shops);
      return true;
    }
    return false;
  }

  // Analytics for active shop
  getStats(shopSlug = null) {
    const shop = shopSlug ? this.getShopBySlug(shopSlug) : this.getActiveShop();
    const products = shop.products || [];
    return {
      productsCount: products.length || shop.stats.productsCount || 0,
      activeProductsCount: products.filter(p => p.active).length,
      views: shop.stats.views || 0,
      clicks: products.reduce((acc, p) => acc + (p.clicks || 0), 0)
    };
  }

  recordView(shopSlug = null) {
    const shops = this.getAllShops();
    const shop = shopSlug ? this.getShopBySlug(shopSlug) : this.getActiveShop();
    const index = shops.findIndex(s => s.id === shop.id);
    if (index !== -1) {
      shops[index].stats.views = (shops[index].stats.views || 0) + 1;
      this.saveAllShops(shops);
    }
  }

  recordClick(productId, shopSlug = null) {
    const shops = this.getAllShops();
    const shop = shopSlug ? this.getShopBySlug(shopSlug) : this.getActiveShop();
    const index = shops.findIndex(s => s.id === shop.id);

    if (index !== -1) {
      const item = shops[index].products.find(p => p._id === productId);
      if (item) {
        item.clicks = (item.clicks || 0) + 1;
      }
      shops[index].stats.clicks = (shops[index].stats.clicks || 0) + 1;
      this.saveAllShops(shops);
    }
  }

  isLoggedIn() {
    return true;
  }

  logout() {
    this.notify('logged_out');
  }
}

window.Store = new ArtNovaStore();
