<?php
/**
 * ============================================================
 * CORE CONFIGURATION
 * ------------------------------------------------------------
 * Edit the placeholders below to match your hosting provider.
 * Every value can ALSO be set as a real environment variable
 * (recommended on hosts that support it) — the getenv() call
 * wins when the variable exists, otherwise the placeholder
 * string after "?:" is used.
 * ============================================================
 */

// ---- Database ----
define('DB_HOST', getenv('YSF_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('YSF_DB_NAME') ?: 'ysf_db');
define('DB_USER', getenv('YSF_DB_USER') ?: 'root');
define('DB_PASS', getenv('YSF_DB_PASS') ?: '');

// ---- Frontend origin (for CORS) ----
// If frontend + backend are on the SAME domain, this can stay as the
// placeholder — same-origin requests don't need CORS at all.
// If they are on DIFFERENT domains (e.g. frontend on Netlify, backend
// on Hostinger), put your exact frontend URL here, no trailing slash.
define('FRONTEND_ORIGIN', getenv('YSF_FRONTEND_ORIGIN') ?: 'https://your-frontend-domain.example');

// ---- Placeholder: pre-check-in destination link (e.g. Google Form) ----
// Currently unused — pre-check-in is fully handled by pre_checkin.php —
// but kept here in case you want to redirect somewhere after check-in.
define('PRE_CHECKIN_URL', getenv('YSF_PRE_CHECKIN_URL') ?: '#');

// ---- Placeholder: email/SMTP settings used by send_reminders.php ----
define('MAIL_FROM', getenv('YSF_MAIL_FROM') ?: 'no-reply@your-church-domain.example');
define('MAIL_FROM_NAME', getenv('YSF_MAIL_FROM_NAME') ?: 'Elevate YSF');
// PLACEHOLDER: if you use a transactional email API (SendGrid, Mailgun,
// Postmark, Brevo, etc) instead of PHP mail(), put the API key here and
// wire it up in send_reminders.php.
define('MAIL_API_KEY', getenv('YSF_MAIL_API_KEY') ?: '');

// ---- Secret key required to trigger send_reminders.php from a cron job ----
// Generate your own random string (e.g. https://www.uuidgenerator.net/) and
// put the SAME value in your cron job's URL as ?key=THAT_VALUE
define('CRON_SECRET', getenv('YSF_CRON_SECRET') ?: 'change-me-to-a-random-string');

// ---- Login attempt limiter ----
define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_SECONDS', 15 * 60); // 15 minutes

// ============================================================
// Do not edit below this line unless you know what you're doing
// ============================================================

// ---- CORS (only matters when frontend & backend are on different domains) ----
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($requestOrigin !== '' && (FRONTEND_ORIGIN === '*' || $requestOrigin === FRONTEND_ORIGIN)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Security headers ----
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

// ---- Session cookie hardening ----
// SameSite=None is required when frontend/backend are on different domains
// AND requires "secure" (HTTPS) to actually take effect in modern browsers.
// If everything runs on one domain, SameSite=Lax is simpler and safer.
$sameOrigin = (FRONTEND_ORIGIN === '*' || $requestOrigin === '' || $requestOrigin === ($_SERVER['HTTP_HOST'] ?? ''));
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => $isHttps ? 'None' : 'Lax',
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Create and return a PDO connection.
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        sendResponse(false, 'Database connection failed. Please try again later.', [], 500);
    }
}

/** Send a JSON response (always includes a fresh CSRF token) and stop. */
function sendResponse($success, $message, $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
        'csrf_token' => issueCsrfToken(),
    ], $data));
    exit;
}

/** Issue (or reuse) a per-session CSRF token. */
function issueCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/** Require a valid CSRF token on state-changing (POST) requests. */
function requireCsrf() {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || !hash_equals($expected, $sent)) {
        sendResponse(false, 'Your session expired. Please refresh the page and try again.', [], 419);
    }
}

/** Guard used by endpoints that require a logged-in user. */
function requireLogin() {
    if (empty($_SESSION['user_id'])) {
        sendResponse(false, 'You must be logged in to access this.', [], 401);
    }
}

/**
 * Log the real error on the server and send the visitor a generic message,
 * so database details, file paths and line numbers never reach the browser.
 */
function failWithServerError($e, $message = 'Something went wrong. Please try again later.') {
    error_log('[YSF] ' . get_class($e) . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    sendResponse(false, $message, [], 500);
}

/**
 * Brute-force protection: true when this username/email has failed
 * LOGIN_MAX_ATTEMPTS times from this IP within the last LOGIN_LOCKOUT_SECONDS.
 */
function isLoginLocked(PDO $pdo, $identifier, $ip) {
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM login_attempts
          WHERE identifier = :identifier
            AND ip_address = :ip
            AND success = 0
            AND attempted_at > (NOW() - INTERVAL :seconds SECOND)'
    );
    $stmt->execute([
        'identifier' => $identifier,
        'ip'         => $ip,
        'seconds'    => LOGIN_LOCKOUT_SECONDS,
    ]);
    return (int) $stmt->fetchColumn() >= LOGIN_MAX_ATTEMPTS;
}

/** Record a login attempt; a success clears earlier failures for this user + IP. */
function recordLoginAttempt(PDO $pdo, $identifier, $ip, $success) {
    if ($success) {
        $clear = $pdo->prepare('DELETE FROM login_attempts WHERE identifier = :identifier AND ip_address = :ip');
        $clear->execute(['identifier' => $identifier, 'ip' => $ip]);
    }
    $stmt = $pdo->prepare(
        'INSERT INTO login_attempts (identifier, ip_address, success) VALUES (:identifier, :ip, :success)'
    );
    $stmt->execute([
        'identifier' => $identifier,
        'ip'         => $ip,
        'success'    => $success ? 1 : 0,
    ]);
}

/** Decode a JSON POST body into an assoc array (falls back to $_POST). */
function jsonBody() {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}
