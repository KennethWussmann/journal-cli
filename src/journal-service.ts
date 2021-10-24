import * as fs from "fs/promises";
import { join, parse } from "path";
import { exists, findFreePath, getExt, mkdir, splitEntry } from "./utils";
import * as YAML from "yaml";
import * as dayjs from "dayjs";

export class JournalService {
  constructor(private journalDir: string) {}

  createEntry = async (entryDate: string): Promise<string> => {
    const entryPath = join(this.journalDir, entryDate);
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

    return entryMarkdownFilePath;
  };

  attachFile = async (
    file: string,
    date: string,
    number: number,
    embed: boolean,
    copy: boolean,
    metadata: boolean
  ) => {
    const attachmentsPath = join(this.journalDir, date, "attachments");
    const entryPath = join(
      this.journalDir,
      date,
      `${date}${number > 1 ? `_${number}` : ""}.md`
    );
    const attachmentFileName = [parse(file).name, date, number].join("_");
    const attachmentFileExtension = getExt(file);

    if (!(await exists(file))) {
      throw Error(`Origin file ${file} does not exist`);
    }

    if (!(await exists(entryPath))) {
      throw Error(`Entry file ${entryPath} does not exist`);
    }

    await mkdir(attachmentsPath);

    var embedFilePath = file;
    if (copy) {
      const destinationFilePath = await findFreePath(
        attachmentsPath,
        attachmentFileName,
        attachmentFileExtension,
        true
      );
      embedFilePath = destinationFilePath
        .replace(join(this.journalDir as string, date), "")
        .substring(1);
      await fs.copyFile(file, destinationFilePath);
    }

    if (metadata) {
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
    }

    if (embed) {
      const entryContent = await fs.readFile(entryPath, "utf8");
      await fs.writeFile(entryPath, `${entryContent}![](${embedFilePath})`);
    }
  };
}
