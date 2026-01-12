import { ImageConfig } from "./files/config";
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
    const tags = await repo.getTags();
    console.log("Fetched", tags.length, "tags");
  } finally {
    console.groupEnd();
  }
}
