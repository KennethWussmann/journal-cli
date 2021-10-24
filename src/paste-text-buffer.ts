export class PasteTextBuffer {
  private buffer: string[] = [];
  private timeout: ReturnType<typeof setTimeout> | undefined;

  private doneHooks: ((text: string) => void)[] = [];

  constructor(private timeoutMs: number = 10) {}

  private restartTimeout = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      const text = this.buffer.join("");
      this.doneHooks.forEach((hook) => hook(text));
      this.timeout = undefined;
      this.reset();
    }, this.timeoutMs);
  };

  private reset = () => {
    this.buffer = [];
  };

  buff = (text: string) => {
    this.buffer.push(text);
    this.restartTimeout();
  };

  onDone = (hook: (text: string) => void) => {
    this.doneHooks.push(hook);
  };
}
