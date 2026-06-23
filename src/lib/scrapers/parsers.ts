export function isValidDate(v: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseFandomDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/<[^>]*>/g, '').trim();
  return isValidDate(cleaned);
}

export function tierScore(tier: string): number {
  const map: Record<string, number> = { 'S+': 6, S: 5, 'A+': 4, A: 3, B: 2, C: 1 };
  return map[tier] || 0;
}
