import { ImageConfig } from "./files/config";
import { RegexMatcher, TagMatcher } from "./versions/matcher";
import { DockerRepo } from "./repo/repo";
import { TagCompareNumber, TagComparer, TagCompareSemver, TagCompareString } from "./versions/comparer";
import { VersionsItem } from "./files/versions";

interface TagMatch {
  tag: string;
  match: string;
}

export async function processImage(name: string, config: ImageConfig, current: VersionsItem | null): Promise<VersionsItem | null> {
  console.group("Processing", name);
  try {
    const repo = DockerRepo.fromImage(config.image);
    if (config.auth) {
      if ("password" in config.auth) {
        repo.setAuth(config.auth.username, config.auth.password);
      } else {
        const pass = process.env[config.auth.passwordFromEnv];
        if (!pass) throw new Error(`Environment variable ${config.auth.passwordFromEnv} not set`);
        repo.setAuth(config.auth.username, pass);
      }
    }

    const matcher = getMatcher(config);
    const comparer = getComparer(config);

    const tags = await repo.getTags();

    let matched = tags.map(x => ({ tag: x, match: matcher.match(x) })).filter((x): x is TagMatch => !!x.match);

    if (config.minVer)
      matched = matched.filter(x => comparer.compare(x.match, config.minVer!) >= 0);

    if (config.maxVer)
      matched = matched.filter(x => comparer.compare(x.match, config.maxVer!) <= 0);

    if (!matched.length) {
      console.warn("No tags are matching");
      return null;
    }

    matched.sort((a, b) => comparer.compare(a.match, b.match)).reverse();
    const top = matched[0];

    if (current?.image === config.image && current?.tag === top.tag) {
      console.log("Keeping current version", current.tag);
      return null;
    }

    console.log("Updating to", top.tag);

    return {
      image: config.image,
      tag: top.tag,
    };
  } catch (err) {
    console.error("Error:", err);
    return null;
  } finally {
    console.groupEnd();
  }
}

function getMatcher(config: ImageConfig): TagMatcher {
  switch (config.match) {
    case "regex":
      return new RegexMatcher(new RegExp(config.pattern));
    case "pattern":
      return RegexMatcher.fromPattern(config.pattern);
  }
}
function getComparer(config: ImageConfig): TagComparer {
  switch (config.compare) {
    case "string":
      return TagCompareString;
    case "semver":
      return TagCompareSemver;
    case "number":
      return TagCompareNumber;
  }
}
