import z from "zod";
import yaml from "js-yaml";

const ImageAuthSchema = z.union([
  z.object({
    username: z.string().describe("Private registry username"),
    password: z.string().describe("Private registry password"),
  }).strict(),
  z.object({
    username: z.string().describe("Private registry username"),
    passwordFromEnv: z.string().describe("Private registry password (read from environment variable)"),
  }).strict(),
]);

const CompareSemVer = z.literal("semver").describe("Compare versions using semantic version rules");
const CompareString = z.literal("string").describe("Compare versions lexicographically (like a string)");
const CompareNumber = z.literal("number").describe("Compare versions as numbers");

const MatchRegex = z.literal("regex").describe("Use regex to filter tags");
const MatchPattern = z.literal("pattern").describe("Use simple pattern to filter tags");

const ImageSchema = z.object({
  image: z.string()
    .describe("Image name to check"),
  match: z.union([MatchPattern, MatchRegex]).default("pattern")
    .describe("Mechanism used to filter tags and extract version"),
  pattern: z.string().default("#.#.#")
    .describe("Pattern to match against tags"),
  compare: z.union([CompareSemVer, CompareNumber, CompareString]).default("semver")
    .describe("Mechanism used to compare versions"),
  minVer: z.coerce.string().optional()
    .describe("Minimum accepted version, in the format expected by the selected compare method"),
  maxVer: z.coerce.string().optional()
    .describe("Maximum accepted version, in the format expected by the selected compare method"),
  auth: ImageAuthSchema.optional()
    .describe("Authentication for private registries"),
}).strict();

const GitSchema = z.object({
  enabled: z.boolean()
    .describe("If enabled will do a git commit after every change"),
  name: z.string().default("dockver[bot]")
    .describe("Git commit author name"),
  email: z.string().default("dockver@bdew.net")
    .describe("Git commit author email"),
  messageUpdate: z.string().default("Update: {image} -> {tag}")
    .describe("Git commit message for updates"),
  messageRemove: z.string().default("Remove: {image}")
    .describe("Git commit message for removed images"),
  messageAdd: z.string().default("Add: {image} -> {tag}")
    .describe("Git commit message for added images"),
}).strict().describe("Git commits configuration");

const OutputSchema = z.object({
  file: z.string().default("images.yaml")
    .describe("Output file path, relative to config file"),
  format: z.enum(["json", "yaml"]).default("yaml")
    .describe("Output file format"),
}).strict().describe("Output configuration");

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

export function generateSchema(): string {
  const schema = ConfigSchema.toJSONSchema({ io: "input" });
  return JSON.stringify(schema, null, 2);
}
