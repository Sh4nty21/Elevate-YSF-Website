<?php
require_once 'config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Invalid request method.', [], 405);
    }

    requireCsrf();

    $body = jsonBody();
    $identifier = trim($body['identifier'] ?? $body['username'] ?? '');
    $password   = $body['password'] ?? '';
    $ip         = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    if ($identifier === '' || $password === '') {
        sendResponse(false, 'Please enter your username/email and password.', [], 422);
    }

    $pdo = getDBConnection();

    // TEMP: Skip brute-force checking for debugging
    $stmt = $pdo->prepare("
    SELECT
        u.user_id,
        u.username,
        u.email,
        u.full_name,
        u.profile_photo,
        u.membership_status,
        u.role_id,
        r.role_name,
        u.password_hash
    FROM users u
    LEFT JOIN roles r
        ON u.role_id = r.role_id
    WHERE u.username = :username
       OR u.email = :email
    LIMIT 1
    ");

    $stmt->execute([
        'username' => $identifier,
        'email' => $identifier
    ]);

    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'Incorrect username/email or password.', [], 401);
    }

    if (!password_verify($password, $user['password_hash'])) {
        sendResponse(false, 'Incorrect username/email or password.', [], 401);
    }

    session_regenerate_id(true);

    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role_id'] = $user['role_id'];

    $_SESSION['full_name'] = $user['full_name'];

    $_SESSION['profile_photo'] = $user['profile_photo'];

    $_SESSION['membership_status'] = $user['membership_status'];
    $_SESSION['role_name'] = $user['role_name'];

    // Determine where the user should go after login
    switch ($user['role_name']) {

    case 'Core Admin':
        $redirect = '/admin';
        break;

    case 'Sports Admin':
        $redirect = '/sports';
        break;

    case 'DGroup Leader':
        $redirect = '/dgroup';
        break;

    default:
        $redirect = '/dashboard';
        break;
    }


    unset($user['password_hash']);

    sendResponse(true, 'Login successful!', [
    'redirect' => $redirect,
    'user' => $user
        ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);

    exit;
}