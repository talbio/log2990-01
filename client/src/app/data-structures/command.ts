export interface CommandGenerator {
  /**
   * @desc: this method has to do only one thing when implemented:
   * call pushCommand method from undoRedo Service and pass the command as parameter.
   */
  pushCommand(command: Command): void;
}

export interface Command {
  execute(): void;
  unexecute(): void;
}
