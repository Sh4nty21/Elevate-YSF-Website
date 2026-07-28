<?php
/**
 * Mirrors frontend/js/schedule.js — the ministry runs ONE recurring
 * slot: every Saturday, 1:00 PM - 5:00 PM. This returns the date
 * (Y-m-d) of the next upcoming session, which is what pre-check-ins
 * and capacity counts are keyed against.
 */
function nextSessionDate(): string {
    $now = new DateTime('now');
    $dayOfWeek = (int)$now->format('w'); // 0=Sun ... 6=Sat
    $daysUntilSaturday = (6 - $dayOfWeek + 7) % 7;

    $sessionDate = clone $now;
    $sessionDate->setTime(0, 0, 0);
    $sessionDate->modify("+{$daysUntilSaturday} days");

    if ($daysUntilSaturday === 0) {
        $sessionEnd = clone $sessionDate;
        $sessionEnd->setTime(17, 0, 0);
        if ($now > $sessionEnd) {
            $sessionDate->modify('+7 days');
        }
    }

    return $sessionDate->format('Y-m-d');
}
