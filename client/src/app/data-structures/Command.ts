
export interface Command {
  pushAction(svgElement: SVGElement): void;
  do(svgElement: SVGElement): Action;
  undo(): Action;
}

export interface Action {
  actionType: ActionType;
  svgElements: SVGElement[];
  execute(): void;
  unexecute(): void;
}

export enum ActionType {
  Create,
  Delete,
  Translate,
  Rotate,
  Resize,
}
