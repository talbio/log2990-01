import { Injectable } from '@angular/core';
import { Tools } from '../../../data-structures/Tools';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import { EllipseGeneratorService } from '../ellipse-generator/ellipse-generator.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { EyedropperService } from '../eyedropper/eyedropper.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
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
  private hasBeenTranslated: boolean;

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
              private objectSelector: ObjectSelectorService,
              private lineGenerator: LineGeneratorService,
              private polygonGenerator: PolygonGeneratorService,
              private eyedropper: EyedropperService,
              protected colorService: ColorService,
              protected mousePosition: MousePositionService) {
    this.activeTool = Tools.Pencil;
    this.numberOfElements = this.DEFAULT_NUMBER_OF_ELEMENTS;
    this.hasBeenTranslated = false;
  }

  createElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator
          .createRectangle(canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPenPath(canvas, this.colorService.getSecondaryColor());
        break;
      case Tools.Brush:
        this.brushGenerator
          .createBrushPath(canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Selector:
        this.objectSelector.createSelectorRectangle(canvas);
        break;
      case Tools.Ellipse:
        this.ellipseGenerator
          .createEllipse(canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Stamp:
        this.emojiGenerator.addEmoji(canvas);
        break;
      case Tools.Polygon:
        this.polygonGenerator.createPolygon(canvas, this.colorService.getSecondaryColor(),
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
          this.rectangleGenerator.updateSquare(canvas, this.numberOfElements);
        } else {
          this.rectangleGenerator.updateRectangle(canvas, this.numberOfElements);
        }
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(canvas, this.numberOfElements);
        break;
      case Tools.Brush:
        this.brushGenerator.updateBrushPath(canvas, this.numberOfElements);
        break;
      case Tools.Selector:
        this.objectSelector.updateSelectorRectangle(canvas);
        this.updateNumberOfElements();
        break;
      case Tools.Line:
        this.lineGenerator.updateLine(canvas, this.numberOfElements);
        break;
      case Tools.Ellipse:
        if (mouseEvent.shiftKey) {
          this.ellipseGenerator.updateCircle(canvas, this.numberOfElements);
        } else {
          this.ellipseGenerator.updateEllipse(canvas, this.numberOfElements);
        }
        break;
      case Tools.Polygon:
        this.polygonGenerator.updatePolygon(canvas, this.numberOfElements);
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
      case Tools.Selector:
        this.objectSelector.finishSelector(RendererSingleton.renderer.selectRootElement('#canvas', true));
        this.updateNumberOfElements();
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
        this.lineGenerator.makeLine(canvas, this.colorService.getSecondaryColor(),
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
      if (mouseEvent.shiftKey) {
        this.lineGenerator.finishAndLinkLineBlock(canvas, this.numberOfElements);
      } else {
        this.lineGenerator.finishLineBlock(canvas, this.numberOfElements);
      }
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
        this.rectangleGenerator.updateSquare(this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into circle
        this.ellipseGenerator.updateCircle(this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeElementShiftUp() {
    this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into rectangle
        this.rectangleGenerator.updateRectangle(this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into ellipse
        this.ellipseGenerator.updateEllipse(this.canvasElement, this.numberOfElements);
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
  selectorMouseDown(): void {
    const selectorBox = this.canvasElement.querySelector('#boxrect') as SVGGElement;
    const box = selectorBox.getBBox();
    if (this.mousePosition.canvasMousePositionX < box.x || this.mousePosition.canvasMousePositionX > (box.x + box.width)
      || this.mousePosition.canvasMousePositionY < box.y || this.mousePosition.canvasMousePositionY > (box.y + box.height)) {
        this.removeSelector();
    } else { this.objectSelector.startTranslation(); }
  }

  translate(): void {
    this.objectSelector.translate();
  }

  finishTranslation(): void {
    this.objectSelector.drop();
    this.hasBeenTranslated = true;
  }

  removeSelector(): void {
    const box = this.canvasElement.querySelector('#box') as SVGElement;
    const boxrect = this.canvasElement.querySelector('#boxrect') as SVGElement;
    const selected = this.canvasElement.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    childArray.forEach((child) => {
      if (this.hasBeenTranslated) {
      this.changeChildPosition(child, box);
      }
      this.canvasElement.appendChild(child);
    });
    box.removeChild(boxrect);
    this.canvasElement.removeChild(box);
    this.hasBeenTranslated = false;
  }

  backSpacePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLine(this.canvasElement, this.numberOfElements);
        this.lineGenerator.updateLine(this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeChildPosition(child: Element, box: SVGElement): void {
    let newX: number;
    let newY: number;
    switch (child.nodeName) {
      case 'rect':
      case 'image':
        newX = parseFloat('' + child.getAttribute('x')) + parseFloat('' + box.getAttribute('x'));
        newY = parseFloat('' + child.getAttribute('y')) + parseFloat('' + box.getAttribute('y'));
        child.setAttribute('x', newX as unknown as string);
        child.setAttribute('y', newY as unknown as string);
        break;
      case 'ellipse':
        newX = parseFloat('' + child.getAttribute('cx')) + parseFloat('' + box.getAttribute('x'));
        newY = parseFloat('' + child.getAttribute('cy')) + parseFloat('' + box.getAttribute('y'));
        child.setAttribute('cx', newX as unknown as string);
        child.setAttribute('cy', newY as unknown as string);
        break;
      case 'path':
      case 'polyline':
      case 'polygon':
        const xforms = child.getAttribute('transform');
        if (xforms) {
          const parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms as string) as unknown as string;
          const firstX = parseFloat(parts[1]);
          const firstY = parseFloat(parts[2] );
          newX = parseFloat('' + (firstX + parseFloat(box.getAttribute('x') as string)));
          newY = parseFloat('' + (firstY + parseFloat(box.getAttribute('y') as string)));
        } else {
          newX = parseFloat('' + box.getAttribute('x'));
          newY = parseFloat('' + box.getAttribute('y'));
        }
        child.setAttribute('transform', 'translate(' + newX + ' ' + newY + ')');
        break;
      default:
        break;
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
