import { Injectable } from '@angular/core';
import {ToolManagerService} from "../../tools/tool-manager/tool-manager.service";

@Injectable({
  providedIn: 'root',
})
export class SaveDrawingService {

  private svgCanvas: any;

  constructor(private toolManager: ToolManagerService) {}

  set _svgCanvas(svgCanvas: any) {
    this.svgCanvas = svgCanvas;
  }

  svgToJson() {
    console.log(this.svgCanvas.innerHTML);
  }
}
