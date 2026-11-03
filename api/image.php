<?php
/**
 * Authorized Google Drive Image & Media Streaming Proxy
 * Bypasses Google hotlinking blocks and HTTP 429 Too Many Requests
 * Built for Bedcover Susah Bangun
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/GoogleClient.php';

$fileId = trim($_GET['id'] ?? '');

if (empty($fileId) && !empty($_GET['url'])) {
    $url = trim($_GET['url']);
    if (preg_match('/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/', $url, $matches)) {
        $fileId = $matches[1];
    }
}

if (!$fileId) {
    http_response_code(400);
    header('Content-Type: text/plain');
    echo "ID file tidak disertakan.";
    exit;
}

// Sanitize file ID (Google Drive IDs are alphanumeric with underscores and hyphens)
$fileId = preg_replace('/[^a-zA-Z0-9_-]/', '', $fileId);

$etag = '"' . md5($fileId) . '"';
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');

if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
    http_response_code(304);
    exit;
}

$googleClient = new GoogleClient();
$token = $googleClient->getAccessToken();

if (!$token) {
    // If no Google token, redirect to public Google Drive thumbnail link
    header("Location: https://drive.google.com/thumbnail?id={$fileId}&sz=w1200");
    exit;
}

$url = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media";

$requestHeaders = [
    'Authorization: Bearer ' . $token
];
if (!empty($_SERVER['HTTP_RANGE'])) {
    $requestHeaders[] = 'Range: ' . $_SERVER['HTTP_RANGE'];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_HTTPHEADER, $requestHeaders);

// Stream content-type and range headers from Google response
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) {
    $len = strlen($header);
    $headerParts = explode(':', $header, 2);
    if (count($headerParts) == 2) {
        $name = strtolower(trim($headerParts[0]));
        if (in_array($name, ['content-type', 'content-length', 'content-disposition', 'accept-ranges', 'content-range'])) {
            header($header);
        }
    }
    return $len;
});

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 206) {
    http_response_code(206);
} elseif ($httpCode >= 400 || $result === false) {
    // Fallback: redirect if proxy call fails
    header("Location: https://drive.google.com/uc?export=view&id={$fileId}");
    exit;
}

