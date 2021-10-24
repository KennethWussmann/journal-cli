import * as fs from "fs/promises";
import * as dayjs from "dayjs";
import { join, parse } from "path";
import * as YAML from "yaml";
import { Command, flags } from "@oclif/command";
import { exists, findFreePath, getExt, mkdir, splitEntry } from "../utils";
import BaseCommand from "../base-command";

export default class AddAttachment extends BaseCommand {
  static description = "Attach a file to an entry";

  static examples = [`$ journal attach "/Users/someone/images/vacation.png"`];

  static flags: Record<string, any> = {
    ...BaseCommand.flags,
    date: flags.string({
      char: "d",
      description: "Date of the entry to attach to",
      default: dayjs().format("YYYY-MM-DD"),
    }),
    number: flags.integer({
      char: "n",
      description:
        "Number of the entry to add attach to in case multiple entries per date exists",
      default: 1,
    }),
    embed: flags.boolean({
      char: "e",
      description: "Embed the file in the entry markdown",
      default: true,
      allowNo: true,
    }),
    metadata: flags.boolean({
      char: "m",
      description: "Link file in the entries markdown metadata",
      default: true,
      allowNo: true,
    }),
    copy: flags.boolean({
      char: "c",
      description: "Copy file into the entries attachments directory",
      default: true,
      allowNo: true,
    }),
  };

  static args = [{ name: "file", description: "Attachment file path" }];

  run = async () => {
    const { flags, args } = this.parse(AddAttachment);
    if (!args.file) {
      this._help();
    }
    try {
      await this.journal!.attachFile(
        args.file as string,
        flags.date as string,
        flags.number as number,
        flags.embed as boolean,
        flags.metadata as boolean,
        flags.copy as boolean
      );
      this.log(
        `Attached file ${args.file} to entry ${flags.number} entry at ${flags.date}`
      );
    } catch (err: any) {
      this.error(`Failed to attach file: ${err.message}`);
    }
  };
}
