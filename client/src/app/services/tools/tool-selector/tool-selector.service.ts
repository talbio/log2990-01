import { Injectable } from '@angular/core';

@Injectable()
export class ToolSelectorService {

  activeTool = 'pen';

constructor() {}

  setRectangleTool() {
    this.activeTool = 'rectangle';
  }

  setPenTool() {
    this.activeTool = 'pen';
  }

}
