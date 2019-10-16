import { Injectable, Renderer2 } from '@angular/core';
import { Tools } from '../../../data-structures/Tools';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
import { EyedropperService } from './../eyedropper/eyedropper.service';
import { LineGeneratorService } from './../line-generator/line-generator.service';
import { PolygonGeneratorService } from './../polygon-generator/polygon-generator.service';

@Injectable()
export class ToolManagerService {

  private numberOfElements = 1;
  private renderer: Renderer2;
  private canvasElement: SVGElement;
  private defsElement: SVGElement;
  private activeTool: Tools;

  set _activeTool(tool: Tools) {
    this.activeTool = tool;
  }

  get _activeTool(): Tools {
    return this.activeTool;
  }

  constructor(private rectangleGenerator: RectangleGeneratorService,
              private ellipseGenerator: EllipseGeneratorService,
              private emojiGenerator: EmojiGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private colorApplicator: ColorApplicatorService,
              private lineGenerator: LineGeneratorService,
              private polygonGenerator: PolygonGeneratorService,
              private eyedropper: EyedropperService,
              protected colorService: ColorService,
              protected mousePosition: MousePositionService) {
    this.activeTool = Tools.Pencil;
  }

  loadRenderer(renderer: Renderer2) {
    this.renderer = renderer;
    // Give it to the tools who also need it
    this.polygonGenerator._renderer = renderer;
    this.colorApplicator._renderer = renderer;
    this.eyedropper._renderer = renderer;
  }

  createElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator
          .createRectangle(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPenPath(mouseEvent, canvas, this.colorService.getPrimaryColor());
        break;
      case Tools.Brush:
        this.brushGenerator.createBrushPath(mouseEvent, canvas);
        break;
      case Tools.Ellipse:
        this.ellipseGenerator
          .createEllipse(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Stamp:
        this.emojiGenerator.addEmoji(mouseEvent, canvas);
        break;
      case Tools.Polygon:
        this.polygonGenerator.createPolygon(mouseEvent, canvas, this.colorService.getSecondaryColor(),
          this.colorService.getPrimaryColor());
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        if (mouseEvent.shiftKey) {
          this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        } else {
          this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        }
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Brush:
        this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Line:
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        break;
      case Tools.Ellipse:
        if (mouseEvent.shiftKey) {
          this.ellipseGenerator.updateCircle(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        } else {
          this.ellipseGenerator.updateEllipse(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        }
        break;
      case Tools.Polygon:
        this.polygonGenerator.updatePolygon(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
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
      case Tools.Ellipse:
        this.ellipseGenerator.finishEllipse();
        break;
      case Tools.Polygon:
        this.polygonGenerator.finishPolygon();
        break;
      default:
        return;
    }
  }

  changeElementLeftClick(clickedElement: SVGElement,  canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(clickedElement, this.colorService.getPrimaryColor());
        break;
      case Tools.Line:
        this.defsElement = this.renderer.selectRootElement('#definitions', true);
        this.lineGenerator.makeLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.colorService.getPrimaryColor(),
            this.numberOfElements, this.defsElement, this.renderer);
        break;
      case Tools.Eyedropper:
        this.eyedropper.getColorOnPixel(canvas);
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

  finishElementDoubleClick(mouseEvent: MouseEvent, canvas: SVGElement) {
    if (this._activeTool === Tools.Line) {
      if (mouseEvent.shiftKey) {
        this.lineGenerator.finishAndLinkLineBlock(canvas, this.numberOfElements);
      } else {
        this.lineGenerator.finishLineBlock(canvas, this.numberOfElements);
      }
    }
  }

  changeElementShiftDown() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into square
        this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into circle
        this.ellipseGenerator.updateCircle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeElementShiftUp() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into rectangle
        this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into ellipse
        this.ellipseGenerator.updateEllipse(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
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
    for (let i = this.canvasElement.children.length - 1; i > 0; i--) {
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
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  rotateEmoji(mouseEvent: WheelEvent): void {
    this.emojiGenerator.rotateEmoji(mouseEvent);
  }
}
