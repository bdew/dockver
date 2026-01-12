import { expect, test } from "vitest";
import { RegexMatcher } from "./matcher";

test("regex match", () => {
  const matcher = new RegexMatcher(/aaa(\d+)/);
  expect(matcher.match("foaaa123")).toBe("123");
  expect(matcher.match("foaaa")).toBe(null);
});

test("regex match full", () => {
  const matcher = new RegexMatcher(/^aaa(\d+)$/);
  expect(matcher.match("aaa123")).toBe("123");
  expect(matcher.match("foaaa123")).toBe(null);
});

test("pattern match with group", () => {
  const matcher = RegexMatcher.fromPattern("(#.#.#)-foo");
  expect(matcher.match("1.2.3-foo")).toBe("1.2.3");
  expect(matcher.match("1.2.3-bar")).toBe(null);
});

test("pattern match with group and wildcard", () => {
  const matcher = RegexMatcher.fromPattern("(#.#.#)-*");
  expect(matcher.match("1.2.3-foo")).toBe("1.2.3");
  expect(matcher.match("1.2.3")).toBe(null);
});

test("pattern match with automatic group", () => {
  const matcher = RegexMatcher.fromPattern("#.#.#-foo");
  expect(matcher.match("1.2.3-foo")).toBe("1.2.3");
  expect(matcher.match("1.2.3-bar")).toBe(null);
});

test("pattern match without group", () => {
  expect(() => RegexMatcher.fromPattern("1.2.3")).toThrow();
});
