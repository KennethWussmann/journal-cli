import * as fs from "fs/promises";
import * as dayjs from "dayjs";
import { join, parse } from "path";
import * as YAML from "yaml";
import { Command, flags } from "@oclif/command";
import { exists, findFreePath, getExt, mkdir, splitEntry } from "../utils";

export default class AddAttachment extends Command {
  static description = "Attach a file to an entry";

  static examples = [`$ journal attach "/Users/someone/images/vacation.png"`];

  static flags: Record<string, any> = {
    help: flags.help({ char: "h" }),
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

  async run() {
    const { flags, args } = this.parse(AddAttachment);
    const date = flags.date as string;
    const number = flags.number as number;
    const { embed, copy, metadata } = flags;
    const attachmentsPath = join("entries", date, "attachments");
    const entryPath = join(
      "entries",
      date,
      `${date}${number > 1 ? `_${number}` : ""}.md`
    );
    const attachmentFileName = [parse(args.file).name, date, number].join("_");
    const attachmentFileExtension = getExt(args.file);

    if (!(await exists(args.file))) {
      this.error(`Origin file ${args.file} does not exist`);
    }

    var embedFilePath = args.file;
    if (copy) {
      await mkdir(attachmentsPath);
      const destinationFilePath = await findFreePath(
        attachmentsPath,
        attachmentFileName,
        attachmentFileExtension,
        true
      );
      embedFilePath = destinationFilePath
        .replace(join("entries", date), "")
        .substring(1);
      await fs.copyFile(args.file, destinationFilePath);
      this.log(`Copied file to ${destinationFilePath}`);
    }

    console.log(embedFilePath);
    if (metadata) {
      if (!(await exists(entryPath))) {
        this.error(`Entry file ${entryPath} does not exist`);
      }
      const { metadata, text } = await splitEntry(entryPath);
      const updatedMetadata = {
        ...metadata,
        attachments: [
          ...(metadata.attachments ? metadata.attachments : []),
          embedFilePath,
        ],
      };
      const entryContent = [
        "---",
        YAML.stringify(updatedMetadata),
        "---",
        text,
      ].join("\n");
      await fs.writeFile(entryPath, entryContent);
      this.log(`Added to attachments within entry ${entryPath}`);
    }

    if (embed) {
      const entryContent = await fs.readFile(entryPath, "utf8");
      await fs.writeFile(entryPath, `${entryContent}![](${embedFilePath})`);
      this.log(`Embedded as image within entry ${entryPath}`);
    }

    this.log("Done!");
  }
}
