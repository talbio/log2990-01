import { Injectable } from '@angular/core';

@Injectable()
export class ToolSelectorService {

  private activeTool: string;

constructor() {
  this.activeTool = 'pen';
}

  setRectangleTool(): void {
    this.activeTool = 'rectangle';
  }

  setPencilTool(): void {
    this.activeTool = 'pen';
  }

  get _activeTool(): string {
    return this.activeTool;
  }

}
