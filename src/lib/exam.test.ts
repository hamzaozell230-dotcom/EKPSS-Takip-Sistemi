import { describe, expect, it } from "vitest";
import { clampQuestionCount, defaultQuestionCounts, fitAnswers, totalQuestions } from "./exam";
describe("Adjustable general exam questions", () => {
  it("preserves the 60-question fallback for old exams", () => {
    expect(totalQuestions()).toBe(60);
    expect(totalQuestions(defaultQuestionCounts())).toBe(60);
  });
  it("calculates custom totals", () => {
    expect(totalQuestions({ ...defaultQuestionCounts(), turkce: 20 })).toBe(65);
  });
  it("keeps counts whole and nonnegative", () => {
    expect(clampQuestionCount(-1)).toBe(0);
    expect(clampQuestionCount(20.6)).toBe(20);
    expect(clampQuestionCount(NaN)).toBe(0);
  });
  it("fits answers when a question count decreases", () => {
    expect(fitAnswers({ d: 12, y: 3 }, 10)).toEqual({ d: 10, y: 0 });
    expect(fitAnswers({ d: 5, y: 3 }, 6)).toEqual({ d: 5, y: 1 });
  });
});