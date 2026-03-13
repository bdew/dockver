import { expect, test } from "vitest";
import { parseAuthRequest, parseLinkHeaders } from "./headers";

test("parse auth header", () => {
  const parsed = parseAuthRequest('Bearer realm="https://auth.docker.io/token",service=registry.docker.io,scope="repository:library/mariadb:pull"');
  expect(parsed).toHaveLength(1);
  expect(parsed[0]).toHaveProperty("mechanism", "Bearer");
  expect(parsed[0]).toHaveProperty("params.realm", "https://auth.docker.io/token");
  expect(parsed[0]).toHaveProperty("params.service", "registry.docker.io");
  expect(parsed[0]).toHaveProperty("params.scope", "repository:library/mariadb:pull");
});

test("parse auth header with multiple mechanisms", () => {
  const parsed = parseAuthRequest('Bearer realm="https://codeberg.org/v2/token",service="container_registry",scope="*",Basic realm="https://codeberg.org/v2",service="container_registry",scope="*"');
  expect(parsed).toHaveLength(2);
  expect(parsed[0]).toHaveProperty("mechanism", "Bearer");
  expect(parsed[0]).toHaveProperty("params.realm", "https://codeberg.org/v2/token");
  expect(parsed[0]).toHaveProperty("params.service", "container_registry");
  expect(parsed[0]).toHaveProperty("params.scope", "*");
  expect(parsed[1]).toHaveProperty("mechanism", "Basic");
  expect(parsed[1]).toHaveProperty("params.realm", "https://codeberg.org/v2");
  expect(parsed[1]).toHaveProperty("params.service", "container_registry");
  expect(parsed[1]).toHaveProperty("params.scope", "*");
});

test("parse link header", () => {
  const parsed = parseLinkHeaders('</foo?last=bar&n=1000>; rel="next", </bar>; rel=prev', new URL("https://test.com/asd/"));
  expect(parsed.find(x => x.rel === "next")).toHaveProperty("link.href", "https://test.com/foo?last=bar&n=1000");
  expect(parsed.find(x => x.rel === "prev")).toHaveProperty("link.href", "https://test.com/bar");
});
