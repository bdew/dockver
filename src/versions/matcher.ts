import { makeRegexFromPattern } from "./makeRegex";

export interface TagMatcher {
  match(tag: string): string | null;
}

export class RegexMatcher implements TagMatcher {
  public constructor(private re: RegExp) { }

  public match(tag: string): string | null {
    const result = this.re.exec(tag);
    return result ? result[1] : null;
  }

  public static fromPattern(pattern: string): RegexMatcher {
    return new RegexMatcher(makeRegexFromPattern(pattern));
  }
}
