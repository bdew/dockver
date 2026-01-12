import { expect, test } from "vitest";
import { parseConfig } from "./config";

test("parse config", () => {
  const config = parseConfig(`
    outFile: ./foo.yaml
    images: 
      foo:
        image: foo
        auth:
          username: foouser
          password: barpass
      bar:
        image: bar
  `);
  expect(config).toHaveProperty("outFile", "./foo.yaml");
  expect(config).toHaveProperty("images.foo.image", "foo");
  expect(config).toHaveProperty("images.foo.auth.username", "foouser");
  expect(config).not.toHaveProperty("images.bar.auth");
});

test("parse default values", () => {
  const config = parseConfig(`
    images: {}
  `);
  expect(config).toHaveProperty("outFile", "images.yaml");
});

test("fail on unknown values", () => {
  const config = `
    foo: bar
    images: {}
  `;
  expect(() => parseConfig(config)).toThrow("unrecognized_keys");

  const config2 = `
    images:
      foo:
        image: bar
        baz: 1
  `;
  expect(() => parseConfig(config2)).toThrow("unrecognized_keys");
});
