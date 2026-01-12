export interface AuthRequest {
  mechanism: string;
  params: Record<string, string>;
};

export interface LinkHeader {
  link: URL;
  rel?: string;
  extra: Record<string, string>;
}

const AUTH_PARAM_RE = /(\w+)=(".*?"|[^",]+)(?=,|$)/g;
const LINK_HEADER_SEP_RE = /,\s*</;
const LINK_HEADER_RE = /<?([^>]*)>(.*)/;
const LINK_HEADER_PARAM_RE = /\s*(.+)\s*=\s*"?([^"]+)"?/;

export function parseAuthRequest(header: string): AuthRequest {
  const [mechanism, ...paramString] = header.split(" ");
  const params: Record<string, string> = {};
  const paramMatches = paramString.join(" ").matchAll(AUTH_PARAM_RE);
  for (const [, key, value] of paramMatches) {
    params[key] = value.replace(/^"|"$/g, "");
  }

  return { mechanism, params };
}

export function parseLinkHeaders(header: string, base?: URL): LinkHeader[] {
  const res = new Array<LinkHeader>();
  for (const item of header.split(LINK_HEADER_SEP_RE)) {
    const match = item.match(LINK_HEADER_RE);
    if (!match) {
      console.warn("Failed to parse link header", item);
      continue;
    }
    const parsed: LinkHeader = {
      link: new URL(match[1], base),
      extra: {},
    };

    for (const part of match[2].split(";")) {
      const match = part.match(LINK_HEADER_PARAM_RE);
      if (!match) continue;
      if (match[1] === "rel")
        parsed.rel = match[2];
      else
        parsed.extra[match[1]] = match[2];
    }
    res.push(parsed);
  }
  return res;
}
