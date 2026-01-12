import { ImageConfig } from "./files/config";
import { RegexMatcher, TagMatcher } from "./matcher/matcher";
import { DockerRepo } from "./repo/repo";

export async function processImage(name: string, config: ImageConfig): Promise<void> {
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

    const matcher = createMatcher(config);

    const tags = await repo.getTags();
    console.log("Fetched", tags.length, "tags");

    const withMatches = tags.map(x => ({ tag: x, match: matcher.match(x) }));

    console.group("Matching tags:");
    for (const { tag, match } of withMatches.filter(x => x.match)) {
      console.log(tag, "=>", match);
    }
    console.groupEnd();
  } finally {
    console.groupEnd();
  }
}

function createMatcher(config: ImageConfig): TagMatcher {
  switch (config.match) {
    case "regex":
      return new RegexMatcher(new RegExp(config.pattern));
    case "pattern":
      return RegexMatcher.fromPattern(config.pattern);
  }
}
