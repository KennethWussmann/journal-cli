import dayjs = require("dayjs");
import { exit } from "process";
import BaseCommand from "../base-command";
import { PasteTextBuffer } from "../paste-text-buffer";
const term = require("terminal-kit").terminal;
const packageJson = require("../../package.json");

class Hint {
  constructor(private error: boolean, private text: string) {}

  render = async () => {
    if (this.error) {
      term.red(this.text);
    } else {
      term.green(this.text);
    }
  };
}

export default class Tui extends BaseCommand {
  static description = "Start a terminal interface to manage journal";

  static examples = [`$ journal tui`];

  static flags: Record<string, any> = {
    ...BaseCommand.flags,
  };

  private hints: Hint[] = [];

  private dragAndDrop: boolean = false;

  private filesAdded: string[] = [];

  render = async () => {
    term.clear();
    const items = ["Create new entry", "Attach files", "Quit"];
    term.green(`\nJournal - v${packageJson.version}\n`);
    if (this.hints.length > 0) {
      term("\n");
      this.hints.forEach((hint) => hint.render());
      term("\n");
    }
    if (this.dragAndDrop) {
      term("\nDrag and drop one file to attach it to today's entry\n");
      if (this.filesAdded.length > 0) {
        term("Files attached:\n");
        this.filesAdded.forEach((file) => {
          term(`- ${file}\n`);
        });
      }
    } else {
      term.singleColumnMenu(items, async (_: any, response: any) => {
        if (response.selectedIndex === 0) {
          const date = dayjs().format("YYYY-MM-DD");
          await this.journal!.createEntry(date);
          this.hints.push(
            new Hint(false, `✍️  Entry for date ${date} created`)
          );
        }
        if (response.selectedIndex === 1) {
          this.dragAndDrop = true;
          this.render();
        }
        if (response.selectedIndex === 2) {
          process.exit(0);
        }
        this.render();
      });
    }
  };

  private disableAttachment = (): boolean => {
    if (this.dragAndDrop) {
      this.dragAndDrop = false;
      this.render();
      this.hints = [];
      return true;
    }
    return false;
  };

  private attachFiles = async (newFiles: string[]) => {
    this.hints = [];
    const date = dayjs().format("YYYY-MM-DD");
    await Promise.all(
      newFiles.map(async (file) => {
        try {
          await this.journal!.attachFile(file, date, 1, true, true, true);
          this.filesAdded.push(file);
          this.render();
        } catch (e) {
          this.hints.push(new Hint(true, `Failed to attach file: ${e}`));
        }
      })
    );
  };

  run = async () => {
    term.grabInput({ mouse: "button" });
    term.fullscreen();

    const self = this;
    const textBuffer: PasteTextBuffer = new PasteTextBuffer();

    textBuffer.onDone(async (text: string) => {
      if (text.length > 5) {
        const newFiles = text
          .split(/(?<!\\)\s+/)
          .filter((file) => file.trim().length > 0);
        await this.attachFiles(newFiles);
      }
    });

    term.on("key", (name: string, _: any, details: any, c: any) => {
      if (details.isCharacter) {
        textBuffer.buff(name);
      }
      if (["LEFT", "BACKSPACE", "ESCAPE"].includes(name)) {
        self.disableAttachment();
      }
      if (name === "CTRL_C") {
        if (!self.disableAttachment()) {
          exit(130);
        }
      }
    });

    await this.render();
  };
}
