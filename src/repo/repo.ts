import { AuthRequest, parseAuthRequest, parseLinkHeaders } from "./headers";
import { ResponseStatusOk, ResponseStatusUnauthorized, TokenResponse, Response, RepoAuthBasic, TagsResponse, ResponseOk } from "./types";

const DEFAULT_REGISTRY = "https://registry-1.docker.io";

export class DockerRepo {
  private token: string | null = null;
  private auth: RepoAuthBasic | null = null;

  public constructor(public readonly repo: string, public readonly image: string) { }

  public setAuth(user: string, pass: string): DockerRepo {
    this.auth = { user, pass };
    return this;
  }

  public async getTags(): Promise<string[]> {
    const res = await this.getPaged<TagsResponse>("tags/list");
    return res.flatMap(x => x.tags);
  }

  private async getPaged<T>(path: string): Promise<T[]> {
    let url = this.buildUrl(path);
    const res = new Array<T>();
    while (true) {
      const page = await this.getWithAuth<T>(url);
      res.push(page.response);
      if (!page.headers.has("link")) break;
      const links = parseLinkHeaders(page.headers.get("link")!, url);
      const next = links.find(x => x.rel === "next");
      if (!next) break;
      url = next.link;
    }
    return res;
  }

  private buildUrl(path: string): URL {
    return new URL(`v2/${this.image}/${path}`, this.repo);
  }

  private async getWithAuth<T>(url: URL): Promise<ResponseOk<T>> {
    while (true) {
      const res = await this.get<T>(url);
      if (res.status === ResponseStatusOk) {
        return res;
      } else {
        await this.authenticate(res.request);
      }
    }
  }

  private async authenticate(authReq: AuthRequest): Promise<void> {
    if (authReq.mechanism !== "Bearer")
      throw new Error(`Unexpected authentication mechanism: ${authReq.mechanism}`);
    if (!authReq.params["realm"])
      throw new Error("No realm in authentication challenge");

    const url = new URL(authReq.params["realm"]);
    const qs = url.searchParams;
    if (authReq.params["service"]) qs.append("service", authReq.params["service"]);
    if (authReq.params["scope"]) qs.append("scope", authReq.params["scope"]);

    const headers = new Headers();
    if (this.auth) {
      const basicAuth = Buffer.from(`${this.auth.user}:${this.auth.pass}`, "utf-8").toString("base64");
      headers.append("Authorization", `Basic ${basicAuth}`);
    }

    console.log("Authenticate:", url.href);

    const req = await fetch(url, { headers });
    if (req.ok) {
      const resp = await req.json() as TokenResponse;
      this.token = resp.token;
    } else {
      throw new Error(`Authentication failed - ${req.status} ${req.statusText}`);
    }
  }

  private async get<T>(url: URL): Promise<Response<T>> {
    console.log("Get:", url.href);

    const headers = new Headers();
    if (this.token)
      headers.append("Authorization", `Bearer ${this.token}`);

    const req = await fetch(url, { headers });
    if (req.ok) {
      return {
        status: ResponseStatusOk,
        response: await req.json() as T,
        headers: req.headers,
      };
    } else {
      if (req.status === 401 && req.headers.has("www-authenticate") && !this.token) {
        const authReq = parseAuthRequest(req.headers.get("www-authenticate")!);
        return {
          status: ResponseStatusUnauthorized,
          request: authReq,
        };
      }
      throw new Error(`Request failed - ${req.status} ${req.statusText}`);
    }
  }

  static fromImage(image: string): DockerRepo {
    const parts = image.split("/");

    if (parts.length === 1) {
      return new DockerRepo(DEFAULT_REGISTRY, `library/${parts[0]}`);
    } else if (parts.length === 2) {
      if (parts[0] === "docker.io") {
        return new DockerRepo(DEFAULT_REGISTRY, `library/${parts[1]}`);
      } else if (parts[0].includes(".")) {
        let repo = parts[0];
        if (!repo.match(/^https?:/))
          repo = `https://${repo}`;
        return new DockerRepo(repo, parts[1]);
      } else {
        return new DockerRepo(DEFAULT_REGISTRY, `${parts[0]}/${parts[1]}`);
      }
    } else if (parts.length === 3 && parts[0] === "docker.io") {
      return new DockerRepo(DEFAULT_REGISTRY, `${parts[1]}/${parts[2]}`);
    } else {
      let repo = parts.slice(0, parts.length - 2).join("/");
      if (!repo.match(/^https?:/))
        repo = `https://${repo}`;
      const imagePath = parts.slice(parts.length - 2).join("/");
      return new DockerRepo(repo, imagePath);
    }
  }
}
