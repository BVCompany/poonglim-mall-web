/**
 * 관리자에서 입력한 본문을 화면용 HTML로 변환합니다.
 * 이미 HTML인 값은 유지하고, 일반 텍스트는 이스케이프한 뒤 URL과 줄바꿈을 보존합니다.
 */
const URL_RE =
  /\b(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)'\]]*)\b|\b(www\.[^\s<>"']+[^\s<>"'.,;:!?)'\]]*)\b/gi;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function containsHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function linkifyPlainTextToHtml(plain: string): string {
  const escaped = escapeHtml(plain);
  const linked = escaped.replace(
    URL_RE,
    (match, httpUrl: string | undefined, wwwUrl: string | undefined) => {
      const raw = (httpUrl ?? wwwUrl ?? match).trim();
      const href = raw.toLowerCase().startsWith("http") ? raw : `https://${raw}`;
      const safeHref = href.replace(/"/g, "&quot;");
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-[#02633E] underline underline-offset-2 break-all">${raw}</a>`;
    },
  );
  return linked.replace(/\n/g, "<br/>");
}

export function adminContentToHtml(content: string): string {
  if (containsHtml(content.trim())) return content;
  return linkifyPlainTextToHtml(content);
}
