import z from "zod";
import yaml from "js-yaml";

const ImageAuthSchema = z.union([
  z.object({
    username: z.string(),
    password: z.string(),
  }).strict(),
  z.object({
    username: z.string(),
    passwordFromEnv: z.string(),
  }).strict(),
]);

const ImageSchema = z.object({
  image: z.string(),
  match: z.enum(["regex", "pattern"]).default("pattern"),
  pattern: z.string().default("#.#.#"),
  compare: z.enum(["semver", "string", "number"]).default("semver"),
  minVer: z.coerce.string().optional(),
  maxVer: z.coerce.string().optional(),
  auth: ImageAuthSchema.optional(),
}).strict();

const GitSchema = z.object({
  enabled: z.boolean(),
  name: z.string().default("dockver"),
  email: z.string().default("dockver@bdew.net"),
  message: z.string().default("Update: {image} -> {tag}"),
}).strict();

const OutputSchema = z.object({
  file: z.string().default("images.yaml"),
  format: z.enum(["json", "yaml"]).default("yaml"),
}).strict();

const ConfigSchema = z.object({
  output: OutputSchema.default(OutputSchema.parse({})),
  git: GitSchema.optional(),
  images: z.record(z.string(), ImageSchema),
}).strict();

export type Config = z.infer<typeof ConfigSchema>;
export type ImageConfig = z.infer<typeof ImageSchema>;
export type OutputConfig = z.infer<typeof OutputSchema>;
export type GitConfig = z.infer<typeof GitSchema>;

export function parseConfig(data: string): Config {
  return ConfigSchema.parse(yaml.load(data));
}
