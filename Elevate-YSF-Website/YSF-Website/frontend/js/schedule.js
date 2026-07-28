// ============================================================
// SCHEDULE UTILITIES
// ------------------------------------------------------------
// The whole ministry runs on ONE recurring slot: every Saturday,
// 1:00 PM - 5:00 PM. Everything reminder-related (dashboard
// banner, homepage strip, pre-check-in modal, capacity checks
// on the backend) keys off this single source of truth.
// ============================================================

export const SESSION_DAY = 6; // 0=Sun ... 6=Saturday
export const SESSION_START_HOUR = 13; // 1 PM
export const SESSION_END_HOUR = 17; // 5 PM

/** Returns the Date of the next session start (today if it's Saturday
 *  and the session hasn't ended yet). */
export function nextSessionDate(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const dayDiff = (SESSION_DAY - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + dayDiff);

  const sessionEnd = new Date(d);
  sessionEnd.setHours(SESSION_END_HOUR, 0, 0, 0);

  if (dayDiff === 0 && from > sessionEnd) {
    d.setDate(d.getDate() + 7);
  }
  return d;
}

/** ISO date string (YYYY-MM-DD) for the upcoming session — used as the
 *  key that ties a pre-check-in to a specific Saturday. */
export function nextSessionISO(from = new Date()) {
  const d = nextSessionDate(from);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function formatSessionLabel(from = new Date()) {
  const d = nextSessionDate(from);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Countdown pieces (days/hours/minutes/seconds) until session start. */
export function countdownParts(from = new Date()) {
  const d = nextSessionDate(from);
  d.setHours(SESSION_START_HOUR, 0, 0, 0);
  let diff = Math.max(0, d.getTime() - from.getTime());

  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds };
}

export function isHappeningNow(from = new Date()) {
  const day = from.getDay();
  const hour = from.getHours();
  return day === SESSION_DAY && hour >= SESSION_START_HOUR && hour < SESSION_END_HOUR;
}
