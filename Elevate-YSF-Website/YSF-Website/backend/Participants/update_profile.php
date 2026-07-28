<?php

require_once "../config.php";

requireLogin();
requireCsrf();

try {

    $data = jsonBody();

    $pdo = getDBConnection();

    $stmt = $pdo->prepare("
        UPDATE users
        SET
            full_name = ?,
            birthdate = ?,
            gender = ?,
            school = ?,
            contact_number = ?,
            city = ?,
            address = ?,
            emergency_contact_name = ?,
            emergency_contact_relationship = ?,
            emergency_contact_number = ?
        WHERE user_id = ?
    ");

    $stmt->execute([

        trim($data['full_name']),
        $data['birthdate'],
        $data['gender'],
        trim($data['school']),
        trim($data['contact_number']),
        trim($data['city']),
        trim($data['address']),
        trim($data['emergency_contact_name']),
        trim($data['emergency_contact_relationship']),
        trim($data['emergency_contact_number']),

        $_SESSION['user_id']

    ]);

    sendResponse(
        true,
        "Profile updated successfully."
    );

} catch (Exception $e) {

    sendResponse(
        false,
        null,
        $e->getMessage()
    );

}