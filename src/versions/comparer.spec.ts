import { expect, test } from "vitest";
import { TagCompareNumber, TagCompareSemver, TagCompareString } from "./comparer";

test("semver compare", () => {
  expect(TagCompareSemver.compare("2.0.0", "1.0.0")).toBeGreaterThan(0);
  expect(TagCompareSemver.compare("1.0.0", "1.0.0")).toBe(0);
  expect(TagCompareSemver.compare("1.0.0", "2.0.0")).toBeLessThan(0);
  expect(TagCompareSemver.compare("1.0.0", "1.0.0-alpha")).toBeGreaterThan(0);
});

test("string compare", () => {
  expect(TagCompareString.compare("abc", "abc")).toBe(0);
  expect(TagCompareString.compare("a", "b")).toBeLessThan(0);
  expect(TagCompareString.compare("b", "a")).toBeGreaterThan(0);
});

test("number compare", () => {
  expect(TagCompareNumber.compare("1.2", "1")).toBeGreaterThan(0);
  expect(TagCompareNumber.compare("1.0", "01")).toBe(0);
  expect(TagCompareNumber.compare("1.2", "1.3")).toBeLessThan(0);
});
