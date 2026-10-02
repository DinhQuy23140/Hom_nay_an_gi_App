const vndFormatter = new Intl.NumberFormat('vi-VN');

/** 45000 → "45.000đ" */
export function formatVnd(value: number): string {
  return `${vndFormatter.format(value)}đ`;
}

/** 45000 → "45k" */
export function formatK(value: number): string {
  return `${Math.round(value / 1000)}k`;
}

/** (35000, 70000) → "35–70k" */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatK(min);
  return `${Math.round(min / 1000)}–${formatK(max)}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Thời gian tương đối ngắn gọn: "vừa xong", "5 phút", "2 giờ", "3 ngày", "12/9". */
export function formatRelativeTime(date: Date, now = new Date()): string {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return 'vừa xong';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút trước`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} giờ trước`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} ngày trước`;
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
