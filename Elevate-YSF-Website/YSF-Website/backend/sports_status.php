<?php
require_once 'config.php';
require_once 'schedule.php';

$pdo = getDBConnection();
$sessionDate = nextSessionDate();

$stmt = $pdo->prepare(
    "SELECT s.sport_id, s.sport_name, s.icon_class, s.capacity, s.tagline,
            COUNT(pc.checkin_id) AS checked_in
     FROM sports s
     LEFT JOIN pre_checkins pc
            ON pc.sport_id = s.sport_id
           AND pc.session_date = :session_date
           AND pc.status = 'confirmed'
     GROUP BY s.sport_id
     ORDER BY s.sport_name"
);
$stmt->execute(['session_date' => $sessionDate]);
$rows = $stmt->fetchAll();

$sports = array_map(function ($r) {
    $capacity = (int)$r['capacity'];
    $checkedIn = (int)$r['checked_in'];
    return [
        'sport_id'    => (int)$r['sport_id'],
        'sport_name'  => $r['sport_name'],
        'icon_class'  => $r['icon_class'],
        'tagline'     => $r['tagline'],
        'capacity'    => $capacity,
        'checked_in'  => $checkedIn,
        'spots_left'  => max(0, $capacity - $checkedIn),
    ];
}, $rows);

sendResponse(true, 'Sports status loaded.', ['sports' => $sports, 'session_date' => $sessionDate]);
