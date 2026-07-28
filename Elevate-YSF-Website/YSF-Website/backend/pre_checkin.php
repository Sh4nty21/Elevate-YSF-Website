<?php
/**
 * PRE-CHECK-IN
 * ------------------------------------------------------------
 * Enforces the capacity rules the ministry needs:
 *   - Basketball: 50 max
 *   - Volleyball / Badminton: 36 max (adjustable any time in the
 *     `sports` table's `capacity` column — no code change needed)
 * The sport row is locked (SELECT ... FOR UPDATE) inside a
 * transaction so two people checking in for the last open spot
 * at the same instant can't both get accepted.
 */
require_once 'config.php';
require_once 'schedule.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.', [], 405);
}

requireCsrf();

$body = jsonBody();
$sportId = (int)($body['sport_id'] ?? 0);
$userId  = $_SESSION['user_id'];
$sessionDate = nextSessionDate();

if ($sportId <= 0) {
    sendResponse(false, 'Please choose a sport.', [], 422);
}

$pdo = getDBConnection();

try {
    $pdo->beginTransaction();

    // Lock this sport's row so concurrent check-ins for the same sport
    // are processed one at a time until the transaction commits.
    $stmt = $pdo->prepare('SELECT sport_id, sport_name, capacity FROM sports WHERE sport_id = :id FOR UPDATE');
    $stmt->execute(['id' => $sportId]);
    $sport = $stmt->fetch();

    if (!$sport) {
        $pdo->rollBack();
        sendResponse(false, 'That sport does not exist.', [], 404);
    }

    // Already checked in for this sport this Saturday?
    $stmt = $pdo->prepare(
        "SELECT checkin_id FROM pre_checkins
         WHERE user_id = :uid AND sport_id = :sid AND session_date = :date AND status = 'confirmed'"
    );
    $stmt->execute(['uid' => $userId, 'sid' => $sportId, 'date' => $sessionDate]);
    if ($stmt->fetch()) {
        $pdo->rollBack();
        sendResponse(false, "You're already checked in for {$sport['sport_name']} this Saturday.", [], 409);
    }

    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS total FROM pre_checkins
         WHERE sport_id = :sid AND session_date = :date AND status = 'confirmed'"
    );
    $stmt->execute(['sid' => $sportId, 'date' => $sessionDate]);
    $count = (int)$stmt->fetch()['total'];

    if ($count >= (int)$sport['capacity']) {
        $pdo->rollBack();
        // This is the required "sport is full" alert.
        sendResponse(false, "Sorry, {$sport['sport_name']} is already full for this Saturday ({$sport['capacity']}/{$sport['capacity']} spots taken). Please choose a different sport.", [
            'full' => true,
        ], 409);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO pre_checkins (user_id, sport_id, session_date, status)
         VALUES (:uid, :sid, :date, 'confirmed')"
    );
    $stmt->execute(['uid' => $userId, 'sid' => $sportId, 'date' => $sessionDate]);

    // Make sure the member shows this sport under "My Sports" on the dashboard
    $stmt = $pdo->prepare(
        'INSERT IGNORE INTO user_sports (user_id, sport_id) VALUES (:uid, :sid)'
    );
    $stmt->execute(['uid' => $userId, 'sid' => $sportId]);

    $pdo->commit();

    $spotsLeft = (int)$sport['capacity'] - ($count + 1);
    sendResponse(true, "You're checked in for {$sport['sport_name']} this Saturday, 1:00-5:00 PM! ({$spotsLeft} spots left)", [
        'sport_id' => $sportId,
        'session_date' => $sessionDate,
        'spots_left' => $spotsLeft,
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendResponse(false, 'Something went wrong recording your check-in. Please try again.', [], 500);
}
