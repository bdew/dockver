import { expect, test } from "vitest";
import { DockerRepo } from "./repo";

test("parse full reference", () => {
  expect(DockerRepo.fromImage("code.bdew.net/bdew/dinos")).toMatchObject({ repo: "https://code.bdew.net", image: "bdew/dinos" });
});

test("parse full reference with protocol", () => {
  expect(DockerRepo.fromImage("https://code.bdew.net/foo/bar")).toMatchObject({ repo: "https://code.bdew.net", image: "foo/bar" });
});

test("parse simple reference with docker.io", () => {
  expect(DockerRepo.fromImage("docker.io/debian")).toMatchObject({ repo: "https://registry-1.docker.io", image: "library/debian" });
});

test("parse full reference with docker.io", () => {
  expect(DockerRepo.fromImage("docker.io/library/mongo")).toMatchObject({ repo: "https://registry-1.docker.io", image: "library/mongo" });
});

test("parse simple image name", () => {
  expect(DockerRepo.fromImage("nodejs")).toMatchObject({ repo: "https://registry-1.docker.io", image: "library/nodejs" });
});

test("parse full image name", () => {
  expect(DockerRepo.fromImage("bdew/foo")).toMatchObject({ repo: "https://registry-1.docker.io", image: "bdew/foo" });
});

test("parse simple reference with custom epo", () => {
  expect(DockerRepo.fromImage("foo.com/bar")).toMatchObject({ repo: "https://foo.com", image: "bar" });
});
