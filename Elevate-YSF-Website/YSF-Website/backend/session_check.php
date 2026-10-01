<?php
require_once 'config.php';

if (empty($_SESSION['user_id'])) {
    sendResponse(false, 'No active session.', [], 401);
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("
SELECT
    u.user_id,
    u.username,
    u.email,
    u.full_name,
    u.profile_photo,
    u.membership_status,
    u.role_id,
    r.role_name
FROM users u
LEFT JOIN roles r
ON u.role_id = r.role_id
WHERE u.user_id = :id
");
$stmt->execute(['id' => $_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    // Account was deleted after the session was created
    $_SESSION = [];
    session_destroy();
    sendResponse(false, 'Session no longer valid.', [], 401);
}


// Refresh session data with the latest values from the database
$_SESSION['role_id'] = $user['role_id'];
$_SESSION['role_name'] = $user['role_name'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['profile_photo'] = $user['profile_photo'];

sendResponse(true, 'Session active.', [
    'user' => $user
]);

