
export interface ActionGenerator {

  pushAction(svgElement: SVGElement): void;
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
