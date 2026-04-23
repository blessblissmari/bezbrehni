/**
 * Определение «значимого» контентного блока под курсором.
 * Ищем ближайшего родителя — p / article / li / blockquote / заголовок / комментарий,
 * у которого достаточно текстового содержимого.
 */
const CANDIDATE_SELECTORS = [
  "article",
  "section",
  "p",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  ".comment",
  "[role='article']",
  "[itemprop='articleBody']",
];

export function findContentBlock(el: Element | null): HTMLElement | null {
  if (!el) return null;
  let cur: Element | null = el;
  let depth = 0;
  while (cur && depth < 10) {
    const node: Element = cur;
    if (node instanceof HTMLElement && matchesCandidate(node)) {
      const text = (node.innerText || node.textContent || "").trim();
      const tag = node.tagName.toLowerCase();
      const isControl = ["button", "input", "textarea", "select", "nav", "header", "footer"].includes(tag);
      if (!isControl && text.length >= 40 && text.length <= 20000) {
        return node;
      }
    }
    cur = node.parentElement;
    depth += 1;
  }
  return null;
}

function matchesCandidate(el: Element): boolean {
  for (const sel of CANDIDATE_SELECTORS) {
    try {
      if (el.matches(sel)) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

export function extractText(el: HTMLElement): string {
  const t = (el.innerText || el.textContent || "").trim();
  // Схлопываем лишние пустые строки
  return t.replace(/\n{3,}/g, "\n\n").slice(0, 12000);
}

export function extractContext(el: HTMLElement): { url: string; title: string } {
  return {
    url: location.href,
    title: document.title || "",
  };
}
