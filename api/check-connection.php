<?php
/**
 * Test Google Sheets and Drive Connection Status
 * Built for Bedcover Susah Bangun
 */

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/GoogleClient.php';
require_once __DIR__ . '/../includes/Auth.php';

if (!Auth::check()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Akses ditolak. Silakan login sebagai admin.'
    ]);
    exit;
}

try {
    $client = new GoogleClient();
    $status = $client->testConnection();

    echo json_encode([
        'success' => true,
        'data' => $status
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menguji koneksi: ' . $e->getMessage()
    ]);
}

