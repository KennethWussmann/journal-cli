import * as fs from "fs/promises";
import * as dayjs from "dayjs";
import { join } from "path";
import * as YAML from "yaml";
import { Command, flags } from "@oclif/command";
import { findFreePath, mkdir } from "../utils";
import BaseCommand from "../base-command";

export default class NewEntry extends BaseCommand {
  static description = "Create a new journal entry for today or custom date";

  static examples = [`$ journal entry -d 2020-12-31`];

  static flags: Record<string, any> = {
    ...BaseCommand.flags,
    date: flags.string({
      char: "d",
      description: "Date of the entry in format YYYY-MM-DD",
      default: dayjs().format("YYYY-MM-DD"),
    }),
  };

  run = async () => {
    const { flags } = this.parse(NewEntry);
    const entryMarkdownFilePath = await this.journal!.createEntry(
      flags.date as string
    );
    this.log(`Created entry ${entryMarkdownFilePath}`);
  };
}
