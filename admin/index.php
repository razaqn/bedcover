<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/../includes/ProductRepository.php';
require_once __DIR__ . '/../includes/SettingsRepository.php';

Auth::requireLogin();

$productRepo = new ProductRepository();
$settingsRepo = new SettingsRepository();

$products = $productRepo->getAll();
$settings = $settingsRepo->getAll();
$categories = $settingsRepo->getCategories();
$banners = $settingsRepo->getBanners();
$sourceInfo = $productRepo->getSourceStatus();

$appName = $settings['app_name'] ?? 'Bedcover Susah Bangun';
$appTagline = $settings['app_tagline'] ?? 'Tidur Mewah & Nyenyak, Bangun Nanti Dulu ✨';
$logoUrl = format_logo_url($settings['logo_url'] ?? 'assets/images/logo.svg');
$faviconUrl = format_favicon_url($settings['favicon_url'] ?? $settings['logo_url'] ?? '');

// Stats
$totalProducts = count($products);
$totalCategories = count($categories);
$readyStockCount = count(array_filter($products, fn($p) => ($p['status'] ?? '') === 'Ready Stock'));
$poCount = count(array_filter($products, fn($p) => str_contains(($p['status'] ?? ''), 'Pre-Order')));
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>Dashboard Admin | <?= e($appName) ?></title>

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="<?= e($faviconUrl) ?>">
  <link rel="apple-touch-icon" href="<?= e($faviconUrl) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/admin.css">
  <link rel="stylesheet" href="../assets/vendor/cropper/cropper.min.css">
