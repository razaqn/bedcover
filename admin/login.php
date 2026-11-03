<?php
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/../includes/SettingsRepository.php';

$settingsRepo = new SettingsRepository();
$settings = $settingsRepo->getAll();

$appName = $settings['app_name'] ?? 'Bedcover Susah Bangun';
$appTagline = $settings['app_tagline'] ?? 'Tidur Mewah & Nyenyak, Bangun Nanti Dulu ✨';
$logoUrl = $settings['logo_url'] ?? 'assets/images/logo.svg';

$error = '';

if (Auth::check()) {
    header('Location: ' . base_url('admin/'));
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = 'Silakan isi username dan password.';
    } elseif (Auth::attempt($username, $password)) {
        header('Location: ' . base_url('admin/'));
        exit;
    } else {
        $error = 'Username atau password salah. Silakan coba lagi.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>Login Admin | <?= e($appName) ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="admin-login-body">
  <div class="luxury-ambient-bg"></div>

  <div class="login-card-wrapper">
    <div class="login-card">
      <div class="login-header">
        <a href="../" class="login-logo-link">
          <img src="../<?= e($logoUrl) ?>" alt="<?= e($appName) ?>" class="login-logo-img">
        </a>
        <h1 class="login-title">Portal Admin Eksklusif</h1>
        <p class="login-subtitle">Masuk untuk mengelola katalog, kategori, dan banner</p>
      </div>

      <?php if (!empty($error)): ?>
        <div class="login-alert error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span><?= e($error) ?></span>
        </div>
      <?php endif; ?>

      <form action="login" method="POST" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <div class="input-with-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input type="text" id="username" name="username" class="form-control" placeholder="Masukkan username" value="<?= e($_POST['username'] ?? 'admin') ?>" required autofocus>
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-with-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input type="password" id="password" name="password" class="form-control" placeholder="Masukkan password" value="password123" required>
          </div>
        </div>

        <button type="submit" class="btn btn-luxury-primary btn-block">
          <span>Masuk ke Dashboard</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </form>

      <div class="login-footer">
        <a href="../" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali ke Katalog Publik
        </a>
      </div>
    </div>
  </div>
</body>
</html>

