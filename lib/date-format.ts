const ADMIN_LOCALE = "en-GB";
const ADMIN_TIME_ZONE = "Asia/Kolkata";

export function formatAdminDate(value: string | Date) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ADMIN_TIME_ZONE,
  }).format(new Date(value));
}

export function formatAdminDateTime(value: string | Date) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: ADMIN_TIME_ZONE,
  }).format(new Date(value));
}
