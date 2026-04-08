// lib/sanitize.ts
// DOMPurify는 브라우저 전용 — 서버에서는 기본 이스케이프 사용
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
