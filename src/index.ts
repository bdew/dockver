import fs from "fs";
import path from "path";
import { parseConfig } from "./files/config";
import { processImage } from "./process";
import { parseVersions, saveVersions, Versions } from "./files/versions";

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

  const versionsFilePath = path.resolve(path.dirname(configFilePath), config.outFile);
  console.log("Read versions from", versionsFilePath);

  let versions: Versions = {};

  try {
    if (fs.existsSync(versionsFilePath)) {
      const versionsData = fs.readFileSync(versionsFilePath, "utf-8");
      versions = parseVersions(versionsData);
    }
  } catch (err) {
    console.error("Failed to read versions:", err);
    process.exit(1);
  }

  for (const [name, image] of Object.entries(config.images)) {
    const res = await processImage(name, image, versions[name] ?? null);
    if (res) {
      versions[name] = res;
      const versionsData = saveVersions(versions);
      fs.writeFileSync(versionsFilePath, versionsData, "utf-8");
    }
  }
}

main().catch(console.error);
