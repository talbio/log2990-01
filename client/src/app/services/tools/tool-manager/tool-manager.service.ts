import {Injectable, Renderer2} from '@angular/core';
import {Tools} from '../../../data-structures/Tools';
import {BrushGeneratorService} from '../brush-generator/brush-generator.service';
import {ColorApplicatorService} from '../color-applicator/color-applicator.service';
import {PencilGeneratorService} from '../pencil-generator/pencil-generator.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../tool-selector/tool-selector.service';
import { ColorService } from '../color/color.service';

@Injectable()
export class ToolManagerService {

  private numberOfElements = 1;
  private renderer: Renderer2;
  private canvasElement: any;
  

  constructor(private rectangleGenerator: RectangleGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private colorApplicator: ColorApplicatorService,
              private toolSelector: ToolSelectorService,
              private colorService: ColorService) {
  }

  loadRenderer(renderer: Renderer2) {
    this.renderer = renderer;
  }

  createElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.createRectangle(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPenPath(mouseEvent, canvas, this.colorService.getPrimaryColor());
        break;
      case Tools.Brush:
        this.brushGenerator.createBrushPath(mouseEvent, canvas);
        break;
      default:
        return;
    }
    this.numberOfElements += 1;
  }

  updateElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        if (mouseEvent.shiftKey) {
          this.rectangleGenerator.updateSquare(mouseEvent, canvas, this.numberOfElements);
        } else {
          this.rectangleGenerator.updateRectangle(mouseEvent, canvas, this.numberOfElements);
        }
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Brush:
          this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
          break;
      default:
          return;
    }
  }

  finishElement() {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.finishRectangle();
        break;
      case Tools.Pencil:
        this.pencilGenerator.finishPenPath();
        break;
      case Tools.Brush:
        this.brushGenerator.finishBrushPath();
        break;
      default:
        return;
    }
  }

  changeElementLeftClick(clickedElement: HTMLElement) {
    switch (this.toolSelector._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(clickedElement, this.colorService.getPrimaryColor());
        break;
      default:
        return;
    }
  }

  changeElementRightClick(clickedElement: HTMLElement) {
    switch (this.toolSelector._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changeSecondaryColor(clickedElement, this.colorService.getSecondaryColor());
        break;
      default:
        return;
    }
  }

  changeElementShiftDown() {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        // change into square
        // this.rectangleGenerator.updateSquare(mouseEvent, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeElementShiftUp() {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        // change into rectangle
        // this.rectangleGenerator.updateRectangle(mouseEvent, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  drawingNonEmpty(): boolean {
    return this.numberOfElements > 1;
  }

  deleteAllDrawings(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    for (let i = this.canvasElement.children.length - 1; i > 0 ; i--) {
      this.canvasElement.children[i].remove();
    }
    this.numberOfElements = 1;
  }
}
