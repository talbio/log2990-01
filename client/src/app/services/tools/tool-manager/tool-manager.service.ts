import { Injectable } from '@angular/core';
import { Tools } from '../../../data-structures/tools';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import { EllipseGeneratorService } from '../ellipse-generator/ellipse-generator.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { EraserService } from '../eraser/eraser.service';
import { EyedropperService } from '../eyedropper/eyedropper.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import { PenGeneratorService } from '../pen-generator/pen-generator.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class ToolManagerService {

  private readonly DEFAULT_NUMBER_OF_ELEMENTS: number = 2;
  private readonly DEFAULT_NUMBER_OF_DEFINITIONS: number = 7;
  private numberOfElements: number;
  private canvasElement: SVGElement;
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
              private penGenerator: PenGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private colorApplicator: ColorApplicatorService,
              private objectSelector: ObjectSelectorService,
              private lineGenerator: LineGeneratorService,
              private polygonGenerator: PolygonGeneratorService,
              private eyedropper: EyedropperService,
              private eraser: EraserService,
              protected colorService: ColorService,
              protected mousePosition: MousePositionService) {
    this.activeTool = Tools.Pencil;
    this.numberOfElements = this.DEFAULT_NUMBER_OF_ELEMENTS;
  }

  createElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator
          .createElement(mouseEvent, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPath(mouseEvent, this.colorService.getPrimaryColor());
        break;
      case Tools.Pen:
        this.penGenerator.createPath(mouseEvent, this.colorService.getSecondaryColor());
        break;
      case Tools.Brush:
        this.brushGenerator
          .createPath(mouseEvent, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Selector:
        this.objectSelector.selectorMouseDown(mouseEvent, canvas);
        break;
      case Tools.Ellipse:
        this.ellipseGenerator
          .createElement(mouseEvent, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Stamp:
        this.emojiGenerator.addEmoji(mouseEvent, canvas);
        break;
      case Tools.Polygon:
        this.polygonGenerator.createElement(mouseEvent, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Eraser:
        this.eraser.startErasing(canvas);
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.updateElement(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.numberOfElements, mouseEvent);
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePath(mouseEvent, this.numberOfElements);
        break;
      case Tools.Pen:
        this.penGenerator.updatePenPath(mouseEvent, canvas);
        break;
      case Tools.Brush:
        this.brushGenerator.updatePath(mouseEvent, this.numberOfElements);
        break;
      case Tools.Selector:
        this.objectSelector.updateSelector(mouseEvent, canvas);
        this.updateNumberOfElements();
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
          this.ellipseGenerator.updateElement(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, this.numberOfElements);
        }
        break;
      case Tools.Polygon:
        this.polygonGenerator.updateElement(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.numberOfElements);
        break;
      case Tools.Eraser:
        this.eraser.moveEraser(canvas);
        break;
      default:
        return;
    }
  }

  finishElement() {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.finishElement();
        break;
      case Tools.Pencil:
        this.pencilGenerator.finishPath();
        break;
      case Tools.Pen:
        this.penGenerator.finishPenPath();
        break;
      case Tools.Brush:
        this.brushGenerator.finishPath();
        break;
      case Tools.Selector:
        this.objectSelector.finish(RendererSingleton.renderer.selectRootElement('#canvas', true));
        this.updateNumberOfElements();
        break;
      case Tools.Ellipse:
        this.ellipseGenerator.finishElement();
        break;
      case Tools.Polygon:
        this.polygonGenerator.finishElement();
        break;
        case Tools.Eraser:
        this.eraser.stopErasing(RendererSingleton.renderer.selectRootElement('#canvas', true));
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
        this.lineGenerator.makeLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.colorService.getSecondaryColor(),
            this.numberOfElements);
        break;
      case Tools.Eyedropper:
        this.eyedropper.changePrimaryColor(clickedElement);
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  changeElementRightClick(clickedElement: SVGElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changeSecondaryColor(clickedElement, this.colorService.getSecondaryColor());
        break;
      case Tools.Eyedropper:
          this.eyedropper.changeSecondaryColor(clickedElement);
          break;
      default:
        return;
    }
  }

  finishElementDoubleClick(mouseEvent: MouseEvent, canvas: SVGElement) {
    if (this._activeTool === Tools.Line) {
      this.lineGenerator.finishElement(mouseEvent, this.numberOfElements);
    }
  }
  changeElementAltDown() {
    this.emojiGenerator.lowerRotationStep();
  }

  changeElementAltUp() {
    this.emojiGenerator.higherRotationStep();
  }

  changeElementShiftDown() {
    this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into square
        this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.numberOfElements);
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
    this.canvasElement = RendererSingleton.getCanvas();
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into rectangle
        this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into ellipse
        this.ellipseGenerator.updateElement(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  drawingNonEmpty(): boolean {
    return this.numberOfElements > 1;
  }

  deleteAllDrawings(): void {
    // Delete the elements
    this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    for (let i = this.canvasElement.children.length - 1; i >= this.DEFAULT_NUMBER_OF_ELEMENTS ; i--) {
      this.canvasElement.children[i].remove();
    }
    // Reset the definitions to its initial values
    const defsElem = RendererSingleton.renderer.selectRootElement('#definitions', true);
    for (let i = defsElem.children.length - 1; i >= this.DEFAULT_NUMBER_OF_DEFINITIONS ; i--) {
      defsElem.children[i].remove();
    }
    // Reset the state of all counters
    this.numberOfElements = this.DEFAULT_NUMBER_OF_ELEMENTS;
    this.resetCounters();
  }

  updateNumberOfElements(): void {
    this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    this.numberOfElements = this.canvasElement.childNodes.length;
  }

  escapePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
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
        this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
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

  synchronizeAllCounters() {
    let brushCount = 0;
    let ellipseCount = 0;
    let polylineCount = 0;
    let pencilCount = 0;
    let rectangleCount = 0;
    let polygonCount = 0;
    const canvas = RendererSingleton.renderer.selectRootElement('#canvas', true);
    for (const child of [].slice.call(canvas.children)) {
      const childCast = child as SVGElement;
      switch (childCast.tagName) {
        case 'defs':
          break;
        case 'rect':
          rectangleCount += 1;
          break;
        case 'ellipse':
          ellipseCount += 1;
          break;
        case 'polygon':
          polygonCount += 1;
          break;
        case 'path':
          if (childCast.id.startsWith('pencil')) {
            pencilCount += 1;
          } else if (childCast.id.startsWith('brush')) {
            brushCount += 1;
          } else {
            alert(`Untreated case: element ${childCast.id}!`);
          }
          break;
        case 'polyline':
          polylineCount += 1;
          break;
        case 'image':
          break;
        default:
          alert(`Untreated item ${childCast.nodeName}!`);
          break;
      }
    }
    // Always remove 1 from rect since the grid is a rectangle
    rectangleCount -= 1;
    this.rectangleGenerator._currentRectNumber = rectangleCount;
    this.ellipseGenerator._currentEllipseNumber = ellipseCount;
    this.lineGenerator._currentPolylineNumber = polylineCount;
    this.brushGenerator._currentBrushPathNumber = brushCount;
    this.pencilGenerator._currentPencilPathNumber = pencilCount;
    this.polygonGenerator._currentPolygonNumber = polygonCount;
  }
  resetCounters() {
    this.rectangleGenerator._currentRectNumber = 0;
    this.ellipseGenerator._currentEllipseNumber = 0;
    this.lineGenerator._currentPolylineNumber = 0;
    this.brushGenerator._currentBrushPathNumber = 0;
    this.pencilGenerator._currentPencilPathNumber = 0;
    this.polygonGenerator._currentPolygonNumber = 0;
  }
}
