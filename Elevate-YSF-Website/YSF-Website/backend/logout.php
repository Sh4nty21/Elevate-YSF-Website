<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.', [], 405);
}

requireCsrf();

$_SESSION = [];
session_destroy();

sendResponse(true, 'Logged out successfully.');
