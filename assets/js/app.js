/**
 * Bedcover Susah Bangun - Frontend Application JavaScript
 * Features:
 * - Mutually exclusive Views (Category List Showcase vs Product Inside Category)
 * - Responsive Select Box Filters (Category, Ukuran Kasur, Tinggi Kasur)
 * - Required Size & Height Selection before WhatsApp Chat & Cart
 * - WhatsApp auto-chat message with Line 1 Product Link (No raw image URL)
 * - Full Shopping Cart (Keranjang Belanja) with Multi-Product Select & Bulk WA Checkout
 * - Dynamic Open Graph support & deep-linking via ?product=ID
 * - Luxury Hero Banner Carousel, Search, and Wishlist
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Data from PHP Backend
  const backendData = window.BEDCOVER_DATA || {};
  let products = backendData.products || [];
  let categories = backendData.categories || [];
  const waNumber = backendData.waNumber || '6281234567890';
  const baseUrl = backendData.baseUrl || window.location.origin;

  // LocalStorage Keys
  const WISHLIST_STORAGE_KEY = 'bedcover_wishlist';
  const CART_STORAGE_KEY = 'bedcover_cart';

  // App State
  let currentView = 'categories'; // 'categories' | 'products'
  let activeCategory = 'all';
  let activeSize = 'all';
  let activeHeight = 'all';
  let searchQuery = '';
  let wishlistOnly = false;
  let wishlist = getStoredWishlist();
  let cart = getStoredCart();

  // Active Modal Selection State
  let activeModalProductId = null;
  let selectedModalSize = null;
  let selectedModalHeight = null;

  // DOM Elements - Navigation & Views
  const viewCategories = document.getElementById('viewCategories');
  const viewProducts = document.getElementById('viewProducts');
  const btnBackToCategories = document.getElementById('btnBackToCategories');
  const btnEmptyBackCat = document.getElementById('btnEmptyBackCat');
  const navBtnCategories = document.getElementById('navBtnCategories');
  const navBtnProducts = document.getElementById('navBtnProducts');

  // DOM Elements - Catalog Header & Filters
  const catalogHeading = document.getElementById('catalogHeading');
  const catalogCountPill = document.getElementById('catalogCountPill');
  const categorySelectDropdown = document.getElementById('categorySelectDropdown');
  const filterSizeSelect = document.getElementById('filterSizeSelect');
  const filterHeightSelect = document.getElementById('filterHeightSelect');
  const activeCategoryBanner = document.getElementById('activeCategoryBanner');
  const selectedCategoryName = document.getElementById('selectedCategoryName');
  const btnResetCategory = document.getElementById('btnResetCategory');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const categoriesGrid = document.getElementById('categoriesGrid');
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');

  // Search Elements
  const searchSection = document.getElementById('searchSection');
  const btnToggleSearch = document.getElementById('btnToggleSearch');
  const mainSearchInput = document.getElementById('mainSearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');

  // Wishlist Elements
  const btnHeaderWishlist = document.getElementById('btnHeaderWishlist');
  const wishlistCount = document.getElementById('wishlistCount');

  // Cart Elements
  const btnHeaderCart = document.getElementById('btnHeaderCart');
  const cartCount = document.getElementById('cartCount');
  const btnFloatingCart = document.getElementById('btnFloatingCart');
  const floatingCartCount = document.getElementById('floatingCartCount');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const btnCloseCartDrawer = document.getElementById('btnCloseCartDrawer');
  const cartDrawerBadge = document.getElementById('cartDrawerBadge');
  const cartToolbar = document.getElementById('cartToolbar');
  const cartSelectAllCheckbox = document.getElementById('cartSelectAllCheckbox');
  const cartSelectedCountText = document.getElementById('cartSelectedCountText');
  const btnClearSelectedCart = document.getElementById('btnClearSelectedCart');
  const cartDrawerBody = document.getElementById('cartDrawerBody');
  const cartDrawerFooter = document.getElementById('cartDrawerFooter');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const btnCartWhatsApp = document.getElementById('btnCartWhatsApp');
  const cartWhatsAppLabel = document.getElementById('cartWhatsAppLabel');

  // Modal Detail Elements
  const productDetailModal = document.getElementById('productDetailModal');
  const modalDetailContent = document.getElementById('modalDetailContent');
  const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');

  // Hero Carousel Elements
  const heroCarousel = document.getElementById('heroCarousel');
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrevBtn = document.getElementById('carouselPrevBtn');
  const carouselNextBtn = document.getElementById('carouselNextBtn');
  const carouselDots = document.getElementById('carouselDots');

  // ==========================================
  // STORAGE HELPERS (WISHLIST & CART)
  // ==========================================

  function getStoredWishlist() {
    try {
      const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredWishlist(list) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function updateWishlistBadge() {
    if (wishlistCount) {
      wishlistCount.textContent = wishlist.length;
    }
  }

  function getStoredCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredCart(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (cartCount) cartCount.textContent = totalQty;
    if (floatingCartCount) floatingCartCount.textContent = totalQty;
    if (cartDrawerBadge) cartDrawerBadge.textContent = `${totalQty} Item`;
  }

  // ==========================================
  // FORMATTING & STRING HELPERS
  // ==========================================

  function formatRupiah(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatImageUrl(url) {
    if (!url) return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
    const trimmed = String(url).trim();
    if (trimmed.includes('api/image.php')) return trimmed;
    const driveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return 'api/image.php?id=' + driveMatch[1];
    }
    return trimmed;
  }

  function showToast(message) {
    let toast = document.querySelector('.catalog-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'catalog-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function strCaseEq(a, b) {
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  }

  function strCaseContains(str, search) {
    return String(str || '').toLowerCase().includes(String(search).toLowerCase());
  }

  function sanitizeWaPhone(phone) {
    let clean = String(phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  }

  // ==========================================
  // VIEW SWITCHING (CATEGORIES <-> PRODUCTS)
  // ==========================================

  function switchView(targetView, category = null, scroll = true) {
    currentView = targetView;

    if (targetView === 'categories') {
      if (viewCategories) {
        viewCategories.style.display = 'block';
        viewCategories.classList.add('active');
      }
      if (viewProducts) {
        viewProducts.style.display = 'none';
        viewProducts.classList.remove('active');
      }
      if (navBtnCategories) navBtnCategories.classList.add('active');
      if (navBtnProducts) navBtnProducts.classList.remove('active');

      activeCategory = 'all';
      wishlistOnly = false;

      if (scroll && viewCategories) {
        viewCategories.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Products in Category View
      if (viewCategories) {
        viewCategories.style.display = 'none';
        viewCategories.classList.remove('active');
      }
      if (viewProducts) {
        viewProducts.style.display = 'block';
        viewProducts.classList.add('active');
      }
      if (navBtnCategories) navBtnCategories.classList.remove('active');
      if (navBtnProducts) navBtnProducts.classList.add('active');

      if (category !== null) {
        activeCategory = category;
      }

      updateFiltersUI();
      filterAndRenderProducts();

      if (scroll && viewProducts) {
        viewProducts.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Navigation Button Handlers
  if (btnBackToCategories) {
    btnBackToCategories.addEventListener('click', () => switchView('categories', null, true));
  }
  if (btnEmptyBackCat) {
    btnEmptyBackCat.addEventListener('click', () => switchView('categories', null, true));
  }
  if (navBtnCategories) {
    navBtnCategories.addEventListener('click', () => switchView('categories', null, true));
  }
  if (navBtnProducts) {
    navBtnProducts.addEventListener('click', () => switchView('products', 'all', true));
  }

  document.querySelectorAll('.btn-banner-explore').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('categories', null, true);
    });
  });

  // Category Cards in Category Showcase
  if (categoriesGrid) {
    categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catName = card.getAttribute('data-category');
        switchView('products', catName, true);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const catName = card.getAttribute('data-category');
          switchView('products', catName, true);
        }
      });
    });
  }

  // Footer Category Links
  document.querySelectorAll('.footer-cat-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-category');
      switchView('products', cat, true);
    });
  });

  // ==========================================
  // RESPONSIVE FILTERS (CATEGORY, UKURAN, TINGGI)
  // ==========================================

  function updateFiltersUI() {
    if (categorySelectDropdown) {
      categorySelectDropdown.value = activeCategory;
    }
    if (filterSizeSelect) {
      filterSizeSelect.value = activeSize;
    }
    if (filterHeightSelect) {
      filterHeightSelect.value = activeHeight;
    }

    if (activeCategoryBanner && selectedCategoryName) {
      if (activeCategory !== 'all' && !wishlistOnly) {
        selectedCategoryName.textContent = activeCategory;
        activeCategoryBanner.style.display = 'flex';
        catalogHeading.textContent = `Koleksi: ${activeCategory}`;
      } else if (wishlistOnly) {
        activeCategoryBanner.style.display = 'none';
        catalogHeading.textContent = '❤️ Koleksi Favorit Saya';
      } else {
        activeCategoryBanner.style.display = 'none';
        catalogHeading.textContent = 'Semua Koleksi Bedcover';
      }
    }
  }

  if (categorySelectDropdown) {
    categorySelectDropdown.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      wishlistOnly = false;
      updateFiltersUI();
      filterAndRenderProducts();
    });
  }

  if (filterSizeSelect) {
    filterSizeSelect.addEventListener('change', (e) => {
      activeSize = e.target.value;
      filterAndRenderProducts();
    });
  }

  if (filterHeightSelect) {
    filterHeightSelect.addEventListener('change', (e) => {
      activeHeight = e.target.value;
      filterAndRenderProducts();
    });
  }

  if (btnResetCategory) {
    btnResetCategory.addEventListener('click', () => {
      activeCategory = 'all';
      updateFiltersUI();
      filterAndRenderProducts();
    });
  }

  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      activeCategory = 'all';
      activeSize = 'all';
      activeHeight = 'all';
      searchQuery = '';
      if (mainSearchInput) mainSearchInput.value = '';
      wishlistOnly = false;
      updateFiltersUI();
      filterAndRenderProducts();
    });
  }

  // ==========================================
  // PRODUCT FILTER & 2-COLUMN RENDER
  // ==========================================

  function filterAndRenderProducts() {
    let filtered = [...products];

    // Wishlist filter
    if (wishlistOnly) {
      filtered = filtered.filter(p => wishlist.includes(p.id));
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => strCaseEq(p.category, activeCategory));
    }

    // Size filter
    if (activeSize !== 'all') {
      filtered = filtered.filter(p => {
        const sizes = Array.isArray(p.sizes) ? p.sizes : [];
        return sizes.some(s => strCaseContains(s, activeSize));
      });
    }

    // Height filter
    if (activeHeight !== 'all') {
      filtered = filtered.filter(p => {
        const heights = Array.isArray(p.heights) ? p.heights : [];
        return heights.some(h => strCaseContains(h, activeHeight));
      });
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(p => {
        const nameM = (p.name || '').toLowerCase().includes(searchQuery);
        const descM = (p.short_desc || '').toLowerCase().includes(searchQuery);
        const fullM = (p.full_desc || '').toLowerCase().includes(searchQuery);
        const catM = (p.category || '').toLowerCase().includes(searchQuery);
        const sizesStr = Array.isArray(p.sizes) ? p.sizes.join(' ').toLowerCase() : '';
        const sizeM = sizesStr.includes(searchQuery);
        const heightsStr = Array.isArray(p.heights) ? p.heights.join(' ').toLowerCase() : '';
        const heightM = heightsStr.includes(searchQuery);
        return nameM || descM || fullM || catM || sizeM || heightM;
      });
    }

    if (catalogCountPill) {
      catalogCountPill.textContent = `${filtered.length} Produk`;
    }

    if (filtered.length === 0) {
      productsGrid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    productsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    productsGrid.innerHTML = filtered.map(p => {
      const isLoved = wishlist.includes(p.id);
      const isPO = strCaseContains(p.status, 'pre-order');
      const isSold = strCaseContains(p.status, 'habis') || strCaseContains(p.status, 'sold');
      const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'];
      const coverImg = formatImageUrl(images[0]);
      const hasVideo = !!p.video;

      let statusBadgeClass = 'ready';
      if (isPO) statusBadgeClass = 'po';
      if (isSold) statusBadgeClass = 'sold';

      const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['180 x 200', '160 x 200', '120 x 200'];
      const heights = Array.isArray(p.heights) && p.heights.length > 0 ? p.heights : ['25 cm', '20 cm'];

      return `
        <div class="product-card" data-id="${escapeHtml(p.id)}">
          <div class="product-media-wrap">
            <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(p.name)}" class="product-img" loading="lazy" referrerpolicy="no-referrer">
            
            <span class="badge-status ${statusBadgeClass}">${escapeHtml(p.status || 'Ready Stock')}</span>

            ${hasVideo ? `
              <span class="badge-video">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span>Video</span>
              </span>
            ` : ''}

            <button type="button" class="btn-wishlist-toggle ${isLoved ? 'active' : ''}" data-id="${escapeHtml(p.id)}" title="Simpan ke Favorit" aria-label="Favorit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLoved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="product-body">
            <span class="product-category-tag">${escapeHtml(p.category || 'Luxury Bedding')}</span>
            <h3 class="product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
            <p class="product-desc">${escapeHtml(p.short_desc || p.full_desc || '')}</p>

            <div class="product-card-sizes">
              <span class="card-size-label">Ukuran:</span>
              <div class="card-size-pills-list">
                ${sizes.slice(0, 3).map(s => `<span class="card-size-pill">${escapeHtml(s)}</span>`).join('')}
                ${sizes.length > 3 ? `<span class="card-size-pill">+${sizes.length - 3}</span>` : ''}
              </div>
            </div>

            <div class="product-footer">
              <div class="product-price">
                <span class="price-label">Mulai Dari</span>
                <span class="price-amount">${formatRupiah(p.price)}</span>
              </div>

              <button type="button" class="btn btn-luxury-primary btn-view-product" data-id="${escapeHtml(p.id)}">
                <span>Pilih Ukuran</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachProductCardEvents();
  }

  function attachProductCardEvents() {
    productsGrid.querySelectorAll('.btn-view-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openProductModal(id);
      });
    });

    productsGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-wishlist-toggle')) return;
        const id = card.getAttribute('data-id');
        openProductModal(id);
      });
    });

    productsGrid.querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        toggleWishlist(id, btn);
      });
    });
  }

  function toggleWishlist(id, buttonEl) {
    const idx = wishlist.indexOf(id);
    if (idx !== -1) {
      wishlist.splice(idx, 1);
      if (buttonEl) buttonEl.classList.remove('active');
      showToast('Dihapus dari favorit.');
    } else {
      wishlist.push(id);
      if (buttonEl) buttonEl.classList.add('active');
      showToast('Ditambahkan ke favorit! ❤️');
    }
    saveStoredWishlist(wishlist);
    updateWishlistBadge();

    if (wishlistOnly) {
      filterAndRenderProducts();
    }
  }

  // ==========================================
  // MODAL DETAIL, SIZE & HEIGHT SELECTION
  // ==========================================

  function openProductModal(productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;

    activeModalProductId = productId;
    selectedModalSize = null;
    selectedModalHeight = null;

    const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000'];
    const coverImg = formatImageUrl(images[0]);
    const isLoved = wishlist.includes(p.id);
    const hasVideo = !!p.video;
    const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['180 x 200', '160 x 200', '120 x 200', '95 x 140', '140 x 190', '190 x 220', '190 x 270'];
    const heights = Array.isArray(p.heights) && p.heights.length > 0 ? p.heights : ['25 cm', '20 cm'];

    // Update Browser URL for direct sharing & Open Graph unfurl
    history.replaceState(null, null, `?product=${encodeURIComponent(p.id)}`);

    modalDetailContent.innerHTML = `
      <div class="modal-detail-grid">
        <!-- Media Column -->
        <div class="modal-media-col">
          <div class="modal-main-image-wrap">
            <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(p.name)}" class="modal-main-img" id="modalMainImg" referrerpolicy="no-referrer">
          </div>

          ${images.length > 1 ? `
            <div class="modal-thumbnails-row">
              ${images.map((img, i) => `
                <div class="modal-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                  <img src="${escapeHtml(formatImageUrl(img))}" alt="Thumbnail ${i+1}" referrerpolicy="no-referrer">
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${hasVideo ? `
            <div class="modal-video-wrap">
              <div class="video-label">🎥 Video Dokumentasi Produk:</div>
              <video src="${escapeHtml(p.video)}" controls playsinline></video>
            </div>
          ` : ''}
        </div>

        <!-- Info Column -->
        <div class="modal-info-col">
          <span class="modal-category-badge">👑 ${escapeHtml(p.category || 'Luxury Bedding')}</span>
          <h2 class="modal-product-title">${escapeHtml(p.name)}</h2>

          <div class="modal-price-status-row">
            <div class="modal-price">${formatRupiah(p.price)}</div>
            <span class="badge-status ${strCaseContains(p.status, 'pre-order') ? 'po' : 'ready'}">
              ${escapeHtml(p.status || 'Ready Stock')}
            </span>
          </div>

          <div class="modal-desc-box">
            ${p.short_desc ? `<p class="modal-short-desc">"${escapeHtml(p.short_desc)}"</p>` : ''}
            <div class="modal-full-desc">${escapeHtml(p.full_desc || '')}</div>
          </div>

          <!-- 1. UKURAN KASUR SELECTION -->
          <div class="modal-size-select-section" id="modalSizeSection">
            <div class="modal-size-header">
              <span class="modal-size-title">1. Pilih Ukuran Kasur</span>
              <span class="size-required-badge">Wajib</span>
            </div>
            <p class="size-select-helper">Pilih salah satu ukuran bedcover:</p>

            <div class="modal-size-pills-wrap" id="modalSizePillsWrap">
              ${sizes.map(s => `
                <button type="button" class="modal-size-pill" data-size="${escapeHtml(s)}">
                  <span class="pill-check-icon">✓</span>
                  <span class="pill-name">${escapeHtml(s)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 2. TINGGI KASUR SELECTION -->
          <div class="modal-height-select-section" id="modalHeightSection">
            <div class="modal-size-header">
              <span class="modal-size-title">2. Pilih Tinggi Kasur</span>
              <span class="size-required-badge">Wajib</span>
            </div>
            <p class="size-select-helper">Pilih tinggi ranjang/kasur Anda:</p>

            <div class="modal-height-pills-wrap" id="modalHeightPillsWrap">
              ${heights.map(h => `
                <button type="button" class="modal-height-pill" data-height="${escapeHtml(h)}">
                  <span class="pill-check-icon">✓</span>
                  <span class="pill-name">${escapeHtml(h)}</span>
                </button>
              `).join('')}
            </div>

            <div class="size-alert-hint" id="sizeAlertHint" style="display: none; margin-top: 10px;">
              ⚠️ Silakan pilih ukuran dan tinggi kasur terlebih dahulu sebelum konsultasi atau menambah ke keranjang.
            </div>
          </div>

          <!-- DUAL ACTIONS: WHATSAPP AUTO-CHAT & ADD TO CART -->
          <div class="modal-actions-dual">
            <a href="javascript:void(0)" class="btn-whatsapp-chat locked" id="btnModalWhatsApp" data-locked="true" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span id="waBtnLabel">Pilih Ukuran &amp; Tinggi Dulu</span>
            </a>

            <button type="button" class="btn-modal-cart locked" id="btnModalAddToCart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span>+ Tambah ke Keranjang Belanja</span>
            </button>

            <!-- Modal Love Toggle -->
            <button type="button" class="btn-modal-love ${isLoved ? 'active' : ''}" id="btnModalLove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLoved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${isLoved ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Thumbnail Clicks
    const modalMainImg = document.getElementById('modalMainImg');
    const thumbEls = modalDetailContent.querySelectorAll('.modal-thumb');
    thumbEls.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.getAttribute('data-index'), 10);
        modalMainImg.src = formatImageUrl(images[idx]);
        thumbEls.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    const sizeAlertHint = document.getElementById('sizeAlertHint');
    const btnModalWhatsApp = document.getElementById('btnModalWhatsApp');
    const btnModalAddToCart = document.getElementById('btnModalAddToCart');
    const waBtnLabel = document.getElementById('waBtnLabel');
    const sizePillBtns = modalDetailContent.querySelectorAll('.modal-size-pill');
    const heightPillBtns = modalDetailContent.querySelectorAll('.modal-height-pill');

    function checkSelectionStatus() {
      const hasSize = !!selectedModalSize;
      const hasHeight = !!selectedModalHeight;

      if (hasSize && hasHeight) {
        if (sizeAlertHint) sizeAlertHint.style.display = 'none';

        // Unlock WA Button
        btnModalWhatsApp.classList.remove('locked');
        btnModalWhatsApp.classList.add('unlocked');
        btnModalWhatsApp.setAttribute('data-locked', 'false');
        if (waBtnLabel) {
          waBtnLabel.textContent = `Tanya Ready via WA (${selectedModalSize} • T: ${selectedModalHeight})`;
        }

        // Generate WA Auto-Chat Link
        // CRITICAL: Put product link on LINE 1, NO raw image link!
        const productUrl = `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(p.id)}`;
        btnModalWhatsApp.href = buildSingleProductWaUrl(waNumber, p.name, p.category, p.price, productUrl, selectedModalSize, selectedModalHeight);
        btnModalWhatsApp.target = '_blank';

        // Unlock Cart Button
        btnModalAddToCart.classList.remove('locked');
      } else {
        btnModalWhatsApp.classList.add('locked');
        btnModalWhatsApp.classList.remove('unlocked');
        btnModalWhatsApp.setAttribute('data-locked', 'true');
        btnModalAddToCart.classList.add('locked');

        if (!hasSize && !hasHeight) {
          if (waBtnLabel) waBtnLabel.textContent = 'Pilih Ukuran & Tinggi Dulu';
        } else if (!hasSize) {
          if (waBtnLabel) waBtnLabel.textContent = 'Pilih Ukuran Kasur Dulu';
        } else {
          if (waBtnLabel) waBtnLabel.textContent = 'Pilih Tinggi Kasur Dulu';
        }
      }
    }

    // Size Selection
    sizePillBtns.forEach(pill => {
      pill.addEventListener('click', () => {
        selectedModalSize = pill.getAttribute('data-size');
        sizePillBtns.forEach(b => b.classList.remove('active'));
        pill.classList.add('active');
        checkSelectionStatus();
      });
    });

    // Height Selection
    heightPillBtns.forEach(pill => {
      pill.addEventListener('click', () => {
        selectedModalHeight = pill.getAttribute('data-height');
        heightPillBtns.forEach(b => b.classList.remove('active'));
        pill.classList.add('active');
        checkSelectionStatus();
      });
    });

    // Auto-select if only 1 option available
    if (sizes.length === 1) {
      selectedModalSize = sizes[0];
      sizePillBtns[0].classList.add('active');
    }
    if (heights.length === 1) {
      selectedModalHeight = heights[0];
      heightPillBtns[0].classList.add('active');
    }
    checkSelectionStatus();

    // Guard WA Click
    btnModalWhatsApp.addEventListener('click', (e) => {
      if (btnModalWhatsApp.getAttribute('data-locked') === 'true' || !selectedModalSize || !selectedModalHeight) {
        e.preventDefault();
        e.stopPropagation();
        if (sizeAlertHint) sizeAlertHint.style.display = 'block';
        showToast('⚠️ Silakan pilih ukuran dan tinggi kasur terlebih dahulu!');
      }
    });

    // Add To Cart Click
    btnModalAddToCart.addEventListener('click', () => {
      if (!selectedModalSize || !selectedModalHeight) {
        if (sizeAlertHint) sizeAlertHint.style.display = 'block';
        showToast('⚠️ Silakan pilih ukuran dan tinggi kasur terlebih dahulu!');
        return;
      }

      addItemToCart({
        productId: p.id,
        name: p.name,
        category: p.category || 'Luxury Bedding',
        price: p.price || 0,
        image: coverImg,
        size: selectedModalSize,
        height: selectedModalHeight,
        qty: 1
      });

      showToast(`Berhasil menambahkan "${p.name}" ke keranjang! 🛒`);
      closeProductModal();
      openCartDrawer();
    });

    // Love Toggle
    const btnModalLove = document.getElementById('btnModalLove');
    if (btnModalLove) {
      btnModalLove.addEventListener('click', () => {
        toggleWishlist(p.id, null);
        const nowLoved = wishlist.includes(p.id);
        btnModalLove.classList.toggle('active', nowLoved);
        btnModalLove.querySelector('span').textContent = nowLoved ? 'Tersimpan di Favorit' : 'Simpan ke Favorit';
        btnModalLove.querySelector('svg').setAttribute('fill', nowLoved ? 'currentColor' : 'none');

        const cardHeart = productsGrid.querySelector(`.btn-wishlist-toggle[data-id="${p.id}"]`);
        if (cardHeart) cardHeart.classList.toggle('active', nowLoved);
      });
    }

    productDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    productDetailModal.classList.remove('active');
    document.body.style.overflow = '';
    activeModalProductId = null;
    selectedModalSize = null;
    selectedModalHeight = null;

    // Reset URL to clean path
    history.replaceState(null, null, window.location.pathname);
  }

  if (btnCloseDetailModal) {
    btnCloseDetailModal.addEventListener('click', closeProductModal);
  }

  if (productDetailModal) {
    productDetailModal.addEventListener('click', (e) => {
      if (e.target === productDetailModal) closeProductModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productDetailModal.classList.contains('active')) {
      closeProductModal();
    }
  });

  // ==========================================
  // WHATSAPP LINK GENERATOR (SINGLE PRODUCT)
  // (Moves link to Top Line, No raw image URL)
  // ==========================================

  function buildSingleProductWaUrl(phone, name, category, price, productUrl, size, height) {
    const cleanPhone = sanitizeWaPhone(phone);

    // Line 1 contains the product URL so WhatsApp generates the thumbnail preview card!
    let msg = `${productUrl}\n\n`;
    msg += `Halo Bedcover Susah Bangun! ✨👑\n\n`;
    msg += `Saya tertarik dengan koleksi bedcover:\n`;
    msg += `*${name}*\n`;
    if (category) msg += `• Kategori: ${category}\n`;
    if (size) msg += `• Ukuran: ${size}\n`;
    if (height) msg += `• Tinggi: ${height}\n`;
    if (price) msg += `• Harga: ${formatRupiah(price)}\n`;
    msg += `\nApakah produk dengan ukuran & tinggi di atas masih ready stock? Terima kasih! 🛌✨`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }

  // ==========================================
  // SHOPPING CART (KERANJANG BELANJA) ENGINE
  // ==========================================

  function addItemToCart(item) {
    // Generate a unique key per item variant (productId + size + height)
    const cartItemId = `${item.productId}_${item.size}_${item.height}`;
    const existingIndex = cart.findIndex(c => c.id === cartItemId);

    if (existingIndex > -1) {
      cart[existingIndex].qty += (item.qty || 1);
    } else {
      cart.push({
        id: cartItemId,
        productId: item.productId,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        size: item.size,
        height: item.height,
        qty: item.qty || 1,
        selected: true
      });
    }

    saveStoredCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function removeCartItem(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    saveStoredCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function updateCartItemQty(itemId, delta) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;

    item.qty = Math.max(1, (item.qty || 1) + delta);
    saveStoredCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function toggleCartItemSelect(itemId, isSelected) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;

    item.selected = isSelected;
    saveStoredCart(cart);
    renderCartDrawer();
  }

  function toggleSelectAll(isSelected) {
    cart.forEach(item => { item.selected = isSelected; });
    saveStoredCart(cart);
    renderCartDrawer();
  }

  function clearSelectedCartItems() {
    const selectedCount = cart.filter(c => c.selected).length;
    if (selectedCount === 0) return;
    if (!confirm(`Hapus ${selectedCount} produk terpilih dari keranjang?`)) return;

    cart = cart.filter(c => !c.selected);
    saveStoredCart(cart);
    updateCartBadge();
    renderCartDrawer();
    showToast('Produk terpilih dihapus dari keranjang.');
  }

  function renderCartDrawer() {
    if (!cartDrawerBody) return;

    if (cart.length === 0) {
      cartDrawerBody.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <p>Keranjang belanja Anda masih kosong.</p>
          <button type="button" class="btn btn-luxury-primary" id="btnCartExplore" style="margin-top: 15px;">Jelajahi Koleksi</button>
        </div>
      `;
      if (cartToolbar) cartToolbar.style.display = 'none';
      if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';

      const exploreBtn = document.getElementById('btnCartExplore');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          closeCartDrawer();
          switchView('products', 'all', true);
        });
      }
      return;
    }

    if (cartToolbar) cartToolbar.style.display = 'flex';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'flex';

    const allSelected = cart.every(c => c.selected);
    const selectedItems = cart.filter(c => c.selected);
    const selectedCount = selectedItems.length;

    if (cartSelectAllCheckbox) cartSelectAllCheckbox.checked = allSelected;
    if (cartSelectedCountText) cartSelectedCountText.textContent = `${selectedCount}/${cart.length}`;

    // Calculate total price of selected items
    const totalAmount = selectedItems.reduce((sum, item) => sum + (Number(item.price || 0) * (item.qty || 1)), 0);
    if (cartTotalPrice) cartTotalPrice.textContent = formatRupiah(totalAmount);

    if (cartWhatsAppLabel) {
      cartWhatsAppLabel.textContent = selectedCount > 0 
        ? `Tanya Admin via WhatsApp (${selectedCount} Produk Dipilih)` 
        : 'Pilih Produk Terlebih Dahulu';
    }

    if (btnCartWhatsApp) {
      if (selectedCount > 0) {
        btnCartWhatsApp.style.opacity = '1';
        btnCartWhatsApp.style.pointerEvents = 'auto';
      } else {
        btnCartWhatsApp.style.opacity = '0.5';
        btnCartWhatsApp.style.pointerEvents = 'none';
      }
    }

    cartDrawerBody.innerHTML = cart.map(item => `
      <div class="cart-item-row" data-id="${escapeHtml(item.id)}">
        <input type="checkbox" class="cart-item-checkbox" data-id="${escapeHtml(item.id)}" ${item.selected ? 'checked' : ''} aria-label="Pilih ${escapeHtml(item.name)}">
        
        <img src="${escapeHtml(formatImageUrl(item.image))}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" referrerpolicy="no-referrer">

        <div class="cart-item-info">
          <div class="cart-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
          <div class="cart-item-meta">
            Ukuran: <strong>${escapeHtml(item.size)}</strong> | T: <strong>${escapeHtml(item.height)}</strong>
          </div>
          <div class="cart-item-price">${formatRupiah(item.price)}</div>
        </div>

        <div class="cart-item-controls">
          <button type="button" class="btn-cart-remove" data-id="${escapeHtml(item.id)}" title="Hapus Produk">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>

          <div class="cart-qty-box">
            <button type="button" class="btn-qty btn-qty-minus" data-id="${escapeHtml(item.id)}" aria-label="Kurang">-</button>
            <span class="cart-qty-value">${item.qty || 1}</span>
            <button type="button" class="btn-qty btn-qty-plus" data-id="${escapeHtml(item.id)}" aria-label="Tambah">+</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Event Listeners inside Cart
    cartDrawerBody.querySelectorAll('.cart-item-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        toggleCartItemSelect(chk.getAttribute('data-id'), e.target.checked);
      });
    });

    cartDrawerBody.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        updateCartItemQty(btn.getAttribute('data-id'), -1);
      });
    });

    cartDrawerBody.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        updateCartItemQty(btn.getAttribute('data-id'), 1);
      });
    });

    cartDrawerBody.querySelectorAll('.btn-cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeCartItem(btn.getAttribute('data-id'));
      });
    });
  }

  function openCartDrawer() {
    renderCartDrawer();
    cartDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Cart Drawer Triggers
  if (btnHeaderCart) btnHeaderCart.addEventListener('click', openCartDrawer);
  if (btnFloatingCart) btnFloatingCart.addEventListener('click', openCartDrawer);
  if (btnCloseCartDrawer) btnCloseCartDrawer.addEventListener('click', closeCartDrawer);

  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) closeCartDrawer();
    });
  }

  if (cartSelectAllCheckbox) {
    cartSelectAllCheckbox.addEventListener('change', (e) => {
      toggleSelectAll(e.target.checked);
    });
  }

  if (btnClearSelectedCart) {
    btnClearSelectedCart.addEventListener('click', clearSelectedCartItems);
  }

  // Bulk Checkout via WhatsApp
  if (btnCartWhatsApp) {
    btnCartWhatsApp.addEventListener('click', () => {
      const selectedItems = cart.filter(c => c.selected);
      if (selectedItems.length === 0) {
        showToast('Pilih setidaknya 1 produk di keranjang!');
        return;
      }

      const cleanPhone = sanitizeWaPhone(waNumber);
      const catalogUrl = `${window.location.origin}${window.location.pathname}`;

      // Line 1: Catalog root link for WhatsApp rich unfurling
      let msg = `${catalogUrl}\n\n`;
      msg += `Halo Admin Bedcover Susah Bangun! ✨👑\n\n`;
      msg += `Saya tertarik untuk menanyakan ketersediaan beberapa produk dari keranjang belanja saya:\n\n`;

      let totalEst = 0;
      let totalQty = 0;

      selectedItems.forEach((item, index) => {
        const itemUrl = `${catalogUrl}?product=${encodeURIComponent(item.productId)}`;
        const subtotal = Number(item.price || 0) * (item.qty || 1);
        totalEst += subtotal;
        totalQty += (item.qty || 1);

        msg += `${index + 1}. *${item.name}*\n`;
        msg += `   • Link: ${itemUrl}\n`;
        msg += `   • Ukuran: ${item.size} | Tinggi: ${item.height}\n`;
        msg += `   • Jumlah: ${item.qty} pcs (${formatRupiah(item.price)}/pcs)\n`;
        msg += `   • Subtotal: ${formatRupiah(subtotal)}\n\n`;
      });

      msg += `*Total Produk Dipilih*: ${selectedItems.length} tipe (${totalQty} pcs)\n`;
      msg += `*Estimasi Total*: ${formatRupiah(totalEst)}\n\n`;
      msg += `Apakah produk-produk di atas masih ready stock? Mohon informasinya ya min. Terima kasih! 🛌✨`;

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    });
  }

  // ==========================================
  // HERO CAROUSEL AUTOPLAY
  // ==========================================
  if (heroCarousel && carouselTrack) {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const dots = carouselDots ? carouselDots.querySelectorAll('.dot') : [];
    let currentSlide = 0;
    let carouselTimer = null;

    function goToSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      currentSlide = (index + slides.length) % slides.length;
      if (slides[currentSlide]) slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function startAutoPlay() {
      stopAutoPlay();
      if (slides.length > 1) {
        carouselTimer = setInterval(nextSlide, 6500);
      }
    }

    function stopAutoPlay() {
      if (carouselTimer) clearInterval(carouselTimer);
    }

    if (carouselNextBtn) {
      carouselNextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
    }
    if (carouselPrevBtn) {
      carouselPrevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => { goToSlide(idx); startAutoPlay(); });
    });

    heroCarousel.addEventListener('mouseenter', stopAutoPlay);
    heroCarousel.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

  // ==========================================
  // SEARCH FUNCTIONALITY
  // ==========================================
  if (btnToggleSearch) {
    btnToggleSearch.addEventListener('click', () => {
      const isVisible = searchSection.style.display !== 'none';
      searchSection.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && mainSearchInput) {
        mainSearchInput.focus();
      }
    });
  }

  if (mainSearchInput) {
    mainSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (btnClearSearch) {
        btnClearSearch.style.display = searchQuery ? 'block' : 'none';
      }
      if (currentView !== 'products') {
        switchView('products', 'all', false);
      }
      filterAndRenderProducts();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      mainSearchInput.value = '';
      searchQuery = '';
      btnClearSearch.style.display = 'none';
      filterAndRenderProducts();
    });
  }

  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const q = tag.getAttribute('data-search');
      mainSearchInput.value = q;
      searchQuery = q.toLowerCase();
      if (btnClearSearch) btnClearSearch.style.display = 'block';
      switchView('products', 'all', true);
      filterAndRenderProducts();
    });
  });

  // ==========================================
  // WISHLIST FILTER
  // ==========================================
  if (btnHeaderWishlist) {
    btnHeaderWishlist.addEventListener('click', () => {
      wishlistOnly = !wishlistOnly;
      if (wishlistOnly) {
        switchView('products', 'all', true);
        catalogHeading.textContent = '❤️ Favorit Saya';
        if (activeCategoryBanner) activeCategoryBanner.style.display = 'none';
        showToast(`Menampilkan ${wishlist.length} produk favorit Anda.`);
      } else {
        switchView('categories', null, true);
      }
      filterAndRenderProducts();
    });
  }

  // ==========================================
  // DEEP LINKING (URL PARAMETER / HASH CHECK)
  // ==========================================
  function checkInitialDeepLink() {
    // 1. Check ?product=ID or ?id=ID
    const urlParams = new URLSearchParams(window.location.search);
    const prodParam = urlParams.get('product') || urlParams.get('id');

    // 2. Fallback to #ID
    const hashParam = window.location.hash.replace('#', '').trim();
    const targetId = prodParam || (hashParam && !['kategori', 'katalog', 'layanan'].includes(hashParam) ? hashParam : null);

    if (targetId) {
      const matched = products.find(p => p.id === targetId);
      if (matched) {
        switchView('products', matched.category || 'all', false);
        setTimeout(() => {
          openProductModal(matched.id);
        }, 300);
      }
    }
  }

  // ==========================================
  // DARK / LIGHT THEME ENGINE (DEVICE & MANUAL)
  // ==========================================
  const THEME_STORAGE_KEY = 'bedcover_theme';
  const btnThemeToggle = document.getElementById('btnThemeToggle');

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    if (save) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (e) {}
    }
  }

  // Initialize theme from storage or system device mode
  const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || getSystemTheme();
  applyTheme(initialTheme, false);

  // Listen for device theme change (if not overridden by user)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark', false);
      }
    });
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme, true);
      showToast(newTheme === 'light' ? 'Mode Terang (Light Mode) aktif ☀️' : 'Mode Gelap (Dark Mode) aktif 🌙');
    });
  }

  // ==========================================
  // INITIAL BOOTSTRAP
  // ==========================================
  updateWishlistBadge();
  updateCartBadge();
  switchView('categories', null, false);
  checkInitialDeepLink();
});
