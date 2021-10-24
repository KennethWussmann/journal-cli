import * as fs from "fs/promises";
import * as dayjs from "dayjs";
import { join } from "path";
import * as YAML from "yaml";
import { Command, flags } from "@oclif/command";
import { findFreePath, mkdir } from "../utils";

export default class NewEntry extends Command {
  static description = "Create a new journal entry for today or custom date";

  static examples = [`$ journal new-entry -d 2020-12-31`];

  static flags: Record<string, any> = {
    help: flags.help({ char: "h" }),
    date: flags.string({
      char: "d",
      description: "Date of the entry in format YYYY-MM-DD",
      default: dayjs().format("YYYY-MM-DD"),
    }),
  };

  async run() {
    const { flags } = this.parse(NewEntry);
    const entryDate = flags.date as string;
    const entryPath = join("entries", entryDate);
    const entryMarkdownFilePath = await findFreePath(entryPath, entryDate);

    await mkdir(entryPath);

    const entryMetadata = YAML.stringify({
      timestamp: dayjs().toISOString(),
      tags: [],
      emotions: [],
      attachments: [],
    });

    const entryContent = ["---", entryMetadata, "---", ""].join("\n");

    await fs.writeFile(entryMarkdownFilePath, entryContent);

    this.log(`Created entry ${entryMarkdownFilePath}`);
  }
}
