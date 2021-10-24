import { Command, flags } from "@oclif/command";
import { JournalService } from "./journal-service";

export default abstract class extends Command {
  journal: JournalService | undefined;

  static flags: Record<string, any> = {
    help: flags.help({ char: "h" }),
    journalDir: flags.string({
      char: "j",
      description: "Custom journal directory path",
      default: "./",
    }),
  };

  init = async (): Promise<void> => {
    const { flags } = this.parse(this.constructor as any);
    this.journal = new JournalService((flags as any).journalDir);
  };
}
