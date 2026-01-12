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
  auth: ImageAuthSchema.optional(),
}).strict();

const ConfigSchema = z.object({
  outFile: z.string().default("images.yaml"),
  images: z.record(z.string(), ImageSchema),
}).strict();

export type Config = z.infer<typeof ConfigSchema>;
export type ImageConfig = z.infer<typeof ImageSchema>;

export function parseConfig(data: string): Config {
  return ConfigSchema.parse(yaml.load(data));
}
