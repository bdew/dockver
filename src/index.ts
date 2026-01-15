import fs from "fs";
import path from "path";
import { parseConfig } from "./files/config";
import { processImage } from "./process";
import { parseVersions, saveVersions, Versions } from "./files/versions";
import { GitHandler } from "./git";

async function main(): Promise<void> {
  if (process.argv.length !== 3) {
    console.error("Usage:");
    console.error(" dockver <configFile>");
    process.exit(1);
  }

  const configFilePath = path.resolve(process.argv[2]);
  console.log("Read config from", configFilePath);
  const configFile = fs.readFileSync(configFilePath, "utf-8");
  const config = parseConfig(configFile);

  const versionsFilePath = path.resolve(path.dirname(configFilePath), config.output.file);
  console.log("Read versions from", versionsFilePath);

  const git = config.git?.enabled ? new GitHandler(config.git, versionsFilePath) : null;

  let versions: Versions = {};

  try {
    if (fs.existsSync(versionsFilePath)) {
      const versionsData = fs.readFileSync(versionsFilePath, "utf-8");
      versions = parseVersions(versionsData, config.output.format);
    }
  } catch (err) {
    console.error("Failed to read versions:", err);
    process.exit(1);
  }

  const toRemove = Object.keys(versions).filter(name => !config.images[name]);
  for (const name of toRemove) {
    console.log("Removing image that's not in config:", name);
    const prev = versions[name];
    delete versions[name];
    const versionsData = saveVersions(versions, config.output.format);
    fs.writeFileSync(versionsFilePath, versionsData, "utf-8");
    if (git)
      await git.commitChange(prev, undefined);
  }

  for (const [name, image] of Object.entries(config.images)) {
    const res = await processImage(name, image, versions[name] ?? null);
    if (res) {
      const prev = versions[name];
      versions[name] = res;
      const versionsData = saveVersions(versions, config.output.format);
      fs.writeFileSync(versionsFilePath, versionsData, "utf-8");
      if (git)
        await git.commitChange(prev, res);
    }
  }
}

main().catch(console.error);
