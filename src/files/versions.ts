import z from "zod";
import yaml from "js-yaml";

const VersionSchema = z.object({
  image: z.string(),
  tag: z.string(),
}).strict();

const VersionsSchema = z.record(z.string(), VersionSchema);

export type Versions = z.infer<typeof VersionsSchema>;

export function parseVersions(data: string): Versions {
  return VersionsSchema.parse(yaml.load(data));
}
