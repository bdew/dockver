import z from "zod";
import yaml from "js-yaml";

const VersionsItemSchema = z.object({
  image: z.string(),
  tag: z.string(),
  digest: z.string(),
}).strict();

const VersionsSchema = z.record(z.string(), VersionsItemSchema);

export type Versions = z.infer<typeof VersionsSchema>;
export type VersionsItem = z.infer<typeof VersionsItemSchema>;

export function parseVersions(data: string, format: "yaml" | "json"): Versions {
  switch (format) {
    case "yaml":
      return VersionsSchema.parse(yaml.load(data));
    case "json":
      return VersionsSchema.parse(JSON.parse(data));
  }
}

export function saveVersions(data: Versions, format: "yaml" | "json"): string {
  switch (format) {
    case "yaml":
      return yaml.dump(data, {});
    case "json":
      return JSON.stringify(data, null, 4);
  }
}
