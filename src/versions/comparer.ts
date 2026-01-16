import semver from "semver";

export interface TagComparer {
  compare(a: string, b: string): number;
}

export const TagCompareSemver: TagComparer = {
  compare(a, b) {
    if (a.split(".").length === 2) a = `${a}.0`;
    if (b.split(".").length === 2) b = `${b}.0`;
    return semver.compare(a, b);
  },
};

export const TagCompareString: TagComparer = {
  compare(a, b) {
    return a.localeCompare(b, "en-US");
  },
};

export const TagCompareNumber: TagComparer = {
  compare(a, b) {
    return Math.sign(Number(a) - Number(b));
  },
};
