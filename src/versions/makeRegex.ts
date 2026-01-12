import "../types/lib.esnext.regexp";

export function makeRegexFromPattern(pattern: string): RegExp {
  let workingPattern = pattern;

  // Add capturing group around all wildcards if there is no '('
  if (!workingPattern.includes("(")) {
    let firstWildcard: number | null = null;
    let lastWildcard: number | null = null;

    for (let i = 0; i < workingPattern.length; i++) {
      const c = workingPattern[i];
      if (c === "#" || c === "*") {
        if (firstWildcard === null) {
          firstWildcard = i;
        }
        lastWildcard = i;
      }
    }

    if (firstWildcard !== null && lastWildcard !== null) {
      workingPattern = `${workingPattern.slice(0, firstWildcard)}(${workingPattern.slice(firstWildcard, lastWildcard + 1)})${workingPattern.slice(lastWildcard + 1)}`;
    } else {
      throw new Error("Pattern without group or wildcard chatacters - can't match");
    }
  }

  let regexSource = "";

  for (const c of workingPattern) {
    switch (c) {
      case "#":
        regexSource += "\\d+";
        break;
      case "*":
        regexSource += "\\w+";
        break;
      case "(":
      case ")":
        regexSource += c;
        break;
      default:
        regexSource += RegExp.escape(c);
        break;
    }
  }

  return new RegExp(`^${regexSource}$`);
}
