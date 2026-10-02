import { pickWeighted, type ScoredFood } from '@/features/recommendation/engine';

/** Xếp lại pool theo thứ tự rút có trọng số (không lặp), dùng cho bộ thẻ vuốt. */
export function weightedShuffle(pool: readonly ScoredFood[]): ScoredFood[] {
  const rest = [...pool];
  const result: ScoredFood[] = [];
  while (rest.length) {
    const picked = pickWeighted(rest, { topN: rest.length });
    if (!picked) break;
    result.push(picked);
    rest.splice(rest.indexOf(picked), 1);
  }
  return result;
}

/** Xen kẽ món điểm cao và thấp để các lát trên vòng quay trông đa dạng. */
export function interleave<T>(items: readonly T[]): T[] {
  const half = Math.ceil(items.length / 2);
  const result: T[] = [];
  for (let i = 0; i < half; i++) {
    result.push(items[i]);
    if (i + half < items.length) result.push(items[i + half]);
  }
  return result;
}
