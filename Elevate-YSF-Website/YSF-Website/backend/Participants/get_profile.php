<?php

require_once "../config.php";

requireLogin();

try {

    $pdo = getDBConnection();

    $stmt = $pdo->prepare("
        SELECT
            full_name,
            birthdate,
            gender,
            school,
            contact_number,
            city,
            address,
            emergency_contact_name,
            emergency_contact_relationship,
            emergency_contact_number
        FROM users
        WHERE user_id = ?
        LIMIT 1
    ");

    $stmt->execute([$_SESSION['user_id']]);

    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        sendResponse(false, null, "Profile not found.");
    }

    sendResponse(true, [
        "profile" => $profile
    ]);

} catch (Exception $e) {

    failWithServerError($e, 'Could not load your profile. Please try again later.');

}