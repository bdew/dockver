import z from "zod";
import yaml from "js-yaml";

const VersionsItemSchema = z.object({
  image: z.string(),
  tag: z.string(),
}).strict();

const VersionsSchema = z.record(z.string(), VersionsItemSchema);

export type Versions = z.infer<typeof VersionsSchema>;
export type VersionsItem = z.infer<typeof VersionsItemSchema>;

export function parseVersions(data: string): Versions {
  return VersionsSchema.parse(yaml.load(data));
}

export function saveVersions(data: Versions): string {
  return yaml.dump(data, {});
}
