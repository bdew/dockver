import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { parseConfig } from "./files/config";
import { parseVersions, saveVersions, Versions } from "./files/versions";
import { GitHandler } from "./git";
import { processImage } from "./process";

async function main(): Promise<void> {
  const args = await yargs(hideBin(process.argv))
    .usage("Usage: $0 <configFile>")

    .option("only-new", { alias: "n", type: "boolean", desc: "Only process new images" })
    .demandCommand(1, 1)
    .parse();

  const configFilePath = path.resolve(args._[0].toString());
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

  if (!args["only-new"]) {
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
  }

  for (const [name, image] of Object.entries(config.images)) {
    if (args["only-new"] && versions[name]) continue;
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
