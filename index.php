<?php
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/includes/ProductRepository.php';
require_once __DIR__ . '/includes/SettingsRepository.php';

$productRepo = new ProductRepository();
$settingsRepo = new SettingsRepository();

$products = $productRepo->getAll();
$settings = $settingsRepo->getAll();
$categories = $settingsRepo->getCategories();
$banners = array_values(array_filter($settingsRepo->getBanners(), fn($b) => !empty($b['active'])));

$appName = $settings['app_name'] ?? 'Bedcover Susah Bangun';
$appTagline = $settings['app_tagline'] ?? 'Tidur Mewah & Nyenyak, Bangun Nanti Dulu ✨';
$logoUrl = format_logo_url($settings['logo_url'] ?? 'assets/images/logo.svg');
$faviconUrl = format_favicon_url($settings['favicon_url'] ?? $settings['logo_url'] ?? '');
$waNumber = $settings['whatsapp_number'] ?? '6281234567890';
$igUrl = $settings['instagram_url'] ?? 'https://instagram.com/bedcover.susahbangun';
$address = $settings['address'] ?? 'Grand Gallery No. 8, Senopati, Jakarta Selatan';
$hours = $settings['opening_hours'] ?? 'Setiap Hari 09:00 - 21:00 WIB';

// Calculate product count per category
$categoryCounts = [];
foreach ($categories as $cat) {
    $catName = is_array($cat) ? $cat['name'] : (string)$cat;
    $count = 0;
    foreach ($products as $p) {
        if (strcasecmp($p['category'] ?? '', $catName) === 0) {
            $count++;
        }
    }
    $categoryCounts[$catName] = $count;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <meta name="referrer" content="no-referrer">
  <title><?= e($appName) ?> | Luxury Bedding & Bedcover E-Catalog</title>
  <meta name="description" content="<?= e($appTagline) ?> - Katalog Sprei & Bedcover Sutra Organik Tencel 80s, Katun Jepang Murni & Hotel Bintang Lima.">

  <!-- Website Favicon & App Icons -->
  <link rel="icon" type="image/svg+xml" href="<?= e($faviconUrl) ?>">
  <link rel="apple-touch-icon" href="<?= e($faviconUrl) ?>">

  <!-- Google Fonts: Luxury Serif & Sans-serif -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- CSS Stylesheets -->
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="luxury-theme">
  <!-- Luxury Ambient Lighting Effects -->
  <div class="luxury-ambient-bg"></div>

  <!-- Announcement Bar -->
  <div class="announcement-bar">
    <div class="container announcement-content">
      <span>👑 <strong>Koleksi Sultan Terbaru:</strong> 100% Sutra Organik Tencel 80s & Katun Jepang 400TC</span>
      <span class="announcement-sep">•</span>
      <span>Pilihan Ukuran Lengkap (Single, Queen, King, Super King, Extra King)</span>
      <span class="announcement-sep">•</span>
      <a href="https://wa.me/<?= e($waNumber) ?>?text=Halo%20Bedcover%20Susah%20Bangun%2C%20saya%20ingin%20tanya%20koleksi%20bedcover%20mewah" target="_blank" class="announcement-link">Konsultasi WA ➔</a>
    </div>
  </div>

  <!-- Main Header / Navigation -->
  <header class="main-header" id="mainHeader">
    <div class="container header-container">
      <!-- Brand Logo -->
      <a href="./" class="brand-logo" title="<?= e($appName) ?>">
        <img src="<?= e($logoUrl) ?>" alt="<?= e($appName) ?>" class="logo-img">
      </a>

      <!-- Quick Nav Links -->
      <nav class="header-nav">
        <button type="button" class="nav-link-btn active" id="navBtnCategories">Pilihan Kategori</button>
        <button type="button" class="nav-link-btn" id="navBtnProducts">Koleksi Bedcover</button>
      </nav>

      <!-- Header Actions: Search, Wishlist, Admin Link -->
      <div class="header-actions">
        <!-- Search Trigger Button -->
        <button type="button" class="action-btn" id="btnToggleSearch" title="Cari Bedcover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span class="btn-text-desktop">Cari</span>
        </button>

        <!-- Wishlist Button with Counter -->
        <button type="button" class="action-btn wishlist-btn" id="btnHeaderWishlist" title="Favorit Saya">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span class="btn-text-desktop">Favorit</span>
          <span class="wishlist-badge" id="wishlistCount">0</span>
        </button>
      </div>
    </div>
  </header>

  <!-- DEDICATED SEARCH BAR / SECTION (Collapsible) -->
  <section class="search-section" id="searchSection" style="display: none;">
    <div class="container">
      <div class="search-bar-card">
        <div class="search-input-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="mainSearchInput" placeholder="Cari nama bedcover, bahan (Tencel, Katun Jepang, Jacquard, Sutra), atau ukuran (King, Queen)..." autocomplete="off">
          <button type="button" id="btnClearSearch" class="btn-clear-search" style="display: none;">&times;</button>
        </div>
        <div class="quick-filter-tags">
          <span class="tag-label">Pencarian Populer:</span>
          <button type="button" class="quick-tag" data-search="Tencel">Sutra Tencel</button>
          <button type="button" class="quick-tag" data-search="Katun Jepang">Katun Jepang</button>
          <button type="button" class="quick-tag" data-search="Presidential">Presidential Suite</button>
          <button type="button" class="quick-tag" data-search="King">Ukuran King</button>
          <button type="button" class="quick-tag" data-search="Gold">Aksen Gold</button>
        </div>
      </div>
    </div>
  </section>

  <!-- HERO BANNER CAROUSEL -->
  <?php if (!empty($banners)): ?>
  <section class="hero-carousel-section" id="heroCarouselSection">
    <div class="carousel-container" id="heroCarousel">
      <div class="carousel-track" id="carouselTrack">
        <?php foreach ($banners as $index => $banner): ?>
          <div class="carousel-slide <?= $index === 0 ? 'active' : '' ?>">
            <div class="slide-bg" style="background-image: url('<?= e($banner['image']) ?>');"></div>
            <div class="slide-overlay"></div>
            <div class="container slide-content-container">
              <div class="slide-text-box">
                <div class="royal-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"></path></svg>
                  <span>EXCLUSIVE ROYAL BEDDING</span>
                </div>
                <h1 class="slide-title"><?= e($banner['title']) ?></h1>
                <?php if (!empty($banner['subtitle'])): ?>
                  <p class="slide-subtitle"><?= e($banner['subtitle']) ?></p>
                <?php endif; ?>
                <div class="slide-actions">
                  <a href="<?= e($banner['link'] ?? '#kategori') ?>" class="btn btn-luxury-primary btn-banner-explore">
                    <span><?= e(!empty($banner['button_text']) ? $banner['button_text'] : 'Jelajahi Koleksi') ?></span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>
                  <a href="https://wa.me/<?= e($waNumber) ?>?text=Halo%20Bedcover%20Susah%20Bangun%2C%20saya%20ingin%20konsultasi%20pemesanan%20bedcover" target="_blank" class="btn btn-luxury-outline">
                    <span>Konsultasi WA</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <?php if (count($banners) > 1): ?>
        <button type="button" class="carousel-arrow prev" id="carouselPrevBtn" aria-label="Slide Sebelumnya">&#10094;</button>
        <button type="button" class="carousel-arrow next" id="carouselNextBtn" aria-label="Slide Selanjutnya">&#10095;</button>
        <div class="carousel-dots" id="carouselDots">
          <?php foreach ($banners as $idx => $b): ?>
            <button type="button" class="dot <?= $idx === 0 ? 'active' : '' ?>" data-index="<?= $idx ?>"></button>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </section>
  <?php endif; ?>

  <!-- ==============================================================
       MAIN CATALOG VIEWS CONTAINER
       View A: Category Showcase (List of Categories Only)
       View B: Product Collection (List of Products inside selected Category)
       These views are mutually exclusive (NOT stacked top-and-bottom)
       ============================================================== -->
  <main class="main-catalog-area" id="mainCatalogArea">

    <!-- VIEW 1: CATEGORY LIST ONLY -->
    <section class="view-categories-section active" id="viewCategories">
      <div class="container">
        <div class="section-header-centered">
          <div class="luxury-crown-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="url(#goldGrad)"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z"></path></svg>
          </div>
          <h2 class="section-title">Pilihan Kategori Eksklusif</h2>
          <div class="gold-divider"></div>
          <p class="section-subtitle">Pilih salah satu kategori bedcover mewah di bawah ini untuk melihat koleksi produk di dalamnya</p>
        </div>

        <!-- Categories Grid -->
        <div class="categories-grid" id="categoriesGrid">
          <?php foreach ($categories as $cat): ?>
            <?php 
              $catName = is_array($cat) ? $cat['name'] : (string)$cat;
              $catImg = is_array($cat) ? ($cat['image'] ?? '') : '';
              $catDesc = is_array($cat) ? ($cat['description'] ?? '') : '';
              if (empty($catImg)) {
                  $catImg = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
              }
              $pCount = $categoryCounts[$catName] ?? 0;
            ?>
            <div class="category-card" data-category="<?= e($catName) ?>" role="button" tabindex="0" title="Buka Koleksi <?= e($catName) ?>">
              <div class="category-card-img-wrap">
                <img src="<?= e(format_image_url($catImg)) ?>" alt="<?= e($catName) ?>" class="category-card-img" loading="lazy" referrerpolicy="no-referrer">
                <div class="category-card-overlay"></div>
                <div class="category-product-count-badge">
                  <span><?= $pCount ?> Koleksi Produk</span>
                </div>
              </div>
              <div class="category-card-body">
                <h3 class="category-card-title"><?= e($catName) ?></h3>
                <?php if (!empty($catDesc)): ?>
                  <p class="category-card-desc"><?= e($catDesc) ?></p>
                <?php endif; ?>
                <div class="category-card-action">
                  <span>Lihat Produk Kategori Ini</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- VIEW 2: PRODUCT LIST (INSIDE CATEGORY) -->
    <section class="view-products-section" id="viewProducts" style="display: none;">
      <div class="container">
        <!-- Top Navigation Bar to return to Categories -->
        <div class="product-view-nav-bar">
          <button type="button" class="btn-back-categories" id="btnBackToCategories">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>← Kembali ke Daftar Kategori</span>
          </button>

          <div class="view-mode-tag">
            <span>Daftar Koleksi Produk</span>
          </div>
        </div>

        <!-- Category Banner & Info Header -->
        <div class="catalog-header-bar">
          <div class="catalog-title-wrap">
            <h2 class="catalog-title" id="catalogHeading">Semua Koleksi Bedcover</h2>
            <span class="catalog-count-pill" id="catalogCountPill"><?= count($products) ?> Produk</span>
          </div>

          <!-- Quick Category Switch Pills while in Product View -->
          <div class="catalog-filter-bar">
            <div class="category-pills-scroll" id="categoryPillsScroll">
              <button type="button" class="cat-pill active" data-category="all">Semua Kategori</button>
              <?php foreach ($categories as $cat): ?>
                <?php $catName = is_array($cat) ? $cat['name'] : (string)$cat; ?>
                <button type="button" class="cat-pill" data-category="<?= e($catName) ?>">
                  <?= e($catName) ?>
                  <span class="pill-num"><?= $categoryCounts[$catName] ?? 0 ?></span>
                </button>
              <?php endforeach; ?>
            </div>
          </div>
        </div>

        <!-- Active Category Indicator with Reset -->
        <div class="active-category-banner" id="activeCategoryBanner" style="display: none;">
          <div class="banner-left">
            <span class="banner-label">Kategori Aktif:</span>
            <span class="banner-cat-name" id="selectedCategoryName">Royal Tencel Silk</span>
          </div>
          <button type="button" class="btn btn-luxury-outline btn-xs" id="btnResetCategory">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>Tampilkan Semua Kategori</span>
          </button>
        </div>

        <!-- Products Grid (Interactive Cards) -->
        <div class="products-grid" id="productsGrid">
          <!-- Rendered via JavaScript for instant filtering & reactive size tags -->
        </div>

        <!-- Empty State -->
        <div class="empty-state" id="emptyState" style="display: none;">
          <div class="empty-icon">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 class="empty-title">Tidak ada produk yang cocok</h3>
          <p class="empty-desc">Coba gunakan kata kunci lain atau kembali ke pilihan kategori utama.</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 15px;">
            <button type="button" class="btn btn-luxury-primary" id="btnResetFilter">Tampilkan Semua Koleksi</button>
            <button type="button" class="btn btn-luxury-outline" id="btnEmptyBackCat">← Kembali ke Kategori</button>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER & LAYANAN INFO -->
  <footer class="main-footer" id="layanan">
    <div class="container footer-container">
      <div class="footer-col brand-col">
        <img src="<?= e($logoUrl) ?>" alt="<?= e($appName) ?>" class="footer-logo">
        <p class="footer-tagline"><?= e($appTagline) ?></p>
        <p class="footer-desc">Menghadirkan standar tidur mewah hotel bintang lima dan sentuhan sutra royal langsung ke kamar tidur Anda.</p>
      </div>

      <div class="footer-col">
        <h4 class="footer-title">Kategori Pilihan</h4>
        <ul class="footer-links">
          <?php foreach ($categories as $c): ?>
            <?php $cn = is_array($c) ? $c['name'] : (string)$c; ?>
            <li><a href="javascript:void(0)" class="footer-cat-link" data-category="<?= e($cn) ?>"><?= e($cn) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-title">Layanan</h4>
        <div class="contact-item">
          <span class="icon">📍</span>
          <span><?= e($address) ?></span>
        </div>
        <div class="contact-item">
          <span class="icon">⏰</span>
          <span><?= e($hours) ?></span>
        </div>
        <div class="contact-item">
          <span class="icon">💬</span>
          <a href="https://wa.me/<?= e($waNumber) ?>" target="_blank" class="contact-link">+<?= e($waNumber) ?> (WhatsApp Auto-Order)</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p>&copy; <?= date('Y') ?> <?= e($appName) ?>. All Rights Reserved. Luxury Bedding E-Catalog.</p>
        <div class="footer-social-row">
          <a href="<?= e($igUrl) ?>" target="_blank" rel="noopener" class="social-icon-btn" title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://wa.me/<?= e($waNumber) ?>" target="_blank" rel="noopener" class="social-icon-btn" title="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>

  <!-- STICKY FLOATING SOCIAL MEDIA BUTTONS (IG & WA) -->
  <div class="sticky-social-wrapper" id="stickySocials">
    <!-- Instagram Floating Button -->
    <a href="<?= e($igUrl) ?>" target="_blank" rel="noopener" class="sticky-btn ig" title="Kunjungi Instagram Kami">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      <span class="sticky-tooltip">Instagram</span>
    </a>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/<?= e($waNumber) ?>?text=Halo%20Bedcover%20Susah%20Bangun%2C%20saya%20tertarik%20dengan%20koleksi%20bedcover%20mewah%20Anda" target="_blank" rel="noopener" class="sticky-btn wa" title="Chat WhatsApp Layanan">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      <span class="sticky-tooltip">Chat WhatsApp</span>
    </a>
  </div>

  <!-- MODAL DETAIL PRODUCT (CENTERED ON SCREEN) -->
  <div class="modal-overlay" id="productDetailModal">
    <div class="modal-container modal-detail-container">
      <button type="button" class="btn-close-modal" id="btnCloseDetailModal" aria-label="Tutup Detail">&times;</button>

      <div class="modal-detail-content" id="modalDetailContent">
        <!-- Rendered dynamically via JavaScript -->
      </div>
    </div>
  </div>

  <!-- SVG Gradient Definitions for Icons -->
  <svg width="0" height="0" class="svg-defs">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE8A3"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#996515"/>
      </linearGradient>
    </defs>
  </svg>

  <!-- Initial Data for Frontend Client JS -->
  <script>
    window.CATALOG_DATA = {
      products: <?= json_encode($products, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>,
      categories: <?= json_encode($categories, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>,
      settings: <?= json_encode($settings, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>,
      waNumber: <?= json_encode($waNumber) ?>,
      baseUrl: <?= json_encode(base_url()) ?>
    };
  </script>

  <!-- Frontend Logic Scripts -->
  <script src="assets/js/app.js"></script>
</body>
</html>
