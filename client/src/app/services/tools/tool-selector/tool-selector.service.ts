import { Injectable } from '@angular/core';
import { Tools } from '../../../data-structures/Tools';

@Injectable()
export class ToolSelectorService {

  private activeTool: Tools;

  constructor() {
    this.activeTool = Tools.Pencil;
  }

  set _activeTool(tool: Tools) {
    this.activeTool = tool;
  }

  get _activeTool(): Tools {
    return this.activeTool;
  }

}
