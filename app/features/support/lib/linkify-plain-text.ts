/**
 * 순수 텍스트를 안전한 HTML로 변환(이스케이프 → URL 링크 → 줄바꿈).
 * 이미 HTML인 본문에는 사용하지 않습니다.
 */
const URL_RE =
  /\b(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)'\]]*)\b|\b(www\.[^\s<>"']+[^\s<>"'.,;:!?)'\]]*)\b/gi;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function linkifyPlainTextToHtml(plain: string): string {
  const escaped = escapeHtml(plain);
  const linked = escaped.replace(URL_RE, (match, httpUrl: string | undefined, wwwUrl: string | undefined) => {
    const raw = (httpUrl ?? wwwUrl ?? match).trim();
    const href = raw.toLowerCase().startsWith("http") ? raw : `https://${raw}`;
    const safeHref = href.replace(/"/g, "&quot;");
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-[#02633E] underline underline-offset-2 break-all">${raw}</a>`;
  });
  return linked.replace(/\n/g, "<br/>");
}
