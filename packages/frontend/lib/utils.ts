export const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(' ');

export const formatMillis = (value: number) => `${Math.round(value)} ms`;

export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
