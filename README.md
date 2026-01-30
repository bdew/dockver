# Dockver

Dockver is a tool that checks Docker images and finds the latest tag that matches your criteria, based on a config file.

## What it does

- Scans Docker registries for tags on specified images.
- Filters tags using patterns or regex.
- Compares versions (semver, number, or string).
- Outputs the latest matching tag to a file.
- Optionally commits changes to git.

## Config Options

The config file (YAML) has these main sections:

- **output**: Where to save results (file path and format: yaml or json).
- **git**: Enable git commits after updates, with custom messages.
- **images**: List of images to check, each with:
  - `image`: The Docker image name.
  - `match`: How to filter tags (pattern or regex).
  - `pattern`: The pattern to match (default: "#.#.#").
  - `compare`: How to compare versions (semver, number, string).
  - `minVer`/`maxVer`: Version limits.
  - `auth`: Credentials for private registries.

## Tag Matching

Tags can be matched using either a simple pattern or regex.

### Pattern Matching

Supported wildcards:
- `#` - matches any number
- `*` - matches anything
- `(braces)` - marks the portion to extract for version comparison (if omitted, the entire string is used)

**Examples:**
- `#.#.#` matches `1.12.5` but not `1.12.5-foo`
- `(#.#.#)-foo` matches `1.12.5-foo` and extracts only `1.12.5` for comparison

### Regex Matching

Any regex pattern is supported. If a capture group is present, it will be used for version comparison.


## Example

Check out [example/config.yaml](example/config.yaml) for a sample config.
