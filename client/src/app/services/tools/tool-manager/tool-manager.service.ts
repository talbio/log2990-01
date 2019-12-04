import { Injectable } from '@angular/core';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import {Tools} from '../../../data-structures/tools';
import {RendererSingleton} from '../../renderer-singleton';
import {RotateService} from '../../transformations/rotate.service';
import {ScaleService} from '../../transformations/scale.service';
import { AerosolGeneratorService } from '../aerosol-generator/aerosol-generator.service';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import { EllipseGeneratorService } from '../ellipse-generator/ellipse-generator.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { EraserService } from '../eraser/eraser.service';
import { EyedropperService } from '../eyedropper/eyedropper.service';
import { FeatherPenGeneratorService } from '../feather-pen-generator/feather-pen-generator.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import { PenGeneratorService } from '../pen-generator/pen-generator.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class ToolManagerService {

  private readonly DEFAULT_NUMBER_OF_ELEMENTS: number = 2;
  private readonly DEFAULT_NUMBER_OF_DEFINITIONS: number = 8;
  private numberOfElements: number;
  private canvasElement: SVGElement;
  private activeTool: Tools;
  private activeGenerator: AbstractGenerator | undefined;
  private generators: AbstractGenerator[];

  set _activeTool(tool: Tools) {
    if (this.activeTool === Tools.Selector && tool !== Tools.Selector) {
      this.removeSelectorBoundingRect();
    }
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
              private aerosolGenerator: AerosolGeneratorService,
              private eyedropper: EyedropperService,
              private eraser: EraserService,
              private featherGenerator: FeatherPenGeneratorService,
              protected colorService: ColorService,
              private scaleService: ScaleService,
              private rotateService: RotateService) {
    this._activeTool = Tools.Pencil;
    this.numberOfElements = this.DEFAULT_NUMBER_OF_ELEMENTS;
    this.initializeGenerators();
  }

  createElement(canvas: SVGElement) {
    if (this.activeGenerator && this.activeGenerator !== this.lineGenerator) {
      this.activeGenerator.createElement(
        [this.colorService.getPrimaryColor(),
        this.colorService.getSecondaryColor()],
      );
    } else {
      switch (this._activeTool) {
        case Tools.Selector:
          this.objectSelector.onMouseDown();
          break;
        case Tools.Eraser:
          this.eraser.startErasing();
          break;
        default:
          break;
      }
    }
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent) {
    if (this.activeGenerator) {
      this.activeGenerator.updateElement(this.numberOfElements, mouseEvent);
    } else {
      switch (this._activeTool) {
        case Tools.Selector:
          this.objectSelector.onMouseMove(this.numberOfElements, mouseEvent);
          this.updateNumberOfElements();
          break;
        case Tools.Eraser:
          this.eraser.moveEraser();
          break;
        default:
          break;
      }
    }
  }

  finishElement() {
    if (this.activeGenerator && this.activeGenerator !== this.lineGenerator) {
      this.activeGenerator.finishElement();
    } else {
      switch (this._activeTool) {
        case Tools.Selector:
          this.objectSelector.onMouseUp();
          this.updateNumberOfElements();
          break;
        case Tools.Eraser:
          this.eraser.stopErasing();
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
        this.lineGenerator.createElement([this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor()]);
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
    this.featherGenerator.lowerRotationStep();
    this.rotateService.lowerRotationStep();
    this.scaleService.scaleFromCenter = true;
  }

  changeElementAltUp() {
    this.emojiGenerator.higherRotationStep();
    this.featherGenerator.higherRotationStep();
    this.rotateService.higherRotationStep();
    this.scaleService.scaleFromCenter = false;
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
      case Tools.Selector:
        this.objectSelector.scale(true);
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
      case Tools.Selector:
        this.objectSelector.scale(false);
        break;
      default:
        return;
    }
  }

  drawingNonEmpty(): boolean {
    return this.numberOfElements > this.DEFAULT_NUMBER_OF_ELEMENTS;
  }

  deleteAllDrawings(): void {
    // Disable selection if it is active
    this.removeSelectorBoundingRect();

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
    if (this._activeTool === Tools.Line) {
      this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
      this.lineGenerator.deleteLineBlock(this.canvasElement, this.numberOfElements);
      this.numberOfElements = this.canvasElement.children.length;
    }
  }

  backSpacePress() {
    if (this._activeTool === Tools.Line) {
        this.canvasElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLine();
        this.lineGenerator.updateElement(this.numberOfElements);
    }
  }

  rotateDispatcher(mouseEvent: WheelEvent): void {
    if (this.activeGenerator === this.emojiGenerator) {
      this.emojiGenerator.rotateEmoji(mouseEvent);
    } else if (this.activeGenerator === this.featherGenerator) {
      this.featherGenerator.rotateFeather(mouseEvent);
    } else if (this.objectSelector.selectedElements.length && this.activeTool === Tools.Selector) {
      this.objectSelector.rotate(mouseEvent);
    }
  }

  returnGeneratorFromElement(svgElement: SVGElement): AbstractGenerator | undefined {
    switch (svgElement.tagName) {
      case 'rect':
        return this.rectangleGenerator;
      case 'ellipse':
        return this.ellipseGenerator;
      case 'polygon':
        if (svgElement.id.startsWith('polygon')) {
          return this.polygonGenerator;
        } else if (svgElement.id.startsWith('featherPenPath')) {
          return this.featherGenerator;
        } else {
          return undefined;
        }
      case 'path':
        if (svgElement.id.startsWith('pencil')) {
          return this.pencilGenerator;
        } else if (svgElement.id.startsWith('brush')) {
          return this.brushGenerator;
        } else if (svgElement.id.startsWith('penPath')) {
          return this.penGenerator;
        } else {
          return undefined;
        }
      case 'polyline':
        return this.lineGenerator;
      case 'image':
        return this.emojiGenerator;
      case 'circle':
        return this.aerosolGenerator;
      default:
        return undefined;
    }
  }

  synchronizeAllCounters() {
    const counters: Map<AbstractGenerator, number> = new Map<AbstractGenerator, number>();
    this.generators.forEach( (generator: AbstractGenerator) => counters.set(generator, 0));
    const multiplePartItemsIdList: string[] = [''];
    for (const child of [].slice.call(RendererSingleton.canvas.children)) {
      const childCast = child as SVGElement;
      const generator: AbstractGenerator | undefined = this.returnGeneratorFromElement(childCast);
      if (generator) {
        if (this.isMultiplePartItemsGenerator(generator)) {
          const index = multiplePartItemsIdList.indexOf(childCast.id);
          if (index === -1) {
            // This is a new pen path
            this.incrementCounter(counters, generator);
            multiplePartItemsIdList.push(childCast.id);
        }
      } else {
          this.incrementCounter(counters, generator);
        }
      }
    }
    // Always remove 1 from rect since the grid is a rectangle
    let count = counters.get(this.rectangleGenerator) as number;
    counters.set(this.rectangleGenerator, --count);
    this.generators.forEach( (generator: AbstractGenerator) =>
      generator.currentElementsNumber = counters.get(generator) as number);
    this.numberOfElements = RendererSingleton.canvas.childNodes.length;
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
      this.penGenerator,
      this.brushGenerator,
      this.lineGenerator,
      this.polygonGenerator,
      this.featherGenerator,
      this.aerosolGenerator);
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
      case Tools.Pen:
        this.activeGenerator = this.penGenerator;
        break;
      case Tools.Feather:
        this.activeGenerator = this.featherGenerator;
        break;
      case Tools.Aerosol:
        this.activeGenerator = this.aerosolGenerator;
        break;
      default:
        this.activeGenerator = undefined;
        break;
    }
  }
  isMultiplePartItemsGenerator(generator: AbstractGenerator): boolean {
    let isMultiplePart = false;
    const multiplePartItemGenerators: AbstractGenerator[] = [
      this.featherGenerator,
      this.penGenerator,
      this.aerosolGenerator,
    ];
    multiplePartItemGenerators.forEach((multiplePartItemGenerator: AbstractGenerator) => {
      if (generator === multiplePartItemGenerator) {
        isMultiplePart = true;
      }
    });
    return isMultiplePart;
  }

  removeSelectorBoundingRect(): void {
    if (this.objectSelector.selectorRect) {
      this.objectSelector.finishSelection();
    }
    if (this.objectSelector.hasBoundingRect) {
      this.objectSelector.removeGBoundingRect();
      this.objectSelector.selectedElements = [];
    }
  }
}
