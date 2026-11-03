/**
 * Bedcover Susah Bangun - Frontend Catalog JavaScript
 * Luxury E-Catalog with Category-First Flow, Interactive Size Selection, WhatsApp Auto-Chat, and Wishlist
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const catalogData = window.CATALOG_DATA || { products: [], categories: [], settings: {}, waNumber: '' };
  let products = catalogData.products || [];
  let categories = catalogData.categories || [];
  const waNumber = catalogData.waNumber || '6281234567890';

  let currentView = 'categories'; // 'categories' | 'products'
  let activeCategory = 'all';
  let searchQuery = '';
  let wishlistOnly = false;

  let activeModalProductId = null;
  let selectedModalSize = null;

  // LocalStorage Wishlist Key
  const WISHLIST_STORAGE_KEY = 'bedcover_susah_bangun_wishlist';
  let wishlist = getStoredWishlist();

  // View Containers
  const viewCategories = document.getElementById('viewCategories');
  const viewProducts = document.getElementById('viewProducts');
  const btnBackToCategories = document.getElementById('btnBackToCategories');
  const btnEmptyBackCat = document.getElementById('btnEmptyBackCat');
  const navBtnCategories = document.getElementById('navBtnCategories');
  const navBtnProducts = document.getElementById('navBtnProducts');

  // Product View Elements
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const catalogHeading = document.getElementById('catalogHeading');
  const catalogCountPill = document.getElementById('catalogCountPill');
  const categoryPillsScroll = document.getElementById('categoryPillsScroll');
  const activeCategoryBanner = document.getElementById('activeCategoryBanner');
  const selectedCategoryName = document.getElementById('selectedCategoryName');
  const btnResetCategory = document.getElementById('btnResetCategory');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const categoriesGrid = document.getElementById('categoriesGrid');

  // Search Elements
  const searchSection = document.getElementById('searchSection');
  const btnToggleSearch = document.getElementById('btnToggleSearch');
  const mainSearchInput = document.getElementById('mainSearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');

  // Wishlist Header
  const btnHeaderWishlist = document.getElementById('btnHeaderWishlist');
  const wishlistCount = document.getElementById('wishlistCount');

  // Modal Detail
  const productDetailModal = document.getElementById('productDetailModal');
  const modalDetailContent = document.getElementById('modalDetailContent');
  const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');

  // Hero Carousel
  const heroCarousel = document.getElementById('heroCarousel');
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrevBtn = document.getElementById('carouselPrevBtn');
  const carouselNextBtn = document.getElementById('carouselNextBtn');
  const carouselDots = document.getElementById('carouselDots');

  // ==========================================
  // HELPERS
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

  // ==========================================
  // VIEW SWITCHING ARCHITECTURE
  // (Categories List View <-> Products in Category View)
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
      // Show Products inside Category view
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

      updateCategoryPills();
      filterAndRenderProducts();

      if (scroll && viewProducts) {
        viewProducts.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Back button in product view returns to categories
  if (btnBackToCategories) {
    btnBackToCategories.addEventListener('click', () => {
      switchView('categories', null, true);
    });
  }

  if (btnEmptyBackCat) {
    btnEmptyBackCat.addEventListener('click', () => {
      switchView('categories', null, true);
    });
  }

  // Nav buttons
  if (navBtnCategories) {
    navBtnCategories.addEventListener('click', () => {
      switchView('categories', null, true);
    });
  }

  if (navBtnProducts) {
    navBtnProducts.addEventListener('click', () => {
      switchView('products', 'all', true);
    });
  }

  // Banner explore button
  document.querySelectorAll('.btn-banner-explore').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('categories', null, true);
    });
  });

  // Category card click: switches to products of that category
  if (categoriesGrid) {
    categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catName = card.getAttribute('data-category');
        switchView('products', catName, true);
      });
      // Accessibility
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const catName = card.getAttribute('data-category');
          switchView('products', catName, true);
        }
      });
    });
  }

  // Footer category links
  document.querySelectorAll('.footer-cat-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-category');
      switchView('products', cat, true);
    });
  });

  // ==========================================
  // CATEGORY PILLS (Inside Product View)
  // ==========================================

  function updateCategoryPills() {
    if (categoryPillsScroll) {
      categoryPillsScroll.querySelectorAll('.cat-pill').forEach(pill => {
        const pCat = pill.getAttribute('data-category');
        if (pCat === activeCategory) {
          pill.classList.add('active');
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
          pill.classList.remove('active');
        }
      });
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

  if (categoryPillsScroll) {
    categoryPillsScroll.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category');
        activeCategory = cat;
        wishlistOnly = false;
        updateCategoryPills();
        filterAndRenderProducts();
      });
    });
  }

  if (btnResetCategory) {
    btnResetCategory.addEventListener('click', () => {
      activeCategory = 'all';
      updateCategoryPills();
      filterAndRenderProducts();
    });
  }

  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      activeCategory = 'all';
      if (mainSearchInput) mainSearchInput.value = '';
      searchQuery = '';
      wishlistOnly = false;
      updateCategoryPills();
      filterAndRenderProducts();
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
      // When searching, auto-switch to products view to see live results
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
  // PRODUCT FILTER & RENDER
  // (Card displays available sizes badges)
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

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(p => {
        const nameM = (p.name || '').toLowerCase().includes(searchQuery);
        const descM = (p.short_desc || '').toLowerCase().includes(searchQuery);
        const fullM = (p.full_desc || '').toLowerCase().includes(searchQuery);
        const catM = (p.category || '').toLowerCase().includes(searchQuery);
        const sizesStr = Array.isArray(p.sizes) ? p.sizes.join(' ').toLowerCase() : '';
        const sizeM = sizesStr.includes(searchQuery);
        return nameM || descM || fullM || catM || sizeM;
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

      const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['Single', 'Queen', 'King', 'Super King'];

      return `
        <div class="product-card" data-id="${escapeHtml(p.id)}">
          <div class="product-media-wrap">
            <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(p.name)}" class="product-img" loading="lazy" referrerpolicy="no-referrer">
            
            <!-- Status Badge -->
            <span class="badge-status ${statusBadgeClass}">${escapeHtml(p.status || 'Ready Stock')}</span>

            <!-- Video Indicator -->
            ${hasVideo ? `
              <span class="badge-video">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span>Video</span>
              </span>
            ` : ''}

            <!-- Love / Wishlist Heart -->
            <button type="button" class="btn-wishlist-toggle ${isLoved ? 'active' : ''}" data-id="${escapeHtml(p.id)}" title="Simpan ke Favorit" aria-label="Favorit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLoved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <!-- Multiple images dots -->
            ${images.length > 1 ? `
              <div class="img-dots-indicator">
                ${images.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}
              </div>
            ` : ''}
          </div>

          <div class="product-body">
            <span class="product-category-tag">${escapeHtml(p.category || 'Luxury Bedding')}</span>
            <h3 class="product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
            <p class="product-desc">${escapeHtml(p.short_desc || p.full_desc || '')}</p>

            <!-- Available Sizes Badges (Span) -->
            <div class="product-card-sizes">
              <span class="card-size-label">Ukuran:</span>
              <div class="card-size-pills-list">
                ${sizes.map(s => `<span class="card-size-pill">${escapeHtml(s)}</span>`).join('')}
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
  // MODAL DETAIL PRODUCT & SIZE-LOCKED WA AUTO-CHAT
  // ==========================================
  function openProductModal(productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;

    activeModalProductId = productId;
    selectedModalSize = null; // Reset selection: user MUST pick a size before chat!

    const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000'];
    const coverImg = formatImageUrl(images[0]);
    const isLoved = wishlist.includes(p.id);
    const hasVideo = !!p.video;
    const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['Single (120x200)', 'Queen (160x200)', 'King (180x200)', 'Super King (200x200)'];

    modalDetailContent.innerHTML = `
      <div class="modal-detail-grid">
        <!-- Media Column -->
        <div class="modal-media-col">
          <div class="modal-main-image-wrap">
            <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(p.name)}" class="modal-main-img" id="modalMainImg" referrerpolicy="no-referrer">
          </div>

          <!-- Thumbnails -->
          ${images.length > 1 ? `
            <div class="modal-thumbnails-row">
              ${images.map((img, i) => `
                <div class="modal-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                  <img src="${escapeHtml(formatImageUrl(img))}" alt="Thumbnail ${i+1}" referrerpolicy="no-referrer">
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Video Player if exists -->
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

          <!-- INTERACTIVE SIZE SELECTION (REQUIRED BEFORE CHAT WA) -->
          <div class="modal-size-select-section" id="modalSizeSection">
            <div class="modal-size-header">
              <span class="modal-size-title">Pilih Ukuran Kasur</span>
              <span class="size-required-badge">Wajib Pilih Ukuran</span>
            </div>
            <p class="size-select-helper">Pilih salah satu ukuran di bawah ini untuk membuka chat konsultasi WhatsApp:</p>

            <div class="modal-size-pills-wrap" id="modalSizePillsWrap">
              ${sizes.map(s => `
                <button type="button" class="modal-size-pill" data-size="${escapeHtml(s)}">
                  <span class="pill-check-icon">✓</span>
                  <span class="pill-name">${escapeHtml(s)}</span>
                </button>
              `).join('')}
            </div>

            <div class="size-alert-hint" id="sizeAlertHint" style="display: none;">
              ⚠️ Silakan pilih salah satu ukuran bedcover di atas terlebih dahulu.
            </div>
          </div>

          <!-- MODAL ACTIONS (WHATSAPP AUTO CHAT) -->
          <div class="modal-actions">
            <!-- Locked WhatsApp Button until size is picked -->
            <div class="whatsapp-btn-wrapper">
              <a href="javascript:void(0)" class="btn-whatsapp-chat locked" id="btnModalWhatsApp" data-locked="true" rel="noopener">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <span id="waBtnLabel">Pilih Ukuran Dulu Untuk Chat WA</span>
              </a>
            </div>

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

    // Attach Thumbnail Clicks
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

    // Attach Size Pills Click Logic
    const sizeSection = document.getElementById('modalSizeSection');
    const sizeAlertHint = document.getElementById('sizeAlertHint');
    const btnModalWhatsApp = document.getElementById('btnModalWhatsApp');
    const waBtnLabel = document.getElementById('waBtnLabel');
    const sizePillBtns = modalDetailContent.querySelectorAll('.modal-size-pill');

    sizePillBtns.forEach(pill => {
      pill.addEventListener('click', () => {
        const sizeVal = pill.getAttribute('data-size');
        selectedModalSize = sizeVal;

        // Toggle active visual
        sizePillBtns.forEach(b => b.classList.remove('active'));
        pill.classList.add('active');

        // Hide warning alert if shown
        if (sizeAlertHint) sizeAlertHint.style.display = 'none';
        if (sizeSection) sizeSection.classList.remove('shake-warning');

        // Unlock WhatsApp Button
        btnModalWhatsApp.classList.remove('locked');
        btnModalWhatsApp.classList.add('unlocked');
        btnModalWhatsApp.setAttribute('data-locked', 'false');

        // Update Label
        if (waBtnLabel) {
          waBtnLabel.textContent = `Tanya Ready via WA (Ukuran: ${sizeVal})`;
        }

        // Generate WA Auto-Chat URL with selected size
        const productUrl = `${window.location.origin}${window.location.pathname}#${p.id}`;
        const waLink = buildWhatsAppLink(waNumber, p.name, p.price, coverImg, productUrl, sizeVal);
        btnModalWhatsApp.href = waLink;
        btnModalWhatsApp.target = '_blank';
      });
    });

    // Guard WhatsApp Click: If size NOT selected, reject and alert!
    btnModalWhatsApp.addEventListener('click', (e) => {
      if (btnModalWhatsApp.getAttribute('data-locked') === 'true' || !selectedModalSize) {
        e.preventDefault();
        e.stopPropagation();

        if (sizeAlertHint) sizeAlertHint.style.display = 'block';

        // Shake animation on size pills
        if (sizeSection) {
          sizeSection.classList.remove('shake-warning');
          void sizeSection.offsetWidth; // Trigger reflow
          sizeSection.classList.add('shake-warning');
        }

        showToast('⚠️ Silakan pilih ukuran kasur terlebih dahulu!');
        return false;
      }
    });

    // Attach Modal Love Button
    const btnModalLove = document.getElementById('btnModalLove');
    if (btnModalLove) {
      btnModalLove.addEventListener('click', () => {
        toggleWishlist(p.id, null);
        const nowLoved = wishlist.includes(p.id);
        btnModalLove.classList.toggle('active', nowLoved);
        btnModalLove.querySelector('span').textContent = nowLoved ? 'Tersimpan di Favorit' : 'Simpan ke Favorit';
        btnModalLove.querySelector('svg').setAttribute('fill', nowLoved ? 'currentColor' : 'none');

        // Sync card heart
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
  }

  if (btnCloseDetailModal) {
    btnCloseDetailModal.addEventListener('click', closeProductModal);
  }

  if (productDetailModal) {
    productDetailModal.addEventListener('click', (e) => {
      if (e.target === productDetailModal) {
        closeProductModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productDetailModal.classList.contains('active')) {
      closeProductModal();
    }
  });

  function buildWhatsAppLink(phone, productName, price, imageUrl, productUrl, selectedSize) {
    let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    let msg = `Halo Bedcover Susah Bangun! ✨👑\n\n`;
    msg += `Saya tertarik dengan koleksi bedcover:\n`;
    msg += `*${productName}*\n`;
    if (selectedSize) {
      msg += `Ukuran Yang Dipilih: *${selectedSize}*\n`;
    }
    if (price) {
      msg += `Harga: ${formatRupiah(price)}\n`;
    }
    if (imageUrl) {
      msg += `Foto Produk: ${imageUrl}\n`;
    }
    if (productUrl) {
      msg += `Link Katalog: ${productUrl}\n`;
    }
    msg += `\nApakah produk dengan ukuran tersebut masih ready stock? Mohon info detail spesifikasi & cara pemesanannya. Terima kasih! 🛌✨`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }

  // ==========================================
  // HASH URL NAVIGATION (DIRECT LINK TO PRODUCT)
  // ==========================================
  function checkUrlHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && hash !== 'kategori' && hash !== 'katalog' && hash !== 'layanan') {
      const match = products.find(p => p.id === hash);
      if (match) {
        switchView('products', match.category || 'all', false);
        setTimeout(() => {
          openProductModal(match.id);
        }, 300);
      }
    }
  }

  // Initial Boot: start on Categories View
  updateWishlistBadge();
  switchView('categories', null, false);
  checkUrlHash();
});