</head>
<body class="admin-body">
  <div class="luxury-ambient-bg"></div>

  <!-- Top Navbar -->
  <header class="admin-navbar">
    <div class="admin-nav-left">
      <a href="../" target="_blank" class="admin-brand" title="Buka Katalog Web">
        <img src="<?= e($logoUrl) ?>" alt="<?= e($appName) ?>" class="admin-nav-logo" id="adminNavbarLogo">
      </a>
      <div class="source-indicator-pill <?= $sourceInfo['active'] ? 'connected' : 'warning' ?>" id="sourceStatusIndicator" title="<?= e($sourceInfo['message']) ?>">
        <span class="pulse-dot"></span>
        <span class="source-text"><?= e($sourceInfo['source']) ?></span>
      </div>
    </div>

    <div class="admin-nav-right">
      <button type="button" class="btn btn-luxury-outline btn-sm" id="btnTestConnection" title="Cek koneksi ke Google Sheets & Drive API">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        <span>Cek Koneksi Google</span>
      </button>

      <button type="button" class="btn btn-luxury-outline btn-sm" id="btnOpenGuide" title="Panduan Konfigurasi">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>Panduan Setup</span>
      </button>

      <a href="../" target="_blank" class="btn btn-luxury-outline btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>Lihat Web</span>
      </a>

      <a href="logout" class="btn btn-logout btn-sm" title="Keluar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span>Keluar</span>
      </a>
    </div>
  </header>

  <div class="admin-container">
    <!-- Stat Cards Overview -->
    <section class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h10M7 9h10"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Koleksi Produk</span>
          <span class="stat-value" id="statTotal"><?= $totalProducts ?></span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper purple">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Kategori Mewah</span>
          <span class="stat-value" id="statCategories"><?= $totalCategories ?></span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Ready Stock</span>
          <span class="stat-value" id="statReady"><?= $readyStockCount ?></span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pre-Order Kustom</span>
          <span class="stat-value" id="statPo"><?= $poCount ?></span>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="admin-tab-nav">
      <button type="button" class="admin-tab-btn active" data-tab="tab-products">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Manajemen Produk</span>
      </button>

      <button type="button" class="admin-tab-btn" data-tab="tab-categories">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        <span>Manajemen Kategori</span>
      </button>

      <button type="button" class="admin-tab-btn" data-tab="tab-banners">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        <span>Promo Banners</span>
      </button>

      <button type="button" class="admin-tab-btn" data-tab="tab-settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        <span>Kontak & Logo Brand</span>
      </button>
    </div>

    <!-- TAB 1: PRODUCT MANAGEMENT -->
    <div class="admin-tab-content active" id="tab-products">
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="header-left">
            <h2 class="card-title">Daftar Koleksi Bedcover</h2>
            <p class="card-subtitle">Kelola foto produk, video, deskripsi bahan, harga, dan kustomisasi</p>
          </div>
          <div class="header-right">
            <button type="button" class="btn btn-luxury-primary" id="btnOpenAddModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Tambah Bedcover Baru</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="table-controls">
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="adminTableSearch" placeholder="Cari nama, bahan, deskripsi produk..." class="form-control">
          </div>

          <div class="filter-box">
            <select id="adminCategoryFilter" class="form-control">
              <option value="all">Semua Kategori</option>
              <?php foreach ($categories as $cat): ?>
                <?php $catName = is_array($cat) ? $cat['name'] : $cat; ?>
                <option value="<?= e($catName) ?>"><?= e($catName) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
        </div>

        <!-- Products Table -->
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 280px;">Produk & Foto</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Ukuran & Status</th>
                <th>Media</th>
                <th style="text-align: right; width: 170px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="productTableBody">
              <!-- Rendered via JavaScript -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: CATEGORY MANAGEMENT -->
    <div class="admin-tab-content" id="tab-categories">
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="header-left">
            <h2 class="card-title">Manajemen Kategori Mewah</h2>
            <p class="card-subtitle">Kategori ini ditampilkan sebagai galeri pilihan utama di halaman depan web</p>
          </div>
        </div>

        <div class="category-manager-grid">
          <!-- Add / Edit Category Form -->
          <div class="category-add-box">
            <h3 class="box-title" id="categoryFormTitle">Tambah Kategori Baru</h3>
            <form id="addCategoryForm">
              <input type="hidden" id="editCategoryOldName" value="">

              <div class="form-group">
                <label for="newCategoryName" class="form-label">Nama Kategori *</label>
                <input type="text" id="newCategoryName" class="form-control" placeholder="Contoh: Egyptian Cotton 1000TC" required>
              </div>

              <div class="form-group">
                <label for="newCategoryDesc" class="form-label">Deskripsi Singkat</label>
                <textarea id="newCategoryDesc" class="form-control" rows="2" placeholder="Deskripsi kemewahan bahan atau keunggulan kategori ini..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Foto Cover Kategori</label>
                <div class="upload-trigger-box" id="btnUploadCategoryCover">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>Unggah Cover Kategori</span>
                </div>
                <input type="file" id="categoryFileInput" accept="image/*" style="display: none;">
                <input type="hidden" id="newCategoryImage">
                
                <div class="category-img-preview-wrap" id="categoryCoverPreviewWrap" style="display: none; margin-top: 10px;">
                  <img id="categoryCoverPreview" src="" alt="Cover Preview" class="cover-preview-img">
                </div>
              </div>

              <button type="submit" class="btn btn-luxury-primary btn-block" id="btnSubmitCategory">
                <span>Simpan Kategori</span>
              </button>
              <button type="button" class="btn btn-luxury-outline btn-block" id="btnCancelEditCat" style="display: none; margin-top: 8px;">
                <span>Batal Edit</span>
              </button>
            </form>
          </div>

          <!-- Existing Categories List -->
          <div class="category-list-box">
            <h3 class="box-title">Daftar Kategori Terdaftar</h3>
            <div class="category-items-list" id="categoryItemsList">
              <!-- Rendered via JavaScript -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: PROMO BANNERS -->
    <div class="admin-tab-content" id="tab-banners">
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="header-left">
            <h2 class="card-title">Promo Hero Banners</h2>
            <p class="card-subtitle">Banner slider interaktif yang muncul di puncak halaman beranda</p>
          </div>
          <div class="header-right">
            <button type="button" class="btn btn-luxury-primary" id="btnOpenAddBannerModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Tambah Banner Baru</span>
            </button>
          </div>
        </div>

        <div class="banners-grid" id="bannersGrid">
          <!-- Rendered via JavaScript -->
        </div>
      </div>
    </div>

    <!-- TAB 4: CONTACT & BRAND SETTINGS -->
    <div class="admin-tab-content" id="tab-settings">
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="header-left">
            <h2 class="card-title">Identitas Brand & Kontak</h2>
            <p class="card-subtitle">Pengaturan nomor WhatsApp auto-chat, Instagram, logo, alamat galeri, dan jam buka</p>
          </div>
        </div>

        <form id="generalSettingsForm" class="settings-form">
          <div class="settings-grid">
            <!-- Brand Info -->
            <div class="settings-col">
              <h3 class="section-title">👑 Profil Brand</h3>

              <div class="form-group">
                <label for="formAppName" class="form-label">Nama Brand</label>
                <input type="text" id="formAppName" name="app_name" class="form-control" value="<?= e($appName) ?>" required>
              </div>

              <div class="form-group">
                <label for="formAppTagline" class="form-label">Tagline Brand</label>
                <input type="text" id="formAppTagline" name="app_tagline" class="form-control" value="<?= e($appTagline) ?>" required>
              </div>

              <div class="form-group">
                <label class="form-label">Logo Web</label>
                <div class="logo-preview-box">
                  <img src="<?= e($logoUrl) ?>" id="settingsLogoPreview" alt="Logo Preview" class="logo-preview-img">
                  <div class="logo-actions">
                    <button type="button" class="btn btn-luxury-outline btn-sm" id="btnUploadLogo">Ganti Logo</button>
                    <button type="button" class="btn btn-luxury-outline btn-sm" id="btnResetLogo">Reset Default</button>
                    <input type="file" id="logoFileInput" accept="image/*" style="display: none;">
                    <input type="hidden" id="formLogoUrl" name="logo_url" value="<?= e($settings['logo_url'] ?? 'assets/images/logo.svg') ?>">
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact & Socials -->
            <div class="settings-col">
              <h3 class="section-title">📱 Kontak & Media Sosial</h3>

              <div class="form-group">
                <label for="formWhatsapp" class="form-label">Nomor WhatsApp Auto-Order *</label>
                <input type="text" id="formWhatsapp" name="whatsapp_number" class="form-control" value="<?= e($settings['whatsapp_number'] ?? '6281234567890') ?>" placeholder="6281234567890" required>
                <small class="form-hint">Wajib diawali kode negara 62 tanpa spasi/strip (contoh: 6281234567890).</small>
              </div>

              <div class="form-group">
                <label for="formInstagram" class="form-label">Link Instagram</label>
                <input type="url" id="formInstagram" name="instagram_url" class="form-control" value="<?= e($settings['instagram_url'] ?? '') ?>" placeholder="https://instagram.com/bedcover.susahbangun">
              </div>

              <div class="form-group">
                <label for="formTiktok" class="form-label">Link TikTok</label>
                <input type="url" id="formTiktok" name="tiktok_url" class="form-control" value="<?= e($settings['tiktok_url'] ?? '') ?>" placeholder="https://tiktok.com/@bedcoversusahbangun">
              </div>

              <div class="form-group">
                <label for="formAddress" class="form-label">Alamat Galeri / Showroom</label>
                <input type="text" id="formAddress" name="address" class="form-control" value="<?= e($settings['address'] ?? '') ?>">
              </div>

              <div class="form-group">
                <label for="formOpeningHours" class="form-label">Jam Layanan</label>
                <input type="text" id="formOpeningHours" name="opening_hours" class="form-control" value="<?= e($settings['opening_hours'] ?? '') ?>">
              </div>
            </div>
          </div>

          <div class="form-footer" style="margin-top: 25px;">
            <button type="submit" class="btn btn-luxury-primary" id="btnSaveSettings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL: ADD / EDIT PRODUCT -->
  <div class="modal-overlay" id="productFormModal">
    <div class="modal-container modal-lg">
      <div class="modal-header">
        <h3 class="modal-title" id="modalFormTitle">Tambah Bedcover Baru</h3>
        <button type="button" class="btn-close" id="btnCloseFormModal">&times;</button>
      </div>

      <form id="productForm">
        <input type="hidden" id="formProductId">

        <div class="modal-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label for="formName" class="form-label">Nama Koleksi Bedcover *</label>
              <input type="text" id="formName" class="form-control" placeholder="Contoh: Imperial Champagne Gold Tencel 80s" required>
            </div>

            <div class="form-group">
              <label for="formCategory" class="form-label">Kategori *</label>
              <select id="formCategory" class="form-control" required>
                <!-- Populated via JS -->
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="formPrice" class="form-label">Harga (Rupiah) *</label>
              <input type="number" id="formPrice" class="form-control" placeholder="1250000" min="0" required>
            </div>

            <div class="form-group">
              <label for="formStatus" class="form-label">Status Ketersediaan</label>
              <select id="formStatus" class="form-control">
                <option value="Ready Stock">Ready Stock</option>
                <option value="Pre-Order H-3">Pre-Order H-3</option>
                <option value="Pre-Order H-7">Pre-Order H-7 (Custom Monogram)</option>
                <option value="Habis / Sold Out">Habis / Sold Out</option>
              </select>
            </div>
          </div>

          <!-- Pilihan Ukuran Bedcover (Format: Lebar x Panjang x Tinggi cm) -->
          <div class="form-group">
            <label class="form-label">Pilihan Ukuran Bedcover Tersedia *</label>
            <div class="size-options-container" id="adminSizeSelector">
              <label class="size-checkbox-pill">
                <input type="checkbox" name="product_sizes[]" value="120 x 200 x 40 cm">
                <span>120 x 200 x 40 cm</span>
              </label>
              <label class="size-checkbox-pill">
                <input type="checkbox" name="product_sizes[]" value="160 x 200 x 40 cm">
                <span>160 x 200 x 40 cm</span>
              </label>
              <label class="size-checkbox-pill">
                <input type="checkbox" name="product_sizes[]" value="180 x 200 x 40 cm">
                <span>180 x 200 x 40 cm</span>
              </label>
              <label class="size-checkbox-pill">
                <input type="checkbox" name="product_sizes[]" value="200 x 200 x 40 cm">
                <span>200 x 200 x 40 cm</span>
              </label>
            </div>

            <!-- Input Ukuran Tambahan Lainnya (Lebar x Panjang x Tinggi, bisa lebih dari 1) -->
            <div class="custom-sizes-manager-box">
              <label class="custom-sizes-title">Tambah Ukuran Lainnya (Lebar &times; Panjang &times; Tinggi cm):</label>
              <div class="custom-size-inputs-row">
                <input type="number" id="inputCustomWidth" class="form-control" placeholder="Lebar" min="1">
                <span class="size-x">&times;</span>
                <input type="number" id="inputCustomLength" class="form-control" placeholder="Panjang" min="1">
                <span class="size-x">&times;</span>
                <input type="number" id="inputCustomHeight" class="form-control" placeholder="Tinggi" min="1">
                <span class="size-unit">cm</span>
                <button type="button" class="btn btn-luxury-outline btn-sm" id="btnAddCustomSize" style="white-space: nowrap;">
                  + Tambah Ukuran
                </button>
              </div>
              <div class="custom-sizes-tags-list" id="customSizesListContainer">
                <!-- Dynamic custom size pills rendered here -->
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="formShortDesc" class="form-label">Deskripsi Singkat (Highlights Bahan & Rasa)</label>
            <input type="text" id="formShortDesc" class="form-control" placeholder="Sutra Tencel 80s serat eucalyptus murni dengan kilau champagne gold...">
          </div>

          <div class="form-group">
            <label for="formFullDesc" class="form-label">Deskripsi Lengkap, Kelengkapan Paket & Panduan Ukuran</label>
            <textarea id="formFullDesc" class="form-control" rows="5" placeholder="Tuliskan isi paket (Bedcover, Sprei Fitted, Sarung Bantal, Guling), ukuran kasur yang pas, dan instruksi pencucian..."></textarea>
          </div>

          <!-- Video Upload & Input -->
          <div class="form-group video-section-box">
            <label class="form-label">🎥 Video Produk Eksklusif (Opsional)</label>
            <div class="video-input-row">
              <input type="text" id="formVideoUrl" class="form-control" placeholder="Link video Google Drive atau URL langsung...">
              <button type="button" class="btn btn-luxury-outline" id="btnUploadVideo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                <span>Upload Video</span>
              </button>
              <input type="file" id="videoFileInput" accept="video/mp4,video/webm,video/quicktime" style="display: none;">
            </div>

            <div class="video-preview-wrapper" id="videoPreviewWrapper" style="display: none; margin-top: 10px;">
              <video id="formVideoPlayer" controls playsinline></video>
              <button type="button" class="btn btn-danger btn-xs" id="btnRemoveVideo" style="margin-top: 5px;">Hapus Video</button>
            </div>
          </div>

          <!-- Multiple Photos Upload -->
          <div class="form-group">
            <label class="form-label">📷 Foto Produk (Bisa Unggah Banyak Sekaligus)</label>
            <div class="drop-area" id="dropArea">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <p class="drop-text">Klik di sini untuk memilih foto dari perangkat Anda</p>
              <span class="drop-hint">Format JPG, PNG, WEBP. Maks 15MB per file. Foto otomatis tersimpan di Google Drive.</span>
              <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
            </div>

            <div class="image-order-notice-box">
              <span class="notice-icon">💡</span>
              <span class="notice-text">
                <strong>Urutan Foto Produk:</strong> Foto <em>paling kiri</em> adalah foto utama (sampul). Gunakan tombol <strong>◀ / ▶</strong> atau geser (drag &amp; drop) untuk mengatur urutan. Klik pada foto untuk <strong>memotong (crop)</strong>.
              </span>
            </div>

            <div class="preview-images-grid" id="previewImagesContainer">
              <!-- Rendered preview items -->
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-luxury-outline" id="btnCancelForm">Batal</button>
          <button type="submit" class="btn btn-luxury-primary" id="btnSaveProduct">Simpan Produk</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: ADD / EDIT BANNER -->
  <div class="modal-overlay" id="bannerModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title" id="bannerModalTitle">Tambah Banner Baru</h3>
        <button type="button" class="btn-close" id="btnCloseBannerModal">&times;</button>
      </div>

      <form id="bannerForm">
        <input type="hidden" id="formBannerId">

        <div class="modal-body">
          <div class="form-group">
            <label for="formBannerTitle" class="form-label">Judul Banner *</label>
            <input type="text" id="formBannerTitle" class="form-control" placeholder="Contoh: Tidur Sultan, Bangun Nanti Dulu 👑" required>
          </div>

          <div class="form-group">
            <label for="formBannerSubtitle" class="form-label">Subjudul / Deskripsi Banner</label>
            <textarea id="formBannerSubtitle" class="form-control" rows="2" placeholder="Teks penjelas promo atau tagline..."></textarea>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="formBannerBtnText" class="form-label">Teks Tombol</label>
              <input type="text" id="formBannerBtnText" class="form-control" value="Lihat Koleksi" placeholder="Lihat Koleksi">
            </div>

            <div class="form-group">
              <label for="formBannerLink" class="form-label">Link Tujuan Tombol</label>
              <input type="text" id="formBannerLink" class="form-control" value="#katalog" placeholder="#katalog atau link WA">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Gambar Banner *</label>
            <div class="banner-upload-row">
              <input type="text" id="formBannerImage" class="form-control" placeholder="URL gambar atau unggah langsung..." required>
              <button type="button" class="btn btn-luxury-outline" id="btnUploadBannerImg">Unggah Foto</button>
              <input type="file" id="bannerFileInput" accept="image/*" style="display: none;">
            </div>

            <div class="banner-img-preview-wrapper" id="bannerImgPreviewWrapper" style="display: none; margin-top: 10px;">
              <img id="bannerImgPreview" src="" alt="Banner Preview" class="banner-preview-img">
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="formBannerActive" checked>
              <span>Aktifkan banner ini di halaman beranda</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-luxury-outline" id="btnCancelBannerModal">Batal</button>
          <button type="submit" class="btn btn-luxury-primary" id="btnSaveBanner">Simpan Banner</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: GOOGLE SETUP GUIDE -->
  <div class="modal-overlay" id="guideModal">
    <div class="modal-container modal-lg">
      <div class="modal-header">
        <h3 class="modal-title">Panduan Integrasi Google Sheets & Drive (OAuth 2.0)</h3>
        <button type="button" class="btn-close" id="btnCloseGuideModal">&times;</button>
      </div>
      <div class="modal-body" style="line-height: 1.7; font-size: 0.95rem; color: #CBD5E1;">
        <p>Aplikasi ini dirancang untuk dapat berjalan <strong>100% tanpa database MySQL/Postgres</strong> dengan memanfaatkan Google Sheets sebagai database realtime dan Google Drive untuk penyimpanan foto & video.</p>
        
        <h4 style="color: #D4AF37; margin: 15px 0 5px;">1. Jika ingin coba lokal dulu (Tanpa Google):</h4>
        <p>Biarkan kredensial Google di file <code>.env</code> kosong. Sistem otomatis menyimpan dan membaca data dari file lokal JSON (<code>data/products.json</code> dan <code>data/settings.json</code>).</p>

        <h4 style="color: #D4AF37; margin: 15px 0 5px;">2. Langkah Menghubungkan Google API (OAuth 2.0):</h4>
        <ol style="padding-left: 20px;">
          <li>Buka <a href="https://console.cloud.google.com/" target="_blank" style="color: #ECC880;">Google Cloud Console</a>, buat project baru, dan aktifkan <strong>Google Sheets API</strong> & <strong>Google Drive API</strong>.</li>
          <li>Buat OAuth Client ID (Web Application), dapatkan <strong>GOOGLE_CLIENT_ID</strong> dan <strong>GOOGLE_CLIENT_SECRET</strong>.</li>
          <li>Dapatkan <strong>Refresh Token</strong> melalui <a href="https://developers.google.com/oauthplayground" target="_blank" style="color: #ECC880;">OAuth 2.0 Playground</a> dengan scope Sheets & Drive.</li>
          <li>Buat Spreadsheet kosong di Google Sheets dan ambil ID spreadsheet-nya dari URL.</li>
          <li>Buat folder kosong di Google Drive dan ambil ID foldernya dari URL.</li>
          <li>Masukkan semua nilai tersebut ke dalam file <code>.env</code> Anda.</li>
        </ol>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-luxury-primary" id="btnCloseGuideModalBtn">Mengerti & Tutup</button>
      </div>
    </div>
  </div>

  <!-- MODAL: CROP IMAGE -->
  <div class="modal-overlay" id="cropperModal" style="z-index: 99999;">
    <div class="modal-container cropper-modal-container">
      <div class="modal-header">
        <h3 class="modal-title">✂️ Crop &amp; Sesuaikan Foto Produk</h3>
        <button type="button" class="btn-close" id="btnCloseCropperModal">&times;</button>
      </div>
      <div class="modal-body cropper-modal-body">
        <div class="cropper-stage">
          <img id="cropperImageElement" src="" alt="Foto Crop" crossorigin="anonymous">
        </div>
        <div class="cropper-controls-panel">
          <div class="cropper-ratio-group">
            <span class="cropper-control-label">Rasio Aspek:</span>
            <div class="cropper-ratio-btns">
              <button type="button" class="btn-ratio active" data-ratio="1">1:1 (Persegi)</button>
              <button type="button" class="btn-ratio" data-ratio="1.333333">4:3 (Katalog)</button>
              <button type="button" class="btn-ratio" data-ratio="0.75">3:4 (Potret)</button>
              <button type="button" class="btn-ratio" data-ratio="NaN">Bebas</button>
            </div>
          </div>
          <div class="cropper-action-tools">
            <button type="button" class="btn-tool" id="btnCropperRotateLeft" title="Putar 90° Kiri">↺ Putar Kiri</button>
            <button type="button" class="btn-tool" id="btnCropperRotateRight" title="Putar 90° Kanan">↻ Putar Kanan</button>
            <button type="button" class="btn-tool" id="btnCropperReset" title="Reset Posisi">⟲ Reset</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-luxury-outline" id="btnCancelCropper">Batal</button>
        <button type="button" class="btn btn-luxury-primary" id="btnApplyCropper">✂️ Terapkan &amp; Simpan Potongan</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div class="admin-toast" id="adminToast">
    <div class="toast-body" id="toastMessage">Pemberitahuan berhasil</div>
  </div>

  <!-- Initial Data for JS Client -->
  <script>
    window.INITIAL_PRODUCTS = <?= json_encode($products, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
    window.INITIAL_CATEGORIES = <?= json_encode($categories, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
    window.INITIAL_BANNERS = <?= json_encode($banners, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
    window.INITIAL_SETTINGS = <?= json_encode($settings, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
    window.ADMIN_TOKEN = <?= json_encode(Auth::getToken()) ?>;
    window.BASE_URL = <?= json_encode(base_url()) ?>;
  </script>
  <script src="../assets/vendor/cropper/cropper.min.js"></script>
  <script src="../assets/js/admin.js"></script>
</body>
</html>

