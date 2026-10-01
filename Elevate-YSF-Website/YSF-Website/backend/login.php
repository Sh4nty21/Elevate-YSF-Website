<?php
require_once 'config.php';

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

    // Brute-force protection (LOGIN_MAX_ATTEMPTS / LOGIN_LOCKOUT_SECONDS in config.php).
    // Column is VARCHAR(100), so store at most 100 characters of what was typed.
    $attemptKey = substr($identifier, 0, 100);
    if (isLoginLocked($pdo, $attemptKey, $ip)) {
        sendResponse(false, 'Too many failed attempts. Please wait 15 minutes and try again.', [], 429);
    }

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

    // Same message for an unknown user and a wrong password, so attackers
    // can't tell which usernames exist.
    if (!$user || !password_verify($password, $user['password_hash'])) {
        recordLoginAttempt($pdo, $attemptKey, $ip, false);
        sendResponse(false, 'Incorrect username/email or password.', [], 401);
    }

    recordLoginAttempt($pdo, $attemptKey, $ip, true);
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
    failWithServerError($e, 'Login is unavailable right now. Please try again later.');
}