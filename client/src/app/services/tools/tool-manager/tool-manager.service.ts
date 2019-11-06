import { Injectable } from '@angular/core';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
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
  private generators: AbstractGenerator[];

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
              private eraser: EraserService,
              protected colorService: ColorService,
              protected mousePosition: MousePositionService) {
    this.activeTool = Tools.Pencil;
    this.numberOfElements = this.DEFAULT_NUMBER_OF_ELEMENTS;
    this.hasBeenTranslated = false;
    this.initializeGenerators();
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
      case Tools.Brush:
        this.brushGenerator
          .createPath(mouseEvent, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Selector:
        this.objectSelector.createSelectorRectangle(mouseEvent, canvas);
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
      case Tools.Brush:
        this.brushGenerator.updatePath(mouseEvent, this.numberOfElements);
        break;
      case Tools.Selector:
        this.objectSelector.updateSelectorRectangle(mouseEvent, canvas);
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
      case Tools.Brush:
        this.brushGenerator.finishPath();
        break;
      case Tools.Selector:
        this.objectSelector.finishSelector(RendererSingleton.renderer.selectRootElement('#canvas', true));
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
    this.canvasElement = RendererSingleton.canvas;
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
  selectorMouseDown(): void {
    const selectorBox = this.canvasElement.querySelector('#boxrect') as SVGGElement;
    const box = selectorBox.getBBox();
    if (this.mousePosition._canvasMousePositionX < box.x || this.mousePosition._canvasMousePositionX > (box.x + box.width)
      || this.mousePosition._canvasMousePositionY < box.y || this.mousePosition._canvasMousePositionY > (box.y + box.height)) {
        this.removeSelector();
    } else { this.objectSelector.startTranslation(); }
  }

  translate(mouseEvent: MouseEvent): void {
    this.objectSelector.translate(mouseEvent);
  }

  finishTranslation(): void {
    this.objectSelector.drop();
    this.hasBeenTranslated = true;
    const selected = this.canvasElement.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    const box = this.canvasElement.querySelector('#box') as SVGElement;
    childArray.forEach((child) => {
      if (this.hasBeenTranslated) {
        this.changeChildPosition(child, box);
      }
    });
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
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
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
    const counters: Map<AbstractGenerator, number> = new Map<AbstractGenerator, number>();
    this.generators.forEach( (generator: AbstractGenerator) => counters.set(generator, 0));
    for (const child of [].slice.call(RendererSingleton.canvas.children)) {
      const childCast = child as SVGElement;
      switch (childCast.tagName) {
        case 'rect':
          this.incrementCounter(counters, this.rectangleGenerator);
          break;
        case 'ellipse':
          this.incrementCounter(counters, this.ellipseGenerator);
          break;
        case 'polygon':
          this.incrementCounter(counters, this.polygonGenerator);
          break;
        case 'path':
          if (childCast.id.startsWith('pencil')) {
            this.incrementCounter(counters, this.pencilGenerator);
          } else if (childCast.id.startsWith('brush')) {
            this.incrementCounter(counters, this.brushGenerator);
          }
          break;
        case 'polyline':
          this.incrementCounter(counters, this.lineGenerator);
          break;
        default:
          break;
      }
    }
    // Always remove 1 from rect since the grid is a rectangle
    let count = counters.get(this.rectangleGenerator) as number;
    counters.set(this.rectangleGenerator, --count);
    this.generators.forEach( (generator: AbstractGenerator) =>
      generator.currentElementsNumber = counters.get(generator) as number);
  }

  private resetCounters(): void {
    this.generators.forEach( (generator: AbstractGenerator) => generator.currentElementsNumber = 0);
  }

  private incrementCounter(counters: Map<AbstractGenerator, number>, generator: AbstractGenerator): void {
    let count = counters.get(generator) as number;
    counters.set(generator, ++count);
  }

  private initializeGenerators(): void {
    this.generators.push(
      this.rectangleGenerator,
      this.ellipseGenerator,
      this.emojiGenerator,
      this.pencilGenerator,
      this.brushGenerator,
      this.lineGenerator,
      this.polygonGenerator);
  }
}
