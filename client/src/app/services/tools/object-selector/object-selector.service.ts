import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { Command } from 'src/app/data-structures/command';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';
import { TransformationService } from './../../transformation/transformation.service';
import { UndoRedoService } from './../../undo-redo/undo-redo.service';

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
  private initialTranslateValues: Map<SVGElement, string>;
  hasBoundingRect: boolean;
  startX: number;
  startY: number;

  private isScaling: boolean;
  private currentMarker: string;
  private mouseDown: boolean;

  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService,
              private transform: TransformationService,
              private undoRedoService: UndoRedoService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
    this.isScaling = false;
    this.isTranslating = false;
    this.initialTranslateValues = new Map<SVGElement, string>();
    this.selectedElements = [];
    this.startX = 0;
    this.startY = 0;
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
  }

  onMouseDown() {
    this.mouseDown = true;
    if (this.hasBoundingRect) {
      if (this.isMouseOutsideGBoundingRect()) {
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeGBoundingRect();
      }
      if (this.isScaling) {
        this.updateStartPos();
        return;
      } else {
        // initiate translation
        this.beginTranslation();
        this.startX = this.mousePosition.canvasMousePositionX;
        this.startY = this.mousePosition.canvasMousePositionY;
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
        if (this.hasBoundingRect && this.isTranslating) {
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
      this.hasSetInitialScale = false;
      this.hasSetInitialTranslate = false;
    }
    this.currentBoundingRectDimensions = this.getBoundingRectDimensions();
    this.mouseDown = false;
  }

  updateSelectedItems(): void {
    const drawings = RendererSingleton.canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon, circle');
    drawings.forEach((svgElement: SVGElement) => {
      if (this.isElementInsideSelection(svgElement) && !this.selectedElements.includes(svgElement)) {
        this.selectedElements.push(svgElement);
        if (svgElement.id.startsWith('penPath') || svgElement.id.startsWith('featherPenPath') || svgElement.id.startsWith('aerosol')) {
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
      controlPoint.addEventListener('mousemove', () => {
        this.isScaling = true;
        this.currentMarker = controlPoint.id;
      });
      gBoundingRect.appendChild(controlPoint);
    });
  }

  private currentBoundingRectDimensions: Dimensions;
  private hasSetInitialScale = false;
  private hasSetInitialTranslate = false;

  scale(): void {
    if (!this.hasSetInitialScale) {
      this.transform.setScaleAttribute(this.gBoundingRect, 1, 1, true);
      this.selectedElements.forEach( (svgElement: SVGElement) => this.transform.setScaleAttribute(svgElement, 1, 1, true));
      this.hasSetInitialScale = true;
    }
    if (!this.hasSetInitialTranslate) {
      this.transform.setTranslationAttribute(this.gBoundingRect, 0, 0, false, true);
      this.selectedElements.forEach( (svgElement: SVGElement) => this.transform.setTranslationAttribute(svgElement, 0, 0, false, true));
      this.hasSetInitialTranslate = true;
    }

    let scalingFactorX: number;
    let scalingFactorY: number;

    scalingFactorY = 1;
    scalingFactorX = 1;

    switch (this.currentMarker) {
      case 'top-left':
        break;
      case 'top-middle':
        scalingFactorX = 1;
        scalingFactorY = 1;
        break;
      case 'top-right':
        break;
      case 'right-middle':
        scalingFactorX = 1 + (this.mousePosition.canvasMousePositionX - this.startX) / this.currentBoundingRectDimensions.width;
        scalingFactorY = 1;
        break;
      case 'bottom-right':
        scalingFactorX = 1 + (this.mousePosition.canvasMousePositionX - this.startX) / this.currentBoundingRectDimensions.width;
        scalingFactorY = 1 + (this.mousePosition.canvasMousePositionY - this.startY) / this.currentBoundingRectDimensions.height;
        break;
      case 'bottom-middle':
        scalingFactorX = 1;
        scalingFactorY = 1 + (this.mousePosition.canvasMousePositionY - this.startY) / this.currentBoundingRectDimensions.height;
        break;
        default:
          break;
    }

    console.log(' x : ' + this.currentBoundingRectDimensions.x, 'y: ' + this.currentBoundingRectDimensions.y);
    // console.log('canvasY: ' + (this.mousePosition.canvasMousePositionY));
    // console.log('startY: ' + (this.startY));
    // console.log(this.currentBoundingRectDimensions.height);

    this.transform.setScaleAttribute(this.gBoundingRect, scalingFactorX, scalingFactorY);
    this.transform.setTranslationAttribute(this.gBoundingRect,
      - (this.currentBoundingRectDimensions.x * scalingFactorX - this.currentBoundingRectDimensions.x),
      - (this.currentBoundingRectDimensions.y * scalingFactorY - this.currentBoundingRectDimensions.y), true);

    this.selectedElements.forEach( (svgElement: SVGElement) => {
      this.transform.setScaleAttribute(svgElement, scalingFactorX, scalingFactorY);
      this.transform.setTranslationAttribute(svgElement,
        - (this.currentBoundingRectDimensions.x * scalingFactorX - this.currentBoundingRectDimensions.x),
        - (this.currentBoundingRectDimensions.y * scalingFactorY - this.currentBoundingRectDimensions.y), true);
    });
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

  translate(): void {
    const xMove = this.mousePosition.canvasMousePositionX - this.startX;
    const yMove = this.mousePosition.canvasMousePositionY - this.startY;
    this.selectedElements.forEach((svgElement: SVGElement) => {
      this.transform.setTranslationAttribute(svgElement, xMove, yMove);
      this.startX = this.mousePosition.canvasMousePositionX;
      this.startY = this.mousePosition.canvasMousePositionY;
    });
    this.transform.setTranslationAttribute(this.boundingRect.children[1] as SVGElement, xMove, yMove);
  }

  beginTranslation(): void {
    this.isTranslating = true;
    this.initialTranslateValues = this.createTranslateMap(this.selectedElements);
  }

  finishTranslation(): void {
    this.isTranslating = false;
    const newTranslates: Map<SVGElement, string> = this.createTranslateMap(this.selectedElements);
    this.pushTranslateCommand(newTranslates, this.initialTranslateValues);
  }
  pushTranslateCommand(newTranslates: Map<SVGElement, string>, oldTranslates: Map<SVGElement, string>): void {
    const svgElements: SVGElement[] = [...this.selectedElements];
    svgElements.push(this.boundingRect.children[1] as SVGElement);
    const command: Command = {
      execute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          svgElement.setAttribute('transform', `${newTranslates.get(svgElement)}`));
        },
      unexecute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
        svgElement.setAttribute('transform', `${oldTranslates.get(svgElement)}`));
      },
    };
    this.undoRedoService.pushCommand(command);
  }

  createTranslateMap(elements: SVGElement[]): Map<SVGElement, string> {
    const map: Map<SVGElement, string> = new Map<SVGElement, string>();
    // Add the bounding rect line
    const elementsWithBoundingRect: SVGElement[] = [...elements];
    elementsWithBoundingRect.push(this.boundingRect.children[1] as SVGElement);
    // Iterate for each elements and the bounding line
    elementsWithBoundingRect.forEach((element: SVGElement) => {
      // Make sure that the element has a transform attribute
      if (!element.getAttribute('transform')) {
        element.setAttribute('transform', '');
      }
      map.set(element, element.getAttribute('transform') as string);
    });
    return map;
  }

}
