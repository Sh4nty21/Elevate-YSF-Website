<?php

require_once "../config.php";

requireLogin();

try {

    $pdo = getDBConnection();

    $sql = "
        SELECT
            u.user_id,
            u.full_name,
            u.email,
            u.membership_status,
            s.sport_name,
            d.group_name

        FROM users u

        LEFT JOIN user_sports us
            ON u.user_id = us.user_id

        LEFT JOIN sports s
            ON us.sport_id = s.sport_id

        LEFT JOIN dgroups d
            ON u.dgroup_id = d.dgroup_id

        INNER JOIN roles r
            ON u.role_id = r.role_id

        WHERE r.role_name = 'Participant'

        ORDER BY u.full_name ASC
    ";

    $stmt = $pdo->query($sql);

    $participants = $stmt->fetchAll();

    sendResponse(
        true,
        "Participants loaded successfully.",
        [
            "participants" => $participants
        ]
    );

} catch (PDOException $e) {

    failWithServerError($e, 'Could not load participants. Please try again later.');

}