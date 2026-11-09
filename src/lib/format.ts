export const nf = (n: number, dp = 0): string => {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

export const num = (n: number, dp = 2): string => {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const a = Math.abs(n);
  if (a < 0.001) return n.toExponential(2);
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

export const pct = (n: number, dp = 1): string => `${num(n, dp)} %`;
