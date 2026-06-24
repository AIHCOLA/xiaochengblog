import type { ReactNode } from 'react';

/** Map of language display names — add more as needed */
const LANGUAGE_NAMES: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  jsx: 'JSX',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  xml: 'XML',
  md: 'Markdown',
  markdown: 'Markdown',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  python: 'Python',
  py: 'Python',
  rust: 'Rust',
  rs: 'Rust',
  go: 'Go',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  sql: 'SQL',
  graphql: 'GraphQL',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  toml: 'TOML',
  ini: 'INI',
  diff: 'Diff',
  text: 'Text',
};

export function languageDisplayName(lang: string): string {
  return LANGUAGE_NAMES[lang.toLowerCase()] || lang;
}

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2, 3, or 4
}

/**
 * Generate a URL-friendly id from heading text.
 * Works for both English and Chinese.
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Extract headings (h2-h4) from markdown content.
 */
export function extractHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/\\/g, '');
    const id = generateHeadingId(text);
    items.push({ id, text, level });
  }

  return items;
}

/**
 * Extract plain text from React children — used inside
 * react-markdown custom heading renderers to compute IDs.
 */
export function getTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as { props?: { children?: ReactNode } }).props;
    if (props && 'children' in props) {
      return getTextFromChildren(props.children);
    }
  }
  return '';
}
