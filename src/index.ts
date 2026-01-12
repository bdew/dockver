import fs from "fs";
import path from "path";
import { parseConfig } from "./files/config";
import { processImage } from "./process";

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

  for (const [name, image] of Object.entries(config.images)) {
    await processImage(name, image);
  }
}

main().catch(console.error);
