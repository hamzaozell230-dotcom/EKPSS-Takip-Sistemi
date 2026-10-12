import { GENEL_DERSLER } from "./store";

export const defaultQuestionCounts = (): Record<string, number> => Object.fromEntries(GENEL_DERSLER.map(d => [d.key, d.soru]));
export const totalQuestions = (counts?: Record<string, number>) => GENEL_DERSLER.reduce((total, d) => total + (counts?.[d.key] ?? d.soru), 0);
export function clampQuestionCount(value: number) {
  return Math.max(0, Math.min(1000, Math.floor(Number.isFinite(value) ? value : 0)));
}
export function fitAnswers(answers: { d: number; y: number }, count: number) {
  const d = Math.min(answers.d, count);
  return { d, y: Math.min(answers.y, count - d) };
}