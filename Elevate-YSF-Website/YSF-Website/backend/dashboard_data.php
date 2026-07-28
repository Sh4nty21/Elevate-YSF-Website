<?php
require_once 'config.php';
require_once 'schedule.php';
requireLogin();

$pdo    = getDBConnection();
$userId = $_SESSION['user_id'];

// ---- Profile + D-Group + Leader ----
$stmt = $pdo->prepare(
    'SELECT
        u.user_id, u.username, u.full_name, u.email, u.profile_photo,
        u.membership_status, u.created_at,
        dg.group_name,
        dl.full_name  AS leader_name,
        dl.photo      AS leader_photo,
        dl.contact_number AS leader_contact,
        dl.email      AS leader_email
     FROM users u
     LEFT JOIN dgroups dg        ON u.dgroup_id = dg.dgroup_id
     LEFT JOIN dgroup_leaders dl ON dg.leader_id = dl.leader_id
     WHERE u.user_id = :user_id'
);
$stmt->execute(['user_id' => $userId]);
$profile = $stmt->fetch();

if (!$profile) {
    sendResponse(false, 'User not found.', [], 404);
}

// ---- Sports the member is engaged in ----
$stmt = $pdo->prepare(
    'SELECT s.sport_id, s.sport_name, s.icon_class, us.date_joined
     FROM user_sports us
     JOIN sports s ON us.sport_id = s.sport_id
     WHERE us.user_id = :user_id
     ORDER BY s.sport_name'
);
$stmt->execute(['user_id' => $userId]);
$sports = $stmt->fetchAll();

// ---- Attendance history (most recent first) ----
$stmt = $pdo->prepare(
    'SELECT a.attendance_date, a.status, s.sport_name
     FROM attendance a
     LEFT JOIN sports s ON a.sport_id = s.sport_id
     WHERE a.user_id = :user_id
     ORDER BY a.attendance_date DESC
     LIMIT 10'
);
$stmt->execute(['user_id' => $userId]);
$attendance = $stmt->fetchAll();

// ---- Attendance rate ----
$stmt = $pdo->prepare(
    "SELECT COUNT(*) AS total, SUM(status = 'Present') AS present_count
     FROM attendance WHERE user_id = :user_id"
);
$stmt->execute(['user_id' => $userId]);
$stats = $stmt->fetch();
$attendanceRate = ($stats && $stats['total'] > 0)
    ? round(($stats['present_count'] / $stats['total']) * 100)
    : 0;

// ---- Sports already pre-checked-in for the upcoming Saturday ----
$sessionDate = nextSessionDate();
$stmt = $pdo->prepare(
    "SELECT sport_id FROM pre_checkins
     WHERE user_id = :user_id AND session_date = :date AND status = 'confirmed'"
);
$stmt->execute(['user_id' => $userId, 'date' => $sessionDate]);
$upcomingCheckins = array_map(fn($r) => (int)$r['sport_id'], $stmt->fetchAll());

sendResponse(true, 'Dashboard data loaded.', [
    'profile' => [
        'user_id'           => $profile['user_id'],
        'username'          => $profile['username'],
        'full_name'         => $profile['full_name'],
        'email'             => $profile['email'],
        'profile_photo'     => $profile['profile_photo'],
        'membership_status' => $profile['membership_status'],
        'member_since'      => date('M j, Y', strtotime($profile['created_at'])),
    ],
    'dgroup' => [
        'group_name'     => $profile['group_name'],
        'leader_name'    => $profile['leader_name'],
        'leader_photo'   => $profile['leader_photo'],
        'leader_contact' => $profile['leader_contact'],
        'leader_email'   => $profile['leader_email'],
    ],
    'sports'            => $sports,
    'attendance'        => $attendance,
    'attendance_rate'   => $attendanceRate,
    'upcoming_checkins' => $upcomingCheckins,
    'session_date'      => $sessionDate,
]);
