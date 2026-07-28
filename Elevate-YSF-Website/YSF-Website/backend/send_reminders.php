<?php
/**
 * SATURDAY SESSION REMINDER
 * ------------------------------------------------------------
 * Meant to be triggered by a free cron service (see DEPLOYMENT.md),
 * e.g. every Friday at 6:00 PM, hitting:
 *   https://yourdomain.example/backend/send_reminders.php?key=YOUR_CRON_SECRET
 *
 * It emails everyone with a confirmed pre-check-in for the coming
 * Saturday. Swap the mail() call for a transactional email API
 * (SendGrid/Mailgun/Brevo/etc) using MAIL_API_KEY from config.php
 * if your host blocks PHP's mail() function — most free hosts do.
 */
require_once 'config.php';
require_once 'schedule.php';

header('Content-Type: application/json');

$key = $_GET['key'] ?? '';
if (!hash_equals(CRON_SECRET, $key)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing cron key.']);
    exit;
}

$pdo = getDBConnection();
$sessionDate = nextSessionDate();
$sessionLabel = (new DateTime($sessionDate))->format('l, F j');

$stmt = $pdo->prepare(
    "SELECT u.email, u.full_name, GROUP_CONCAT(s.sport_name SEPARATOR ', ') AS sports
     FROM pre_checkins pc
     JOIN users u  ON pc.user_id = u.user_id
     JOIN sports s ON pc.sport_id = s.sport_id
     WHERE pc.session_date = :date AND pc.status = 'confirmed'
     GROUP BY u.user_id"
);
$stmt->execute(['date' => $sessionDate]);
$recipients = $stmt->fetchAll();

$sent = 0;
$failed = 0;

foreach ($recipients as $r) {
    $subject = "Reminder: Elevate YSF this {$sessionLabel}, 1-5 PM";
    $body = "Hi {$r['full_name']},\n\n"
        . "This is a reminder that you're checked in for {$r['sports']} this "
        . "{$sessionLabel} from 1:00 PM to 5:00 PM.\n\n"
        . "See you on the court!\n- Elevate YSF Team";

    $headers = 'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM . ">\r\n";

    // PLACEHOLDER: if MAIL_API_KEY is set, call your email API's HTTP
    // endpoint here instead of mail(). Left as PHP mail() by default
    // since it needs no extra service to get started, but many hosts
    // disable it — check DEPLOYMENT.md for free alternatives.
    $ok = @mail($r['email'], $subject, $body, $headers);
    $ok ? $sent++ : $failed++;
}

echo json_encode([
    'success' => true,
    'message' => "Reminders processed for {$sessionLabel}.",
    'sent' => $sent,
    'failed' => $failed,
    'total_recipients' => count($recipients),
]);
