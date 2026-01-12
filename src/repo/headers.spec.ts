import { expect, test } from "vitest";
import { parseAuthRequest, parseLinkHeaders } from "./headers";

test("parse auth header", () => {
  const parsed = parseAuthRequest('Bearer realm="https://auth.docker.io/token",service=registry.docker.io,scope="repository:library/mariadb:pull"');
  expect(parsed).toHaveProperty("mechanism", "Bearer");
  expect(parsed).toHaveProperty("params.realm", "https://auth.docker.io/token");
  expect(parsed).toHaveProperty("params.service", "registry.docker.io");
  expect(parsed).toHaveProperty("params.scope", "repository:library/mariadb:pull");
});

test("parse link header", () => {
  const parsed = parseLinkHeaders('</foo?last=bar&n=1000>; rel="next", </bar>; rel=prev', new URL("https://test.com/asd/"));
  expect(parsed.find(x => x.rel === "next")).toHaveProperty("link.href", "https://test.com/foo?last=bar&n=1000");
  expect(parsed.find(x => x.rel === "prev")).toHaveProperty("link.href", "https://test.com/bar");
});
