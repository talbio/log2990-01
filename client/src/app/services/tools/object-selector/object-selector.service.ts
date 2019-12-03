import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { Command } from 'src/app/data-structures/command';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { Transformation, TransformationService } from '../../transformation/transformation.service';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
import { GridTogglerService } from '../grid/grid-toggler.service';
import { MagnetismGeneratorService } from '../magnetism-generator/magnetism-generator.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';

const POINT_CONTROL_SIZE = 10;
const STROKE_COLOR = Colors.BLUE;

interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoundingRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

@Injectable()
export class ObjectSelectorService {

  private readonly SELECTOR_RECT_ID = 'selectorRect';
  private readonly BOUNDING_RECT_ID = 'boundingRect';
  private readonly G_BOUNDING_RECT_ID = 'gBoundingRect';

  selectedElements: SVGElement[];
  private isTranslating: boolean;
  private initialTransformValues: Map<SVGElement, string>;
  hasBoundingRect: boolean;
  initialX: number;
  initialY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;

  private isScaling: boolean;
  private currentMarker: string;
  private mouseDown: boolean;

  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService,
              private magnetism: MagnetismGeneratorService,
              private transform: TransformationService,
              private grid: GridTogglerService,
              private undoRedoService: UndoRedoService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
    this.isScaling = false;
    this.isTranslating = false;
    this.initialTransformValues = new Map<SVGElement, string>();
    this.selectedElements = [];
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;
  }

  get canvasBoundingRect(): BoundingRect {
    return {
      left: RendererSingleton.canvas.getBoundingClientRect().left,
      right: RendererSingleton.canvas.getBoundingClientRect().right,
      bottom: RendererSingleton.canvas.getBoundingClientRect().bottom,
      top: RendererSingleton.canvas.getBoundingClientRect().top,
    };
  }

  get selectorRect(): SVGElement {
    return RendererSingleton.canvas.querySelector('#' + this.SELECTOR_RECT_ID) as SVGElement;
  }

  get boundingRect(): SVGElement {
    return this.gBoundingRect.querySelector('#' + this.BOUNDING_RECT_ID) as SVGGElement;
  }

  get gBoundingRect(): SVGGElement {
    return RendererSingleton.canvas.querySelector('#' + this.G_BOUNDING_RECT_ID) as SVGGElement;
  }

  updateStartPos(): void {
    this.startX = this.mousePosition.canvasMousePositionX;
    this.startY = this.mousePosition.canvasMousePositionY;
    this.startWidth = this.currentBoundingRectDimensions.width;
    this.startHeight = this.currentBoundingRectDimensions.height;
  }

  // private initialValues: Map<SVGElement, string>;
  onMouseDown() {
    this.mouseDown = true;
    this.initialX = this.mousePosition.canvasMousePositionX;
    this.initialY = this.mousePosition.canvasMousePositionY;
    if (this.hasBoundingRect) {
      if (this.isScaling) {
        this.initialTransformValues  = this.createTransformationMap(this.selectedElements);
        this.updateStartPos();
        return;
      }
      if (this.isMouseOutsideGBoundingRect()) {
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeGBoundingRect();
      } else {
        // initiate translation
        this.updateStartPos();
        this.beginTranslation();
      }
    } else {
      this.selectedElements = [];
      this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
    }
  }

  onMouseMove(currentChildPosition: number, mouseEvent: MouseEvent): void {
    if (this.mouseDown) {
      if (this.hasBoundingRect) {
        if (this.isScaling) {
          this.scale();
          return;
        }
        if (this.isTranslating) {
          this.magnetism.setMovementDirection(mouseEvent);
          this.translate();
          return;
        }
      } else {
        this.rectangleGenerator.updateElement(currentChildPosition, mouseEvent);
        return;
      }
    }
  }

  onMouseUp(): void {
    if (!this.hasBoundingRect) {
      this.finishSelection();
    } else {
      this.finishTranslation();
      this.mouseDown = false;
    }
    if (this.isScaling) {
      this.isScaling = false;
    }
    this.currentBoundingRectDimensions = this.getBoundingRectDimensions();
    this.mouseDown = false;
  }

  updateSelectedItems(): void {
    const drawings = RendererSingleton.canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon, circle');
    drawings.forEach((svgElement: SVGElement) => {
      if (this.isElementInsideSelection(svgElement) && !this.selectedElements.includes(svgElement)) {
        this.selectedElements.push(svgElement);
        if (svgElement.id.startsWith('penPath') || svgElement.id.startsWith('featherPenPath') || svgElement.id.startsWith('aerosol')) {
          // Remove this instance since it will be pushed with foreach
          this.selectedElements.pop();
          drawings.forEach((element: SVGElement) => {
            if (element.id === svgElement.id) {
              this.selectedElements.push(element as SVGElement);
            }
          });
        }
      }
    });
  }

  isElementInsideSelection(element: SVGElement): boolean {
    const selectionRectangle = this.selectorRect.getBoundingClientRect();
    const elementClientRect = element.getBoundingClientRect();
    const isInsideSelection: boolean = !(
      (elementClientRect.left > selectionRectangle.right || selectionRectangle.left > elementClientRect.right) ||
      (elementClientRect.top > selectionRectangle.bottom || selectionRectangle.top > elementClientRect.bottom));
    return isInsideSelection && this.isSvgDrawing(element);
  }

  isSvgDrawing(element: SVGElement): boolean {
    return (element.id !== this.SELECTOR_RECT_ID) && (element.id !== 'backgroundGrid') && (element.id !== '') &&
      (element.id !== this.BOUNDING_RECT_ID);
  }

  finishSelection(): void {
    this.updateSelectedItems();
    RendererSingleton.canvas.removeChild(this.selectorRect);
    if (this.selectedElements.length !== 0) {
      this.addBoundingRect();
    }
  }

  isMouseOutsideGBoundingRect(): boolean {
    const clientRect = this.boundingRect.getBoundingClientRect();
    return this.mousePosition.canvasMousePositionX < clientRect.left - this.canvasBoundingRect.left ||
      this.mousePosition.canvasMousePositionX > clientRect.right - this.canvasBoundingRect.left ||
      this.mousePosition.canvasMousePositionY < clientRect.top - this.canvasBoundingRect.top ||
      this.mousePosition.canvasMousePositionY > clientRect.bottom - this.canvasBoundingRect.top;
  }

  removeGBoundingRect(): void {
    this.hasBoundingRect = false;
    RendererSingleton.canvas.removeChild(this.gBoundingRect);
  }

  addBoundingRect(): void {
    this.hasBoundingRect = true;
    const boundingBox = this.getBoundingRectDimensions();
    this.currentBoundingRectDimensions = boundingBox;
    this.drawGBoundingRect(boundingBox);
  }

  private getBoundingRectDimensions(): Dimensions {
    const boundingRect: BoundingRect = {
      left: Number.MAX_SAFE_INTEGER,
      right: 0,
      bottom: 0,
      top: Number.MAX_SAFE_INTEGER,
    };

    this.selectedElements.forEach( (svgElement: SVGElement) => {
      const elementClientRect: ClientRect | DOMRect = svgElement.getBoundingClientRect();

      if (elementClientRect.left < boundingRect.left ) {
        boundingRect.left = elementClientRect.left;
        // console.log('smoll x is: ' + elementClientRect.left);
      }
      if (elementClientRect.right > boundingRect.right) {
        boundingRect.right = elementClientRect.right;
      }
      if (elementClientRect.top < boundingRect.top) {
        boundingRect.top = elementClientRect.top;
      }
      if (elementClientRect.bottom > boundingRect.bottom) {
        boundingRect.bottom = elementClientRect.bottom;
      }
    });

    boundingRect.left -= this.canvasBoundingRect.left;
    boundingRect.right -= this.canvasBoundingRect.left;

    return {
      x: boundingRect.left,
      y: boundingRect.top,
      width: boundingRect.right - boundingRect.left,
      height: boundingRect.bottom - boundingRect.top,
    };
  }

  private drawGBoundingRect(rectDimensions: Dimensions) {
    const gBoundingRect: SVGGElement = RendererSingleton.renderer.createElement('g', 'svg');
    gBoundingRect.setAttribute('id', this.G_BOUNDING_RECT_ID);
    this.appendBoundingRect(rectDimensions, gBoundingRect);
    this.appendControlPoints(rectDimensions, gBoundingRect);
    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, gBoundingRect);
  }

  private appendBoundingRect(rectDimensions: Dimensions, gBoundingRect: SVGGElement): void {
    const boundingRect: SVGElement = RendererSingleton.renderer.createElement('rect', 'svg');
    boundingRect.setAttribute('id', this.BOUNDING_RECT_ID);
    const properties: [string, string][] = [
      ['x', `${rectDimensions.x}`],
      ['y', `${rectDimensions.y}`],
      ['height', `${rectDimensions.height}`],
      ['width', `${rectDimensions.width}`],
      ['fill', 'transparent'],
      ['stroke', `${STROKE_COLOR}`],
      ['stroke', `${STROKE_COLOR}`],
    ];
    properties.forEach( (property: [string, string]) => boundingRect.setAttribute(property[0], property[1]));
    gBoundingRect.appendChild(boundingRect);
  }

  private appendControlPoints(rectDimensions: Dimensions, gBoundingRect: SVGGElement): void {
    // console.log('x=' + Math.ceil(rectDimensions.x));
    // console.log('y=' + Math.ceil(rectDimensions.y));
    const markers: [string, string][] = [
      [`${rectDimensions.x},${rectDimensions.y}`, 'top-left'],
      [`${rectDimensions.x + (rectDimensions.width / 2)},${rectDimensions.y}`, 'top-middle'],
      [`${rectDimensions.x + rectDimensions.width},${rectDimensions.y}`, 'top-right'],
      [`${rectDimensions.x + rectDimensions.width},${rectDimensions.y + (rectDimensions.height / 2)}`, 'right-middle'],
      [`${rectDimensions.x + rectDimensions.width},${rectDimensions.y + rectDimensions.height}`, 'bottom-right'],
      [`${rectDimensions.x + (rectDimensions.width / 2)},${rectDimensions.y + rectDimensions.height}`, 'bottom-middle'],
      [`${rectDimensions.x},${rectDimensions.y + rectDimensions.height}`, 'bottom-left'],
      [`${rectDimensions.x},${rectDimensions.y + (rectDimensions.height / 2)}`, 'left-middle'],
    ];

    markers.forEach( (marker: [string, string]) => {
      const commaIndex = marker[0].indexOf(',');
      const x: number = parseFloat(marker[0].substr(0, commaIndex));
      const y: number = parseFloat(marker[0].substr(commaIndex + 1, marker[0].length));
      const properties: [string, string][] = [
        ['id', marker[1]],
        ['x', `${x - POINT_CONTROL_SIZE / 2}`],
        ['y', `${y - POINT_CONTROL_SIZE / 2}`],
        ['height', `${POINT_CONTROL_SIZE}`],
        ['width', `${POINT_CONTROL_SIZE}`],
        ['fill', `${STROKE_COLOR}`],
      ];
      const controlPoint: SVGElement = RendererSingleton.renderer.createElement('rect', 'svg');
      properties.forEach( (property: [string, string]) => controlPoint.setAttribute(property[0], property[1]));
      controlPoint.addEventListener('mousedown', () => {
        if (!this.isScaling) {
          this.isScaling = true;
          this.currentMarker = controlPoint.id;
        }
      });
      gBoundingRect.appendChild(controlPoint);
    });
  }

  private currentBoundingRectDimensions: Dimensions;
  // private hasSetInitialScale = false;
  // private hasSetInitialTranslate = false;

  scale(): void {

    const scalingFactors: [number, number, number, number] = this.getScalingFactors();
    const scalingFactorX: number = scalingFactors[0];
    const scalingFactorY: number = scalingFactors[1];
    const xCorrection: number = scalingFactors[2];
    const yCorrection: number = scalingFactors[3];

    // this.scaleElement(this.gBoundingRect, scalingFactorX, scalingFactorY);
    this.selectedElements.forEach( (svgElement: SVGElement) => {
      this.scaleElement(svgElement, scalingFactorX, scalingFactorY, xCorrection, yCorrection);
      // console.log(scalingFactorX, scalingFactorY);
    });
    this.removeGBoundingRect();
    this.addBoundingRect();
  }

  scaleElement(svgElement: SVGElement, scalingFactorX: number, scalingFactorY: number, xCorrection: number, yCorrection: number): void {
    const initialScaleValues: [number, number] =
      this.transform.getTransformationFromMatrix(this.initialTransformValues.get(svgElement) as string, Transformation.SCALE);
    // console.log('scales values: ' + initialScaleValues[0] + ', ' + initialScaleValues[1]);
    const initialTranslateValues: [number, number] =
      this.transform.getTransformationFromMatrix(this.initialTransformValues.get(svgElement) as string, Transformation.TRANSLATE);
    this.transform.scale(svgElement, scalingFactorX, scalingFactorY, initialScaleValues[0], initialScaleValues[1]);
    const correctedInitialX = initialTranslateValues[0] * scalingFactorX;
    const correctedInitialY = initialTranslateValues[1] * scalingFactorY;
    this.transform.translate(svgElement, xCorrection, yCorrection, correctedInitialX, correctedInitialY);
  }

  private getScalingFactors(): [number, number, number, number] {
    let scalingFactorX: number;
    let scalingFactorY: number;
    let xCorrection: number;
    let yCorrection: number;

    scalingFactorY = 1;
    scalingFactorX = 1;
    xCorrection = 0;
    yCorrection = 0;

    if (this.currentMarker.includes('top')) {
      scalingFactorY = 1 + -(this.mousePosition.canvasMousePositionY - this.startY) / this.startHeight;
      yCorrection = -((this.startY + this.startHeight) * (scalingFactorY - 1));
    } else if (this.currentMarker.includes('bottom')) {
      scalingFactorY = 1 + (this.mousePosition.canvasMousePositionY - this.startY) / this.startHeight;
      yCorrection = -((this.startY - this.startHeight) * (scalingFactorY - 1));
    }
    if (this.currentMarker.includes('left')) {
      scalingFactorX = 1 + -(this.mousePosition.canvasMousePositionX - this.startX) / this.startWidth;
      xCorrection = -((this.startX + this.startWidth) * (scalingFactorX - 1));
    } else if (this.currentMarker.includes('right')) {
      scalingFactorX = 1 + (this.mousePosition.canvasMousePositionX - this.startX) / this.startWidth;
      xCorrection = -((this.startX - this.startWidth) * (scalingFactorX - 1));
    }

    return [scalingFactorX, scalingFactorY, xCorrection, yCorrection];
  }

  selectAll(): void {
    const canvas = RendererSingleton.canvas;
    const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    drawings.forEach((svgElement: SVGElement) => {
      if (this.isSvgDrawing(svgElement)) {
        this.selectedElements.push(svgElement);
      }
    });
    if (this.selectedElements.length !== 0) {
      this.addBoundingRect();
    }
  }

  translate() {
    if (this.grid.isMagnetic) {
      this.translateWithMagnetism();
    } else {
      const xMove = this.mousePosition.canvasMousePositionX - this.startX;
      const yMove = this.mousePosition.canvasMousePositionY - this.startY;
      this.selectedElements.forEach((svgElement: SVGElement) => {
        this.transform.translate(svgElement, xMove, yMove);
        this.startX = this.mousePosition.canvasMousePositionX;
        this.startY = this.mousePosition.canvasMousePositionY;
      });
    }
    this.removeGBoundingRect();
    this.addBoundingRect();
  }

  translateWithMagnetism() {
    this.grid.setSelectedDotPosition(this.getBoundingRectDimensions() as DOMRect);
    const newPosition: number[] = this.magnetism.getTranslationWithMagnetismValue(this.initialX, this.initialY);
    const xMove = newPosition[0];
    const yMove = newPosition[1];
    if (xMove !== 0 || yMove !== 0) {
      this.initialX = this.mousePosition.canvasMousePositionX;
      this.initialY = this.mousePosition.canvasMousePositionY;
    }
    this.selectedElements.forEach((svgElement: SVGElement) => {
      this.transform.translate(svgElement, xMove, yMove);
      this.startX = this.mousePosition.canvasMousePositionX;
      this.startY = this.mousePosition.canvasMousePositionY;
    });
  }

  beginTranslation(): void {
    this.isTranslating = true;
    this.beginTransformation();
  }

  beginTransformation(): void {
    this.initialTransformValues = this.createTransformationMap(this.selectedElements);
  }

  finishTranslation(): void {
    this.isTranslating = false;
    this.finishTransformation();
  }

  finishTransformation(): void {
    const newTransforms: Map<SVGElement, string> = this.createTransformationMap(this.selectedElements);
    this.pushTransformCommand(newTransforms, this.initialTransformValues);
  }

  pushTransformCommand(newTransforms: Map<SVGElement, string>, oldTransforms: Map<SVGElement, string>): void {
    const svgElements: SVGElement[] = [...this.selectedElements];
    const removeGBoundingRect = () => {
      if (this.hasBoundingRect) {
        this.removeGBoundingRect();
      }
    };
    // svgElements.push(this.gBoundingRect as SVGElement);
    const command: Command = {
      execute(): void {
        removeGBoundingRect();
        svgElements.forEach((svgElement: SVGElement) =>
          svgElement.setAttribute('transform', `${newTransforms.get(svgElement)}`));
      },
      unexecute(): void {
        removeGBoundingRect();
        svgElements.forEach((svgElement: SVGElement) =>
        svgElement.setAttribute('transform', `${oldTransforms.get(svgElement)}`));
      },
    };
    this.undoRedoService.pushCommand(command);
  }

  createTransformationMap(elements: SVGElement[]): Map<SVGElement, string> {
    const map: Map<SVGElement, string> = new Map<SVGElement, string>();
    // Iterate for each elements and the bounding line
    elements.forEach((element: SVGElement) => {
      // Make sure that the element has a transform attribute
      this.transform.checkTransformAttribute(element);
      map.set(element, element.getAttribute('transform') as string);
    });
    return map;
  }

}
