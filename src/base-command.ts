import { Command, flags } from "@oclif/command";

export default abstract class extends Command {
  static flags: Record<string, any> = {
    help: flags.help({ char: "h" }),
    journalDir: flags.string({
      char: "j",
      description: "Custom journal directory path",
      default: "./",
    }),
  };
}
