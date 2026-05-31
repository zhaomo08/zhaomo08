export interface TokenEstimate {
  characters: number
  words: number
  cjkCharacters: number
  tokens: number
}

export function estimateTokens(text: string): TokenEstimate {
  const characters = [...text].length;
  const words = text.trim().match(/[A-Za-z0-9_]+(?:['-][A-Za-z0-9_]+)?/g)?.length ?? 0;
  const cjkCharacters = text.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g)?.length ?? 0;
  const nonCjkCharacters = Math.max(0, characters - cjkCharacters);

  return {
    characters,
    words,
    cjkCharacters,
    tokens: Math.max(0, Math.ceil(nonCjkCharacters / 4 + cjkCharacters * 1.15)),
  };
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 4 : 6,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;

  return `${formatNumber(value, value >= 100 ? 1 : 2)} ${units[power]}`;
}

export function costForMillionTokens(tokens: number, dollarsPerMillion: number) {
  return tokens / 1_000_000 * dollarsPerMillion;
}
