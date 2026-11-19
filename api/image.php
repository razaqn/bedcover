<?php
/**
 * Authorized Google Drive Image & Media Streaming Proxy
 * Supports HTTP 206 Partial Content Byte-Range Video Streaming (MP4/MOV/WEBM)
 * Bypasses Google hotlinking blocks and HTTP 429 Too Many Requests
 * Built for Bedcover Susah Bangun
 */

@ini_set('display_errors', '0');

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/GoogleClient.php';

// Close session early and remove PHP default no-cache headers so media streams cleanly
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}
@header_remove('Pragma');
@header_remove('Expires');
@header_remove('Set-Cookie');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Range');
header('Access-Control-Expose-Headers: Content-Range, Content-Length, Accept-Ranges');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

$rangeHeader = trim($_SERVER['HTTP_RANGE'] ?? '');
$etag = '"' . md5($fileId . ($rangeHeader ?: 'full')) . '"';
header('ETag: ' . $etag);
header('Accept-Ranges: bytes');
header('Content-Disposition: inline');

if (!empty($rangeHeader)) {
    header('Vary: Range');
    header('Cache-Control: public, max-age=3600');
} else {
    header('Cache-Control: public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }
}

try {
    $googleClient = new GoogleClient();
    $token = $googleClient->getAccessToken();
} catch (Exception $e) {
    $token = null;
}

if (!$token) {
    // Fallback if no Google token available
    header("Location: https://drive.google.com/uc?export=view&id={$fileId}");
    exit;
}

$url = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media";

$requestHeaders = [
    'Authorization: Bearer ' . $token
];

// Forward Range header and cap open-ended/large chunks to 3MB (safely under Vercel 4.5MB limit)
if (!empty($rangeHeader)) {
    if (preg_match('/bytes=(\d+)-(\d*)/i', $rangeHeader, $rm)) {
        $start = (int)$rm[1];
        $end = ($rm[2] !== '') ? (int)$rm[2] : null;
        $maxChunk = 3 * 1024 * 1024; // 3MB chunk size
        if ($end === null || ($end - $start + 1) > $maxChunk) {
            $end = $start + $maxChunk - 1;
        }
        $requestHeaders[] = "Range: bytes={$start}-{$end}";
    } else {
        $requestHeaders[] = 'Range: ' . $rangeHeader;
    }
}

$isHead = ($_SERVER['REQUEST_METHOD'] === 'HEAD');

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_HTTPHEADER, $requestHeaders);
if ($isHead) {
    curl_setopt($ch, CURLOPT_NOBODY, true);
}

// Stream status code, content-type and range headers BEFORE body output begins
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) {
    $len = strlen($header);
    $trimmed = trim($header);
    if ($trimmed === '') {
        return $len;
    }

    // Set HTTP status code (200 or 206 Partial Content) before body bytes are flushed
    if (preg_match('/^HTTP\/[0-9.]+\s+(\d+)/i', $trimmed, $m)) {
        $code = (int)$m[1];
        if (($code === 200 || $code === 206) && !headers_sent()) {
            http_response_code($code);
        }
        return $len;
    }

    $headerParts = explode(':', $trimmed, 2);
    if (count($headerParts) === 2 && !headers_sent()) {
        $name = strtolower(trim($headerParts[0]));
        $value = trim($headerParts[1]);

        if ($name === 'content-type') {
            // Normalize QuickTime (.mov) / M4V to video/mp4 for universal HTML5 <video> playback
            $lowerVal = strtolower($value);
            if (str_contains($lowerVal, 'video/quicktime') || str_contains($lowerVal, 'video/x-m4v') || str_contains($lowerVal, 'video/mov')) {
                header('Content-Type: video/mp4');
            } else {
                header('Content-Type: ' . $value);
            }
        } elseif (in_array($name, ['content-length', 'content-range', 'accept-ranges'])) {
            header($trimmed);
        }
    }
    return $len;
});

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!headers_sent() && ($httpCode >= 400 || $result === false)) {
    // Fallback: redirect if proxy call fails before headers were sent
    header("Location: https://drive.google.com/uc?export=view&id={$fileId}");
    exit;
}
