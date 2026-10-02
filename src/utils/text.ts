/** Bỏ dấu tiếng Việt và chuyển về chữ thường để so khớp ("Bún chả" → "bun cha"). */
export function normalizeVi(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}
