<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.', [], 405);
}

requireCsrf();

$body = jsonBody();

$fullName = trim($body['full_name'] ?? '');
$username = trim($body['username'] ?? '');
$email    = trim($body['email'] ?? '');
$password = $body['password'] ?? '';
$honeypot = trim($body['website'] ?? ''); // must stay empty — bots tend to fill every field

// Silently pretend success to bots without touching the database
if ($honeypot !== '') {
    sendResponse(true, 'Account created successfully! You can now log in.');
}

$fieldErrors = [];

if (mb_strlen($fullName) < 2) {
    $fieldErrors['fullName'] = 'Enter your full name.';
}
if (!preg_match('/^[A-Za-z0-9_.]{3,30}$/', $username)) {
    $fieldErrors['username'] = '3-30 characters: letters, numbers, dot or underscore only.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $fieldErrors['email'] = 'Enter a valid email address.';
}
if (strlen($password) < 8) {
    $fieldErrors['password'] = 'Use at least 8 characters.';
}

if ($fieldErrors) {
    sendResponse(false, 'Please fix the highlighted fields.', ['field_errors' => $fieldErrors], 422);
}

$pdo = getDBConnection();

$stmt = $pdo->prepare('SELECT user_id FROM users WHERE username = :username OR email = :email');
$stmt->execute(['username' => $username, 'email' => $email]);
if ($stmt->fetch()) {
    sendResponse(false, 'That username or email is already registered.', [], 409);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO users (username, email, password_hash, full_name)
     VALUES (:username, :email, :password_hash, :full_name)'
);
$stmt->execute([
    'username'      => $username,
    'email'         => $email,
    'password_hash' => $passwordHash,
    'full_name'     => $fullName,
]);

sendResponse(true, 'Account created successfully! You can now log in.');
