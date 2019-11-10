import { Injectable } from '@angular/core';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import { Tools } from '../../../data-structures/tools';
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
  private activeGenerator: AbstractGenerator | undefined;
  private generators: AbstractGenerator[];

  set _activeTool(tool: Tools) {
    this.activeTool = tool;
    this.setCurrentGenerator(tool);
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
              protected colorService: ColorService) {
    this._activeTool = Tools.Pencil;
    this.numberOfElements = this.DEFAULT_NUMBER_OF_ELEMENTS;
    this.initializeGenerators();
  }

  createElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    if (this.activeGenerator && this.activeGenerator !== this.lineGenerator) {
      this.activeGenerator.createElement(
        this.colorService.getPrimaryColor(),
        this.colorService.getSecondaryColor(),
      );
    } else {
      switch (this._activeTool) {
        case Tools.Selector:
          this.objectSelector.onMouseDown(mouseEvent);
          break;
        case Tools.Eraser:
          this.eraser.startErasing(canvas);
          break;
        default:
          break;
      }
    }
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    if (this.activeGenerator) {
      this.activeGenerator.updateElement(this.numberOfElements, mouseEvent);
    } else {
      switch (this._activeTool) {
        case Tools.Selector:
          this.objectSelector.onMouseMove(this.numberOfElements, mouseEvent);
          this.updateNumberOfElements();
          break;
        case Tools.Eraser:
          this.eraser.moveEraser(canvas);
          break;
        default:
          break;
      }
    }
  }

  finishElement(mouseEvent: MouseEvent) {
    if (this.activeGenerator && this.activeGenerator !== this.lineGenerator) {
      this.activeGenerator.finishElement(mouseEvent);
    } else {
      switch (this._activeTool) {
        case Tools.Selector:
          this.objectSelector.onMouseUp();
          this.updateNumberOfElements();
          break;
        case Tools.Eraser:
          this.eraser.stopErasing(RendererSingleton.canvas);
          break;
        default:
          break;
      }
    }
  }

  changeElementLeftClick(clickedElement: SVGElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(clickedElement, this.colorService.getPrimaryColor());
        break;
      case Tools.Line:
        this.lineGenerator.createElement(this.colorService.getSecondaryColor());
        break;
      case Tools.Eyedropper:
        this.eyedropper.changePrimaryColor(clickedElement);
        break;
      default:
        break;
    }
    this.numberOfElements = RendererSingleton.canvas.children.length;
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

  finishElementDoubleClick(mouseEvent: MouseEvent) {
    if (this._activeTool === Tools.Line) {
      this.lineGenerator.finishElement(mouseEvent);
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
        this.rectangleGenerator.updateSquare(this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into circle
        this.ellipseGenerator.updateCircle(this.numberOfElements);
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
        this.rectangleGenerator.updateRectangle(this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into ellipse
        this.ellipseGenerator.updateEllipse(this.numberOfElements);
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
        this.lineGenerator.deleteLine();
        this.lineGenerator.updateElement(this.numberOfElements);
        break;
      default:
        return;
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
          } else {
            this.incrementCounter(counters, this.penGenerator);
          }
          break;
        case 'polyline':
          this.incrementCounter(counters, this.lineGenerator);
          break;
        case 'image':
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
    this.generators = [];
    this.generators.push(
      this.rectangleGenerator,
      this.ellipseGenerator,
      this.emojiGenerator,
      this.pencilGenerator,
      this.brushGenerator,
      this.lineGenerator,
      this.polygonGenerator);
  }

  private setCurrentGenerator(tool: Tools): void {
    switch (tool) {
      case Tools.Pencil:
        this.activeGenerator = this.pencilGenerator;
        break;
      case Tools.Brush:
        this.activeGenerator = this.brushGenerator;
        break;
      case Tools.Rectangle:
        this.activeGenerator = this.rectangleGenerator;
        break;
      case Tools.Ellipse:
        this.activeGenerator = this.ellipseGenerator;
        break;
      case Tools.Polygon:
        this.activeGenerator = this.polygonGenerator;
        break;
      case Tools.Line:
        this.activeGenerator = this.lineGenerator;
        break;
      case Tools.Stamp:
        this.activeGenerator = this.emojiGenerator;
        break;
      default:
        this.activeGenerator = undefined;
        break;
    }
  }
}
