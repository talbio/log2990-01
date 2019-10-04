import {Injectable, Renderer2} from '@angular/core';
import {Tools} from '../../../data-structures/Tools';
import {BrushGeneratorService} from '../brush-generator/brush-generator.service';
import {ColorApplicatorService} from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import {PencilGeneratorService} from '../pencil-generator/pencil-generator.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';
import { LineGeneratorService } from './../line-generator/line-generator.service';

@Injectable()
export class ToolManagerService {

  private numberOfElements = 1;
  private renderer: Renderer2;
  private canvasElement: HTMLElement;
  private activeTool: Tools;

  set _activeTool(tool: Tools) {
    this.activeTool = tool;
  }

  get _activeTool(): Tools {
    return this.activeTool;
  }

  constructor(private rectangleGenerator: RectangleGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private colorApplicator: ColorApplicatorService,
              private lineGenerator: LineGeneratorService,
              protected colorService: ColorService) {
    this.activeTool = Tools.Pencil;
  }

  loadRenderer(renderer: Renderer2) {
    this.renderer = renderer;
  }

  createElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.createRectangle(mouseEvent, canvas,
           this.colorService.getSecondaryColor(), this.colorService.getPrimaryColor());
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
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
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
      case Tools.Line:
        this.lineGenerator.updateLine(mouseEvent, canvas, this.numberOfElements);
        break;
      default:
          return;
    }
  }

  finishElement() {
    switch (this._activeTool) {
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
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(clickedElement, this.colorService.getPrimaryColor());
        break;
      default:
        return;
    }
  }

  createElementOnClick(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
      case Tools.Line:
        this.lineGenerator.makeLine(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.numberOfElements);
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  changeElementRightClick(clickedElement: HTMLElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changeSecondaryColor(clickedElement, this.colorService.getSecondaryColor());
        break;
      default:
        return;
    }
  }

  finishElementDoubleClick(mouseEvent: MouseEvent, canvas: HTMLElement) {
    if (this._activeTool === Tools.Line) {
      if (mouseEvent.shiftKey) {
        this.lineGenerator.finishAndLinkLineBlock(mouseEvent, canvas, this.numberOfElements);
      } else {
        this.lineGenerator.finishLineBlock();
      }
    }
  }

  changeElementShiftDown() {
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into square
        // this.rectangleGenerator.updateSquare(mouseEvent, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeElementShiftUp() {
    switch (this._activeTool) {
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

  escapePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = this.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLineBlock(this.canvasElement, this.numberOfElements);
        this.numberOfElements = this.canvasElement.children.length;
        break;
      default:
        return;
    }
  }

  backSpacePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = this.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLine(this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }
}
