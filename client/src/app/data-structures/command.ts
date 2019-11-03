
export interface ActionGenerator {

  pushAction(svgElement: SVGElement, ...vals: string[]): void;
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
