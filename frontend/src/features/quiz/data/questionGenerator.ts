import type { QuizQuestion, QuizSessionConfig } from '../types';

// Seeded random for deterministic daily quiz
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function todaySeed(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function generateQuizSession(
  config: QuizSessionConfig,
  allQuestions: QuizQuestion[],
): QuizQuestion[] {
  const { mode, questionCount, eras, categories } = config;

  // Filter by era/category
  let pool = allQuestions.filter(q => {
    if (eras.length > 0 && !eras.includes(q.era)) return false;
    if (categories.length > 0 && !categories.includes(q.category)) return false;
    return true;
  });

  if (pool.length === 0) pool = allQuestions;

  const rand = mode === 'daily' ? seededRandom(todaySeed()) : Math.random;

  // Target distribution by type
  const targets: Record<string, number> = {
    'mcq': Math.ceil(questionCount * 0.5),
    'true-false': Math.ceil(questionCount * 0.2),
    'image-id': Math.ceil(questionCount * 0.2),
    'timeline-order': Math.max(1, Math.floor(questionCount * 0.1)),
  };

  const selected: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  // Pick questions by type
  for (const [type, count] of Object.entries(targets)) {
    const typePool = shuffle(
      pool.filter(q => q.type === type && !usedIds.has(q.id)),
      () => rand(),
    );

    // Try to balance difficulty: 30% easy, 40% medium, 30% hard
    const easy = typePool.filter(q => q.difficulty === 'easy');
    const medium = typePool.filter(q => q.difficulty === 'medium');
    const hard = typePool.filter(q => q.difficulty === 'hard');

    const easyCount = Math.max(1, Math.round(count * 0.3));
    const hardCount = Math.max(0, Math.round(count * 0.3));
    const mediumCount = count - easyCount - hardCount;

    const picks = [
      ...easy.slice(0, easyCount),
      ...medium.slice(0, mediumCount),
      ...hard.slice(0, hardCount),
    ];

    // Fill remaining with whatever's available
    if (picks.length < count) {
      const remaining = typePool.filter(q => !picks.includes(q));
      picks.push(...remaining.slice(0, count - picks.length));
    }

    for (const q of picks) {
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  // If we don't have enough, fill with any remaining
  if (selected.length < questionCount) {
    const remaining = shuffle(
      pool.filter(q => !usedIds.has(q.id)),
      () => rand(),
    );
    for (const q of remaining) {
      if (selected.length >= questionCount) break;
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  // Trim to target count and shuffle final order
  return shuffle(selected.slice(0, questionCount), () => rand());
}
