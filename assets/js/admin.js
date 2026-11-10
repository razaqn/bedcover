/**
 * Bedcover Susah Bangun - Admin Dashboard JavaScript
 * Handles Product CRUD with Video & Copy Product, Category Manager with Covers, Promo Banners, Logo & Contacts
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let products = window.INITIAL_PRODUCTS || [];
  let categories = window.INITIAL_CATEGORIES || [];
  let banners = window.INITIAL_BANNERS || [];
  let settings = window.INITIAL_SETTINGS || {};

  let formImages = [];
  let editingProductId = null;
  let editingBannerId = null;

  // Helper for authenticated API fetch (passes Authorization header + credentials)
  async function authFetch(url, options = {}) {
    const opts = { ...options };
    opts.credentials = opts.credentials || 'same-origin';
    const headers = new Headers(opts.headers || {});
    if (window.ADMIN_TOKEN && !headers.has('Authorization')) {
      headers.set('Authorization', 'Bearer ' + window.ADMIN_TOKEN);
    }
    opts.headers = headers;
    const response = await window.fetch(url, opts);
    if (response.status === 401) {
      showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
    }
    return response;
  }

  // DOM Elements - Tabs
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  // DOM Elements - Products
  const productTableBody = document.getElementById('productTableBody');
  const adminTableSearch = document.getElementById('adminTableSearch');
  const adminCategoryFilter = document.getElementById('adminCategoryFilter');

  // Stats
  const statTotal = document.getElementById('statTotal');
  const statCategories = document.getElementById('statCategories');
  const statReady = document.getElementById('statReady');
  const statPo = document.getElementById('statPo');

  // Modals - Product
  const productFormModal = document.getElementById('productFormModal');
  const modalFormTitle = document.getElementById('modalFormTitle');
  const productForm = document.getElementById('productForm');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnCloseFormModal = document.getElementById('btnCloseFormModal');
  const btnCancelForm = document.getElementById('btnCancelForm');
  const btnSaveProduct = document.getElementById('btnSaveProduct');

  // Form Inputs - Product
  const formProductId = document.getElementById('formProductId');
  const formName = document.getElementById('formName');
  const formCategory = document.getElementById('formCategory');
  const formPrice = document.getElementById('formPrice');
  const formStatus = document.getElementById('formStatus');
  const formShortDesc = document.getElementById('formShortDesc');
  const formFullDesc = document.getElementById('formFullDesc');
  const inputCustomWidth = document.getElementById('inputCustomWidth');
  const inputCustomLength = document.getElementById('inputCustomLength');
  const inputCustomHeight = document.getElementById('inputCustomHeight');
  const btnAddCustomSize = document.getElementById('btnAddCustomSize');
  const customSizesListContainer = document.getElementById('customSizesListContainer');
  let customSizes = [];

  // Cropper DOM Elements
  const cropperModal = document.getElementById('cropperModal');
  const btnCloseCropperModal = document.getElementById('btnCloseCropperModal');
  const btnCancelCropper = document.getElementById('btnCancelCropper');
  const btnApplyCropper = document.getElementById('btnApplyCropper');
  const cropperImageElement = document.getElementById('cropperImageElement');
  const btnCropperRotateLeft = document.getElementById('btnCropperRotateLeft');
  const btnCropperRotateRight = document.getElementById('btnCropperRotateRight');
  const btnCropperReset = document.getElementById('btnCropperReset');

  const formVideoUrl = document.getElementById('formVideoUrl');
  const videoFileInput = document.getElementById('videoFileInput');
  const btnUploadVideo = document.getElementById('btnUploadVideo');
  const videoPreviewWrapper = document.getElementById('videoPreviewWrapper');
  const formVideoPlayer = document.getElementById('formVideoPlayer');
  const btnRemoveVideo = document.getElementById('btnRemoveVideo');

  // Images in Product Form
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileInput');
  const previewImagesContainer = document.getElementById('previewImagesContainer');

  let cropper = null;
  let activeCroppingIndex = null;
  let draggedImageIndex = null;

  // DOM Elements - Categories
  const categoryItemsList = document.getElementById('categoryItemsList');
  const addCategoryForm = document.getElementById('addCategoryForm');
  const newCategoryName = document.getElementById('newCategoryName');
  const newCategoryDesc = document.getElementById('newCategoryDesc');
  const btnUploadCategoryCover = document.getElementById('btnUploadCategoryCover');
  const categoryFileInput = document.getElementById('categoryFileInput');
  const newCategoryImage = document.getElementById('newCategoryImage');
  const categoryCoverPreviewWrap = document.getElementById('categoryCoverPreviewWrap');
  const categoryCoverPreview = document.getElementById('categoryCoverPreview');

  // DOM Elements - Banners
  const bannersGrid = document.getElementById('bannersGrid');
  const btnOpenAddBannerModal = document.getElementById('btnOpenAddBannerModal');
  const bannerModal = document.getElementById('bannerModal');
  const bannerModalTitle = document.getElementById('bannerModalTitle');
  const bannerForm = document.getElementById('bannerForm');
  const btnCloseBannerModal = document.getElementById('btnCloseBannerModal');
  const btnCancelBannerModal = document.getElementById('btnCancelBannerModal');
  const formBannerId = document.getElementById('formBannerId');
  const formBannerTitle = document.getElementById('formBannerTitle');
  const formBannerSubtitle = document.getElementById('formBannerSubtitle');
  const formBannerBtnText = document.getElementById('formBannerBtnText');
  const formBannerLink = document.getElementById('formBannerLink');
  const formBannerImage = document.getElementById('formBannerImage');
  const formBannerActive = document.getElementById('formBannerActive');
  const bannerFileInput = document.getElementById('bannerFileInput');
  const btnUploadBannerImg = document.getElementById('btnUploadBannerImg');
  const bannerImgPreviewWrapper = document.getElementById('bannerImgPreviewWrapper');
  const bannerImgPreview = document.getElementById('bannerImgPreview');

  // DOM Elements - Settings (Contact & Logo)
  const generalSettingsForm = document.getElementById('generalSettingsForm');
  const logoFileInput = document.getElementById('logoFileInput');
  const btnUploadLogo = document.getElementById('btnUploadLogo');
  const btnResetLogo = document.getElementById('btnResetLogo');
  const settingsLogoPreview = document.getElementById('settingsLogoPreview');
  const adminNavbarLogo = document.getElementById('adminNavbarLogo');
  const formLogoUrl = document.getElementById('formLogoUrl');

  // Guide Modal & Test Connection
  const guideModal = document.getElementById('guideModal');
  const btnOpenGuide = document.getElementById('btnOpenGuide');
  const btnCloseGuideModal = document.getElementById('btnCloseGuideModal');
  const btnCloseGuideModalBtn = document.getElementById('btnCloseGuideModalBtn');
  const btnTestConnection = document.getElementById('btnTestConnection');
  const adminToast = document.getElementById('adminToast');
  const toastMessage = document.getElementById('toastMessage');

  // ==========================================
  // HELPERS
  // ==========================================
  function showToast(message, type = 'success') {
    if (!adminToast || !toastMessage) return;
    toastMessage.textContent = message;
    adminToast.className = `admin-toast show ${type}`;
    setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3500);
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
    if (!url) return '';
    const trimmed = String(url).trim();
    if (trimmed.includes('api/image.php')) return trimmed;
    const driveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return '../api/image.php?id=' + driveMatch[1];
    }
    return trimmed;
  }

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // ==========================================
  // STATS & CATEGORY DROPDOWN UPDATES
  // ==========================================
  function updateStats() {
    if (statTotal) statTotal.textContent = products.length;
    if (statCategories) statCategories.textContent = categories.length;
    if (statReady) {
      statReady.textContent = products.filter(p => (p.status || '') === 'Ready Stock').length;
    }
    if (statPo) {
      statPo.textContent = products.filter(p => String(p.status || '').toLowerCase().includes('pre-order')).length;
    }
  }

  function updateCategoryDropdowns() {
    const catNames = categories.map(c => is_array_obj(c) ? c.name : String(c));

    // Admin filter dropdown
    if (adminCategoryFilter) {
      const currentVal = adminCategoryFilter.value;
      adminCategoryFilter.innerHTML = '<option value="all">Semua Kategori</option>' + 
        catNames.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      adminCategoryFilter.value = currentVal;
    }

    // Form modal category dropdown
    if (formCategory) {
      const currentFormVal = formCategory.value;
      formCategory.innerHTML = catNames.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      if (currentFormVal && catNames.includes(currentFormVal)) {
        formCategory.value = currentFormVal;
      }
    }
  }

  function is_array_obj(item) {
    return typeof item === 'object' && item !== null && 'name' in item;
  }

  // ==========================================
  // PRODUCT TABLE RENDERING
  // ==========================================
  function renderTable() {
    if (!productTableBody) return;

    let filtered = [...products];
    const query = (adminTableSearch ? adminTableSearch.value : '').trim().toLowerCase();
    const cat = adminCategoryFilter ? adminCategoryFilter.value : 'all';

    if (cat !== 'all') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
    }

    if (query) {
      filtered = filtered.filter(p => {
        const nameM = (p.name || '').toLowerCase().includes(query);
        const descM = (p.short_desc || '').toLowerCase().includes(query);
        const fullM = (p.full_desc || '').toLowerCase().includes(query);
        const catM = (p.category || '').toLowerCase().includes(query);
        const idM = (p.id || '').toLowerCase().includes(query);
        return nameM || descM || fullM || catM || idM;
      });
    }

    if (filtered.length === 0) {
      productTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #94A3B8;">
            Tidak ada koleksi bedcover yang sesuai dengan pencarian atau filter.
          </td>
        </tr>
      `;
      return;
    }

    productTableBody.innerHTML = filtered.map(p => {
      const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400'];
      const thumb = formatImageUrl(images[0]);
      const isPO = String(p.status || '').toLowerCase().includes('pre-order');
      const hasVideo = !!p.video;

      return `
        <tr>
          <td>
            <div class="product-row-meta">
              <img src="${escapeHtml(thumb)}" alt="${escapeHtml(p.name)}" class="table-thumb" referrerpolicy="no-referrer">
              <div>
                <div class="product-title-txt">${escapeHtml(p.name)}</div>
                <div class="product-id-txt">${escapeHtml(p.id)}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="admin-badge">${escapeHtml(p.category || 'Luxury Bedding')}</span>
          </td>
          <td>
            <span class="price-txt">${formatRupiah(p.price)}</span>
          </td>
          <td>
            <span class="badge-status ${isPO ? 'po' : 'ready'}" style="position: static; font-size: 0.75rem;">
              ${escapeHtml(p.status || 'Ready Stock')}
            </span>
            <div class="size-badges-list">
              ${(Array.isArray(p.sizes) ? p.sizes : []).map(s => `<span class="size-badge-pill">${escapeHtml(s)}</span>`).join('')}
              ${(Array.isArray(p.heights) ? p.heights : []).map(h => `<span class="size-badge-pill" style="border-color: rgba(255,255,255,0.2); color: #cbd5e1;">T: ${escapeHtml(h)}</span>`).join('')}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: #94A3B8; font-size: 0.8rem;">
              <div>📷 ${images.length} Foto</div>
              ${hasVideo ? '<div style="color: #D4AF37; margin-top: 2px;">🎥 Ada Video</div>' : ''}
            </div>
          </td>
          <td style="text-align: right;">
            <div class="action-btns" style="justify-content: flex-end;">
              <!-- View on Web -->
              <a href="../#${escapeHtml(p.id)}" target="_blank" class="btn-icon" title="Lihat di Web">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </a>

              <!-- Copy / Duplicate Product -->
              <button type="button" class="btn-icon copy btn-copy" data-id="${escapeHtml(p.id)}" title="Duplikat / Copy Produk">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>

              <!-- Edit Product -->
              <button type="button" class="btn-icon btn-edit" data-id="${escapeHtml(p.id)}" title="Edit Produk">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>

              <!-- Delete Product -->
              <button type="button" class="btn-icon delete btn-delete" data-id="${escapeHtml(p.id)}" data-name="${escapeHtml(p.name)}" title="Hapus Produk">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTableEvents();
  }

  function attachTableEvents() {
    // Edit
    productTableBody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Copy / Duplicate Product
    productTableBody.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        duplicateProduct(id);
      });
    });

    // Delete
    productTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        handleDeleteProduct(id, name);
      });
    });
  }

  // ==========================================
  // PRODUCT FORM MODAL LOGIC (ADD, EDIT, COPY)
  // ==========================================

  // Custom Sizes Manager
  function renderCustomSizesList() {
    if (!customSizesListContainer) return;
    if (customSizes.length === 0) {
      customSizesListContainer.innerHTML = '<span style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">Belum ada ukuran tambahan.</span>';
      return;
    }

    customSizesListContainer.innerHTML = customSizes.map((s, idx) => `
      <span class="custom-size-pill">
        <span>${escapeHtml(s)}</span>
        <button type="button" class="btn-remove-custom-size" data-index="${idx}" title="Hapus Ukuran">&times;</button>
      </span>
    `).join('');

    customSizesListContainer.querySelectorAll('.btn-remove-custom-size').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        customSizes.splice(idx, 1);
        renderCustomSizesList();
      });
    });
  }

  if (btnAddCustomSize) {
    btnAddCustomSize.addEventListener('click', () => {
      const w = inputCustomWidth ? inputCustomWidth.value.trim() : '';
      const l = inputCustomLength ? inputCustomLength.value.trim() : '';
      const h = inputCustomHeight ? inputCustomHeight.value.trim() : '';

      if (!w || !l || !h) {
        showToast('Mohon isi Lebar, Panjang, dan Tinggi dengan lengkap.', 'error');
        return;
      }

      const sizeStr = `${w} x ${l} x ${h} cm`;
      if (!customSizes.includes(sizeStr)) {
        customSizes.push(sizeStr);
        renderCustomSizesList();
      }

      if (inputCustomWidth) inputCustomWidth.value = '';
      if (inputCustomLength) inputCustomLength.value = '';
      if (inputCustomHeight) inputCustomHeight.value = '';
      if (inputCustomWidth) inputCustomWidth.focus();
    });
  }

  function setFormSizes(sizesArray = []) {
    const checkboxes = document.querySelectorAll('input[name="product_sizes[]"]');
    const standardValues = [];
    checkboxes.forEach(cb => {
      const cbVal = cb.value.toLowerCase().trim();
      standardValues.push(cbVal);
      // Match exact value or without 'cm'
      const isMatch = sizesArray.some(s => {
        const sClean = s.toLowerCase().trim();
        return sClean === cbVal || sClean.replace(/\s*cm$/, '') === cbVal.replace(/\s*cm$/, '');
      });
      cb.checked = isMatch;
    });

    customSizes = [];
    sizesArray.forEach(s => {
      const sTrim = s.trim();
      const sLower = sTrim.toLowerCase();
      const isStandard = standardValues.some(sv => sv === sLower || sv.replace(/\s*cm$/, '') === sLower.replace(/\s*cm$/, ''));
      if (!isStandard && !customSizes.includes(sTrim)) {
        customSizes.push(sTrim);
      }
    });

    renderCustomSizesList();
  }

  function getFormSizes() {
    const selected = [];
    const checkboxes = document.querySelectorAll('input[name="product_sizes[]"]:checked');
    checkboxes.forEach(cb => selected.push(cb.value));

    customSizes.forEach(c => {
      if (!selected.includes(c)) selected.push(c);
    });

    return selected.length > 0 ? selected : ['180 x 200 x 40 cm', '160 x 200 x 40 cm'];
  }

  function openAddModal() {
    editingProductId = null;
    modalFormTitle.textContent = 'Tambah Bedcover Baru';
    productForm.reset();
    formProductId.value = '';
    formImages = [];
    formVideoUrl.value = '';
    updateVideoPreview('');
    renderFormImages();
    setFormSizes(['180 x 200 x 40 cm', '160 x 200 x 40 cm', '120 x 200 x 40 cm']);
    productFormModal.classList.add('active');
  }

  function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    modalFormTitle.textContent = 'Edit Bedcover: ' + product.name;

    formProductId.value = product.id;
    formName.value = product.name || '';
    formCategory.value = product.category || (categories[0]?.name || categories[0]) || '';
    formPrice.value = product.price || 0;
    formStatus.value = product.status || 'Ready Stock';
    formShortDesc.value = product.short_desc || '';
    formFullDesc.value = product.full_desc || '';

    formVideoUrl.value = product.video || '';
    updateVideoPreview(product.video || '');

    // Reverse images so rightmost is the front cover in admin
    formImages = Array.isArray(product.images) ? [...product.images].reverse() : [];
    renderFormImages();

    const productSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['180 x 200 x 40 cm', '160 x 200 x 40 cm'];
    setFormSizes(productSizes);

    productFormModal.classList.add('active');
  }

  /**
   * DUPLICATE / COPY PRODUCT
   */
  function duplicateProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = null; // Create mode!
    modalFormTitle.textContent = '📋 Duplikat Produk: ' + product.name;

    formProductId.value = ''; // Fresh ID on submit
    formName.value = product.name + ' (Copy)';
    formCategory.value = product.category || '';
    formPrice.value = product.price || 0;
    formStatus.value = product.status || 'Ready Stock';
    formShortDesc.value = product.short_desc || '';
    formFullDesc.value = product.full_desc || '';

    formVideoUrl.value = product.video || '';
    updateVideoPreview(product.video || '');

    // Clone images reversed for admin display
    formImages = Array.isArray(product.images) ? [...product.images].reverse() : [];
    renderFormImages();

    const productSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['180 x 200 x 40 cm', '160 x 200 x 40 cm'];
    setFormSizes(productSizes);

    productFormModal.classList.add('active');
    formName.focus();
    formName.select();

    showToast('Produk diduplikat! Silakan sesuaikan nama dan foto.', 'success');
  }

  function closeFormModal() {
    productFormModal.classList.remove('active');
    editingProductId = null;
    formImages = [];
    updateVideoPreview('');
  }

  if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', openAddModal);
  if (btnCloseFormModal) btnCloseFormModal.addEventListener('click', closeFormModal);
  if (btnCancelForm) btnCancelForm.addEventListener('click', closeFormModal);

  // Upload Product Photos
  if (dropArea && fileInput) {
    dropArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const files = fileInput.files;
      if (!files || files.length === 0) return;

      showToast(`Mengunggah ${files.length} foto ke Google Drive...`, 'success');

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        try {
          const response = await authFetch('../api/upload.php', { method: 'POST', body: formData });
          const res = await response.json();
          if (res.success && res.data?.url) {
            formImages.push(res.data.url);
            renderFormImages();
          } else {
            showToast(res.message || 'Gagal mengunggah salah satu foto.', 'error');
          }
        } catch (err) {
          showToast('Kesalahan upload: ' + err.message, 'error');
        }
      }

      fileInput.value = '';
      showToast('Foto berhasil ditambahkan!', 'success');
    });
  }

  function moveImageLeft(index) {
    if (index <= 0 || index >= formImages.length) return;
    const temp = formImages[index];
    formImages[index] = formImages[index - 1];
    formImages[index - 1] = temp;
    renderFormImages();
  }

  function moveImageRight(index) {
    if (index < 0 || index >= formImages.length - 1) return;
    const temp = formImages[index];
    formImages[index] = formImages[index + 1];
    formImages[index + 1] = temp;
    renderFormImages();
  }

  function renderFormImages() {
    if (!previewImagesContainer) return;

    if (formImages.length === 0) {
      previewImagesContainer.innerHTML = '';
      return;
    }

    const lastIdx = formImages.length - 1;

    previewImagesContainer.innerHTML = formImages.map((url, idx) => {
      const isFront = (idx === lastIdx);
      return `
        <div class="preview-img-item ${isFront ? 'is-front' : ''}" data-index="${idx}" draggable="true" title="Klik foto untuk memotong (crop)">
          ${isFront 
            ? `<span class="badge-cover-front">⭐ Terdepan (Sampul)</span>` 
            : `<span class="badge-img-order">#${idx + 1}</span>`
          }
          <span class="remove-img-btn" data-action="remove-img" data-index="${idx}" title="Hapus Foto">&times;</span>
          <img src="${escapeHtml(formatImageUrl(url))}" alt="Preview ${idx+1}" referrerpolicy="no-referrer">
          <span class="crop-hint-badge">✂️ Klik untuk Crop</span>
          <div class="img-shift-bar" onclick="event.stopPropagation()">
            <button type="button" class="btn-shift-img" data-action="shift-left" data-index="${idx}" ${idx === 0 ? 'disabled' : ''} title="Geser ke Kiri">◀</button>
            <button type="button" class="btn-shift-img" data-action="shift-right" data-index="${idx}" ${idx === lastIdx ? 'disabled' : ''} title="Geser ke Kanan (Lebih Depan)">▶</button>
          </div>
        </div>
      `;
    }).join('');

    // Remove buttons
    previewImagesContainer.querySelectorAll('[data-action="remove-img"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        formImages.splice(index, 1);
        renderFormImages();
      });
    });

    // Shift left buttons
    previewImagesContainer.querySelectorAll('[data-action="shift-left"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        moveImageLeft(index);
      });
    });

    // Shift right buttons
    previewImagesContainer.querySelectorAll('[data-action="shift-right"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        moveImageRight(index);
      });
    });

    // Click item to Crop & Drag & Drop
    previewImagesContainer.querySelectorAll('.preview-img-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.remove-img-btn') || e.target.closest('.img-shift-bar')) return;
        const index = parseInt(item.getAttribute('data-index'), 10);
        openCropper(index);
      });

      item.addEventListener('dragstart', (e) => {
        draggedImageIndex = parseInt(item.getAttribute('data-index'), 10);
        e.dataTransfer.effectAllowed = 'move';
        item.style.opacity = '0.4';
      });

      item.addEventListener('dragend', () => {
        item.style.opacity = '1';
        draggedImageIndex = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(item.getAttribute('data-index'), 10);
        if (draggedImageIndex !== null && draggedImageIndex !== targetIndex) {
          const moved = formImages.splice(draggedImageIndex, 1)[0];
          formImages.splice(targetIndex, 0, moved);
          renderFormImages();
        }
      });
    });
  }

  // ==========================================
  // IMAGE CROPPER LOGIC
  // ==========================================
  function openCropper(index) {
    if (index < 0 || index >= formImages.length) return;
    activeCroppingIndex = index;
    const imgUrl = formImages[index];

    const cleanUrl = formatImageUrl(imgUrl);
    cropperImageElement.src = cleanUrl;

    if (cropperModal) cropperModal.classList.add('active');

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    const initCropper = () => {
      if (typeof Cropper !== 'undefined') {
        cropper = new Cropper(cropperImageElement, {
          aspectRatio: 1, // 1:1 default
          viewMode: 1,
          autoCropArea: 0.9,
          responsive: true,
          restore: false,
          checkCrossOrigin: false,
        });
      }
    };

    if (cropperImageElement.complete) {
      initCropper();
    } else {
      cropperImageElement.onload = () => {
        initCropper();
        cropperImageElement.onload = null;
      };
    }
  }

  function closeCropper() {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    activeCroppingIndex = null;
    if (cropperModal) cropperModal.classList.remove('active');
  }

  if (btnCloseCropperModal) btnCloseCropperModal.addEventListener('click', closeCropper);
  if (btnCancelCropper) btnCancelCropper.addEventListener('click', closeCropper);
  if (cropperModal) {
    cropperModal.addEventListener('click', (e) => {
      if (e.target === cropperModal) closeCropper();
    });
  }

  ratioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const ratio = parseFloat(btn.getAttribute('data-ratio'));
      if (cropper) {
        cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
      }
    });
  });

  if (btnCropperRotateLeft) {
    btnCropperRotateLeft.addEventListener('click', () => {
      if (cropper) cropper.rotate(-90);
    });
  }

  if (btnCropperRotateRight) {
    btnCropperRotateRight.addEventListener('click', () => {
      if (cropper) cropper.rotate(90);
    });
  }

  if (btnCropperReset) {
    btnCropperReset.addEventListener('click', () => {
      if (cropper) cropper.reset();
    });
  }

  if (btnApplyCropper) {
    btnApplyCropper.addEventListener('click', async () => {
      if (!cropper || activeCroppingIndex === null) return;

      btnApplyCropper.disabled = true;
      btnApplyCropper.textContent = 'Memproses...';

      try {
        const canvas = cropper.getCroppedCanvas({
          maxWidth: 1600,
          maxHeight: 1600,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        if (!canvas) {
          throw new Error('Gagal merender kanvas potongan gambar.');
        }

        canvas.toBlob(async (blob) => {
          if (!blob) {
            btnApplyCropper.disabled = false;
            btnApplyCropper.textContent = '✂️ Terapkan & Simpan Potongan';
            showToast('Gagal memproses potongan foto.', 'error');
            return;
          }

          const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('image', file);
          showToast('Mengunggah hasil crop...', 'success');

          try {
            const response = await authFetch('../api/upload.php', { method: 'POST', body: formData });
            const res = await response.json();
            if (res.success && res.data?.url) {
              formImages[activeCroppingIndex] = res.data.url;
              renderFormImages();
              closeCropper();
              showToast('Foto berhasil dipotong (crop) dan diperbarui! ✨', 'success');
            } else {
              showToast(res.message || 'Gagal menyimpan hasil crop.', 'error');
            }
          } catch (err) {
            showToast('Kesalahan upload crop: ' + err.message, 'error');
          } finally {
            btnApplyCropper.disabled = false;
            btnApplyCropper.textContent = '✂️ Terapkan & Simpan Potongan';
          }
        }, 'image/jpeg', 0.92);
      } catch (err) {
        btnApplyCropper.disabled = false;
        btnApplyCropper.textContent = '✂️ Terapkan & Simpan Potongan';
        showToast('Gagal memproses crop: ' + err.message, 'error');
      }
    });
  }

  // Upload Video
  if (btnUploadVideo && videoFileInput) {
    btnUploadVideo.addEventListener('click', () => videoFileInput.click());

    videoFileInput.addEventListener('change', async () => {
      const file = videoFileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('video', file);
      showToast('Mengunggah video ke Google Drive... Mohon tunggu...', 'success');

      try {
        const response = await authFetch('../api/upload.php', { method: 'POST', body: formData });
        const res = await response.json();
        if (res.success && res.data?.url) {
          formVideoUrl.value = res.data.url;
          updateVideoPreview(res.data.url);
          showToast('Video berhasil diunggah! 🎥', 'success');
        } else {
          showToast(res.message || 'Gagal mengunggah video.', 'error');
        }
      } catch (err) {
        showToast('Kesalahan upload video: ' + err.message, 'error');
      } finally {
        videoFileInput.value = '';
      }
    });
  }

  if (formVideoUrl) {
    formVideoUrl.addEventListener('input', () => {
      updateVideoPreview(formVideoUrl.value.trim());
    });
  }

  function updateVideoPreview(url) {
    if (!videoPreviewWrapper || !formVideoPlayer) return;
    if (url && url.trim() !== '') {
      formVideoPlayer.src = url;
      videoPreviewWrapper.style.display = 'block';
    } else {
      formVideoPlayer.src = '';
      videoPreviewWrapper.style.display = 'none';
    }
  }

  if (btnRemoveVideo) {
    btnRemoveVideo.addEventListener('click', () => {
      formVideoUrl.value = '';
      updateVideoPreview('');
      showToast('Video produk dihapus.');
    });
  }

  // Submit Product Form
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        id: formProductId.value,
        name: formName.value.trim(),
        category: formCategory.value.trim(),
        price: parseFloat(formPrice.value) || 0,
        status: formStatus.value,
        short_desc: formShortDesc.value.trim(),
        full_desc: formFullDesc.value.trim(),
        video: formVideoUrl.value.trim(),
        sizes: getFormSizes(),
        heights: [],
        images: formImages.length > 0 ? [...formImages].reverse() : [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000'
        ]
      };

      const isUpdate = !!editingProductId;
      payload._action = isUpdate ? 'update' : 'create';

      btnSaveProduct.disabled = true;
      btnSaveProduct.textContent = 'Menyimpan...';

      try {
        const response = await authFetch('../api/products.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.success && res.data) {
          if (isUpdate) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) products[index] = res.data;
            showToast('Koleksi bedcover berhasil diperbarui! 🎉');
          } else {
            products.unshift(res.data);
            showToast('Koleksi bedcover baru berhasil disimpan! 🎉');
          }

          updateStats();
          renderTable();
          closeFormModal();
        } else {
          showToast(res.message || 'Gagal menyimpan produk.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan: ' + err.message, 'error');
      } finally {
        btnSaveProduct.disabled = false;
        btnSaveProduct.textContent = 'Simpan Produk';
      }
    });
  }

  // Delete Product
  async function handleDeleteProduct(productId, productName) {
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus "${productName}"?\nFoto dan video terkait di Google Drive akan otomatis dihapus.`);
    if (!confirmDelete) return;

    try {
      const response = await authFetch('../api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'delete', id: productId })
      });

      const res = await response.json();
      if (res.success) {
        products = products.filter(p => p.id !== productId);
        updateStats();
        renderTable();
        renderCategoriesList();
        showToast('Produk dan file medianya berhasil dihapus.', 'success');
      } else {
        showToast(res.message || 'Gagal menghapus produk.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    }
  }

  // Live Search & Category Filter in Admin
  if (adminTableSearch) {
    adminTableSearch.addEventListener('input', renderTable);
  }
  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener('change', renderTable);
  }

  // ==========================================
  // CATEGORY MANAGEMENT
  // ==========================================
  const categoryFormTitle = document.getElementById('categoryFormTitle');
  const editCategoryOldName = document.getElementById('editCategoryOldName');
  const btnSubmitCategory = document.getElementById('btnSubmitCategory');
  const btnCancelEditCat = document.getElementById('btnCancelEditCat');

  function resetCategoryForm() {
    if (addCategoryForm) addCategoryForm.reset();
    if (editCategoryOldName) editCategoryOldName.value = '';
    if (newCategoryImage) newCategoryImage.value = '';
    if (categoryCoverPreviewWrap) categoryCoverPreviewWrap.style.display = 'none';
    if (categoryFormTitle) categoryFormTitle.textContent = 'Tambah Kategori Baru';
    if (btnSubmitCategory) btnSubmitCategory.querySelector('span').textContent = 'Simpan Kategori';
    if (btnCancelEditCat) btnCancelEditCat.style.display = 'none';
  }

  if (btnCancelEditCat) {
    btnCancelEditCat.addEventListener('click', resetCategoryForm);
  }

  function renderCategoriesList() {
    if (!categoryItemsList) return;

    categoryItemsList.innerHTML = categories.map(cat => {
      const catName = is_array_obj(cat) ? cat.name : String(cat);
      const catImg = is_array_obj(cat) ? (cat.image || '') : '';
      const catDesc = is_array_obj(cat) ? (cat.description || '') : '';
      const thumb = formatImageUrl(catImg || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200');
      const count = products.filter(p => (p.category || '').toLowerCase() === catName.toLowerCase()).length;

      return `
        <div class="category-list-item" data-category="${escapeHtml(catName)}">
          <div class="cat-item-left">
            <img src="${escapeHtml(thumb)}" alt="${escapeHtml(catName)}" class="cat-item-thumb" referrerpolicy="no-referrer">
            <div>
              <div class="cat-item-name">${escapeHtml(catName)}</div>
              <div class="cat-item-count">${count} Koleksi Terdaftar</div>
              ${catDesc ? `<div style="font-size: 0.72rem; color: #9ca3af; margin-top: 2px;">${escapeHtml(catDesc)}</div>` : ''}
            </div>
          </div>
          <div class="action-btns">
            <button type="button" class="btn-icon btn-edit-cat" data-name="${escapeHtml(catName)}" title="Edit Kategori">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button type="button" class="btn-icon delete btn-delete-cat" data-name="${escapeHtml(catName)}" title="Hapus Kategori">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Category Edit Event
    categoryItemsList.querySelectorAll('.btn-edit-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const cat = categories.find(c => {
          const cName = is_array_obj(c) ? c.name : String(c);
          return cName.toLowerCase() === name.toLowerCase();
        });
        if (!cat) return;

        const catName = is_array_obj(cat) ? cat.name : String(cat);
        const catDesc = is_array_obj(cat) ? (cat.description || '') : '';
        const catImg = is_array_obj(cat) ? (cat.image || '') : '';

        if (editCategoryOldName) editCategoryOldName.value = catName;
        if (newCategoryName) newCategoryName.value = catName;
        if (newCategoryDesc) newCategoryDesc.value = catDesc;
        if (newCategoryImage) newCategoryImage.value = catImg;

        if (catImg && categoryCoverPreviewWrap && categoryCoverPreview) {
          categoryCoverPreview.src = formatImageUrl(catImg);
          categoryCoverPreviewWrap.style.display = 'block';
        } else if (categoryCoverPreviewWrap) {
          categoryCoverPreviewWrap.style.display = 'none';
        }

        if (categoryFormTitle) categoryFormTitle.textContent = `Edit Kategori: "${catName}"`;
        if (btnSubmitCategory) btnSubmitCategory.querySelector('span').textContent = 'Perbarui Kategori';
        if (btnCancelEditCat) btnCancelEditCat.style.display = 'block';

        if (addCategoryForm) {
          addCategoryForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    // Attach Category Delete
    categoryItemsList.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', async () => {
        const name = btn.getAttribute('data-name');
        if (!confirm(`Hapus kategori "${name}"? Produk yang menggunakan kategori ini tidak akan terhapus.`)) return;

        try {
          const response = await authFetch('../api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _action: 'delete_category', name: name })
          });
          const res = await response.json();
          if (res.success) {
            categories = res.data;
            if (editCategoryOldName && editCategoryOldName.value === name) {
              resetCategoryForm();
            }
            updateCategoryDropdowns();
            renderCategoriesList();
            updateStats();
            showToast(`Kategori "${name}" berhasil dihapus.`);
          } else {
            showToast(res.message || 'Gagal menghapus kategori.', 'error');
          }
        } catch (err) {
          showToast('Error: ' + err.message, 'error');
        }
      });
    });
  }

  // Upload Category Cover Image
  if (btnUploadCategoryCover && categoryFileInput) {
    btnUploadCategoryCover.addEventListener('click', () => categoryFileInput.click());

    categoryFileInput.addEventListener('change', async () => {
      const file = categoryFileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);
      showToast('Mengunggah cover kategori...', 'success');

      try {
        const response = await authFetch('../api/upload.php', { method: 'POST', body: formData });
        const res = await response.json();
        if (res.success && res.data?.url) {
          newCategoryImage.value = res.data.url;
          categoryCoverPreview.src = res.data.url;
          categoryCoverPreviewWrap.style.display = 'block';
          showToast('Cover kategori berhasil diunggah!');
        } else {
          showToast(res.message || 'Gagal mengunggah cover.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        categoryFileInput.value = '';
      }
    });
  }

  // Add / Edit Category Submit
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = newCategoryName.value.trim();
      const desc = newCategoryDesc.value.trim();
      const image = newCategoryImage.value.trim();
      const oldName = editCategoryOldName ? editCategoryOldName.value.trim() : '';

      if (!name) return;

      const isEditing = !!oldName;
      const actionName = isEditing ? 'update_category' : 'add_category';
      const payload = {
        _action: actionName,
        name: name,
        description: desc,
        image: image
      };
      if (isEditing) {
        payload.old_name = oldName;
      }

      try {
        const response = await authFetch('../api/settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (res.success) {
          categories = res.data;
          
          if (isEditing) {
            // Update local products categories too
            products.forEach(p => {
              if ((p.category || '').toLowerCase() === oldName.toLowerCase()) {
                p.category = name;
              }
            });
            renderTable();
          }

          resetCategoryForm();
          updateCategoryDropdowns();
          renderCategoriesList();
          updateStats();
          showToast(isEditing ? `Kategori "${name}" berhasil diperbarui!` : `Kategori "${name}" berhasil ditambahkan! 👑`);
        } else {
          showToast(res.message || 'Gagal menyimpan kategori.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }

  // ==========================================
  // BANNER MANAGEMENT
  // ==========================================
  function renderBannersGrid() {
    if (!bannersGrid) return;

    if (banners.length === 0) {
      bannersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94A3B8;">
          Belum ada promo banner. Silakan klik tombol "Tambah Banner Baru" di atas.
        </div>
      `;
      return;
    }

    bannersGrid.innerHTML = banners.map(b => {
      const img = formatImageUrl(b.image);
      const isActive = !!b.active;

      return `
        <div class="admin-banner-card">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(b.title)}" class="admin-banner-img" referrerpolicy="no-referrer">
          <div class="admin-banner-body">
            <h4 class="admin-banner-title">${escapeHtml(b.title)}</h4>
            <p class="admin-banner-subtitle">${escapeHtml(b.subtitle || 'Tanpa subjudul')}</p>
            <div class="admin-banner-footer">
              <span class="admin-badge" style="background: ${isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isActive ? '#34D399' : '#F87171'}; border-color: transparent;">
                ${isActive ? '● Aktif' : '○ Non-Aktif'}
              </span>
              <div class="action-btns">
                <button type="button" class="btn-icon btn-edit-banner" data-id="${escapeHtml(b.id)}" title="Edit Banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button type="button" class="btn-icon delete btn-delete-banner" data-id="${escapeHtml(b.id)}" title="Hapus Banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Banner Edit
    bannersGrid.querySelectorAll('.btn-edit-banner').forEach(btn => {
      btn.addEventListener('click', () => {
        openEditBannerModal(btn.getAttribute('data-id'));
      });
    });

    // Banner Delete (with Google Drive auto-delete)
    bannersGrid.querySelectorAll('.btn-delete-banner').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Hapus banner ini? Gambar terkait di Google Drive akan otomatis dihapus.')) return;

        try {
          const response = await authFetch('../api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _action: 'delete_banner', id: id })
          });
          const res = await response.json();
          if (res.success) {
            banners = res.data;
            renderBannersGrid();
            showToast('Banner dan file gambarnya berhasil dihapus.');
          } else {
            showToast(res.message || 'Gagal menghapus banner.', 'error');
          }
        } catch (err) {
          showToast('Error: ' + err.message, 'error');
        }
      });
    });
  }

  function openAddBannerModal() {
    editingBannerId = null;
    bannerModalTitle.textContent = 'Tambah Banner Baru';
    bannerForm.reset();
    formBannerId.value = '';
    formBannerActive.checked = true;
    bannerImgPreviewWrapper.style.display = 'none';
    bannerModal.classList.add('active');
  }

  function openEditBannerModal(id) {
    const b = banners.find(item => item.id === id);
    if (!b) return;

    editingBannerId = id;
    bannerModalTitle.textContent = 'Edit Banner: ' + b.title;
    formBannerId.value = b.id;
    formBannerTitle.value = b.title || '';
    formBannerSubtitle.value = b.subtitle || '';
    formBannerBtnText.value = b.button_text || 'Lihat Koleksi';
    formBannerLink.value = b.link || '#katalog';
    formBannerImage.value = b.image || '';
    formBannerActive.checked = !!b.active;

    if (b.image) {
      bannerImgPreview.src = formatImageUrl(b.image);
      bannerImgPreviewWrapper.style.display = 'block';
    } else {
      bannerImgPreviewWrapper.style.display = 'none';
    }

    bannerModal.classList.add('active');
  }

  function closeBannerModal() {
    bannerModal.classList.remove('active');
    editingBannerId = null;
  }

  if (btnOpenAddBannerModal) btnOpenAddBannerModal.addEventListener('click', openAddBannerModal);
  if (btnCloseBannerModal) btnCloseBannerModal.addEventListener('click', closeBannerModal);
  if (btnCancelBannerModal) btnCancelBannerModal.addEventListener('click', closeBannerModal);

  // Upload Banner Image
  if (btnUploadBannerImg && bannerFileInput) {
    btnUploadBannerImg.addEventListener('click', () => bannerFileInput.click());

    bannerFileInput.addEventListener('change', async () => {
      const file = bannerFileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);
      showToast('Mengunggah gambar banner...', 'success');

      try {
        const response = await authFetch('../api/upload.php', { method: 'POST', body: formData });
        const res = await response.json();
        if (res.success && res.data?.url) {
          formBannerImage.value = res.data.url;
          bannerImgPreview.src = res.data.url;
          bannerImgPreviewWrapper.style.display = 'block';
          showToast('Gambar banner berhasil diunggah!');
        } else {
          showToast(res.message || 'Gagal mengunggah gambar banner.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        bannerFileInput.value = '';
      }
    });
  }

  // Submit Banner Form
  if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        _action: 'save_banner',
        id: formBannerId.value,
        title: formBannerTitle.value.trim(),
        subtitle: formBannerSubtitle.value.trim(),
        button_text: formBannerBtnText.value.trim(),
        link: formBannerLink.value.trim(),
        image: formBannerImage.value.trim(),
        active: formBannerActive.checked
      };

      try {
        const response = await authFetch('../api/settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (res.success) {
          banners = res.data;
          renderBannersGrid();
          closeBannerModal();
          showToast('Banner promosi berhasil disimpan! ✨');
        } else {
          showToast(res.message || 'Gagal menyimpan banner.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }

  // ==========================================
  // LOGO & CONTACT SETTINGS
  // ==========================================
  if (btnUploadLogo && logoFileInput) {
    btnUploadLogo.addEventListener('click', () => logoFileInput.click());

    logoFileInput.addEventListener('change', async () => {
      const file = logoFileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'logo');
      showToast('Mengunggah logo ke Google Drive...', 'success');

      try {
        const response = await authFetch('../api/upload.php', { method: 'POST', body: formData });
        const res = await response.json();
        if (res.success && res.data?.url) {
          formLogoUrl.value = res.data.url;
          if (settingsLogoPreview) settingsLogoPreview.src = res.data.url;
          if (adminNavbarLogo) adminNavbarLogo.src = res.data.url;
          showToast('Logo berhasil diunggah! Jangan lupa klik Simpan Pengaturan.', 'success');
        } else {
          showToast(res.message || 'Gagal mengunggah logo.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        logoFileInput.value = '';
      }
    });
  }

  if (btnResetLogo) {
    btnResetLogo.addEventListener('click', () => {
      const defaultUrl = window.BASE_URL ? window.BASE_URL.replace(/\/+$/, '') + '/assets/images/logo.svg' : '../assets/images/logo.svg';
      formLogoUrl.value = 'assets/images/logo.svg';
      if (settingsLogoPreview) settingsLogoPreview.src = defaultUrl;
      if (adminNavbarLogo) adminNavbarLogo.src = defaultUrl;
      showToast('Logo direset ke default. Jangan lupa klik Simpan Pengaturan.');
    });
  }

  if (generalSettingsForm) {
    generalSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(generalSettingsForm);
      const payload = {
        _action: 'update_general'
      };
      formData.forEach((val, key) => payload[key] = val);

      try {
        const response = await authFetch('../api/settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (res.success) {
          settings = res.data;
          showToast('Pengaturan brand & kontak berhasil disimpan! 👑');
        } else {
          showToast(res.message || 'Gagal menyimpan pengaturan.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }

  // ==========================================
  // GUIDE MODAL & TEST GOOGLE CONNECTION
  // ==========================================
  if (btnOpenGuide && guideModal) {
    btnOpenGuide.addEventListener('click', () => guideModal.classList.add('active'));
  }
  if (btnCloseGuideModal && guideModal) {
    btnCloseGuideModal.addEventListener('click', () => guideModal.classList.remove('active'));
  }
  if (btnCloseGuideModalBtn && guideModal) {
    btnCloseGuideModalBtn.addEventListener('click', () => guideModal.classList.remove('active'));
  }

  if (btnTestConnection) {
    btnTestConnection.addEventListener('click', async () => {
      btnTestConnection.disabled = true;
      btnTestConnection.innerHTML = '<span>Menguji...</span>';

      try {
        const response = await authFetch('../api/check-connection.php');
        const res = await response.json();

        if (res.success && res.data) {
          const d = res.data;
          let msg = `Hasil Uji Koneksi:\n`;
          msg += `• Google Sheets: ${d.sheets_connected ? '✅ Terhubung' : '❌ Gagal/Belum diatur'}\n`;
          msg += `• Google Drive: ${d.drive_connected ? '✅ Terhubung' : '❌ Gagal/Belum diatur'}\n`;
          if (d.error) msg += `\nDetail: ${d.error}`;
          alert(msg);
        } else {
          alert('Gagal menguji koneksi: ' + (res.message || ''));
        }
      } catch (err) {
        alert('Terjadi kesalahan pengujian: ' + err.message);
      } finally {
        btnTestConnection.disabled = false;
        btnTestConnection.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
          <span>Cek Koneksi Google</span>
        `;
      }
    });
  }

  // Initial Boot
  updateCategoryDropdowns();
  renderCategoriesList();
  renderBannersGrid();
  renderTable();
  updateStats();
});

