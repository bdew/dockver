import fs from "fs";
import path from "path";
import * as git from "isomorphic-git";
import { GitConfig } from "./files/config";
import { VersionsItem } from "./files/versions";

export class GitHandler {
  private gitRoot: string;
  private versionsPath: string;

  public constructor(private config: GitConfig, outPath: string) {
    let checkPath = outPath;
    while (true) {
      const parent = path.dirname(checkPath);
      if (checkPath === parent)
        throw new Error("Git repository not found");
      checkPath = parent;
      console.log("Check", checkPath);
      if (fs.existsSync(path.join(checkPath, ".git"))) {
        this.gitRoot = checkPath;
        break;
      }
    }
    this.versionsPath = path.relative(this.gitRoot, outPath);
    console.log("Using git repository", this.gitRoot, "file:", this.versionsPath);
  }

  public async commitChange(image: VersionsItem): Promise<void> {
    await git.add({
      fs,
      dir: this.gitRoot,
      filepath: this.versionsPath,
    });

    const res = await git.commit({
      fs,
      dir: this.gitRoot,
      message: this.formatMessage(image),
      author: {
        name: this.config.name,
        email: this.config.email,
      },
    });

    console.log("Comitted:", res);
  }

  private formatMessage(image: VersionsItem): string {
    let msg = this.config.message;
    msg = msg.replace("{image}", image.image);
    msg = msg.replace("{tag}", image.tag);
    return msg;
  }
}
