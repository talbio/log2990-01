import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { Command } from 'src/app/data-structures/command';
import { MAX_ROTATION_STEP, MIN_ROTATION_STEP } from 'src/app/data-structures/constants';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import {ScaleService} from "../../transformations/scale.service";
import { Transformation, TransformService } from '../../transformations/transform.service';
import {TranslateService} from '../../transformations/translate.service';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
import { GridTogglerService } from '../grid/grid-toggler.service';
import { MagnetismService } from '../magnetism/magnetism.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';

const POINT_CONTROL_SIZE = 10;
const STROKE_COLOR = Colors.BLUE;

interface Dimensions {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
@Injectable()
export class ObjectSelectorService {

  isRotating: boolean;
  lastRotate: string;

  private readonly SELECTOR_RECT_ID = 'selectorRect';
  private readonly BOUNDING_RECT_ID = 'boundingRect';
  private readonly G_BOUNDING_RECT_ID = 'gBoundingRect';

  selectedElements: SVGElement[];

  private initialTransformValues: Map<SVGElement, string>;
  hasBoundingRect: boolean;


  initialDomRect: DOMRect;

  private currentDomRect: DOMRect;


  rotationStep: number;
  angle: number;


  private mouseDown: boolean;

  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService,
              private magnetism: MagnetismService,
              private transform: TransformService,
              private scaleService: ScaleService,
              private undoRedoService: UndoRedoService,
              private translateService: TranslateService,
              private grid: GridTogglerService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
    this.isRotating = false;

    this.initialTransformValues = new Map<SVGElement, string>();
    this.selectedElements = [];
    this.angle = 0;
    this.rotationStep = MAX_ROTATION_STEP;
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

  updateInitialDomRect(): void {
    this.initialDomRect = new DOMRect(
      this.mousePosition.canvasMousePositionX,
      this.mousePosition.canvasMousePositionY,
      this.currentDomRect.width,
      this.currentDomRect.height);
    this.scaleService.startDimensions = this.initialDomRect;
    this.translateService.startDomRect = this.initialDomRect;
  }

  onMouseDown() {
    this.mouseDown = true;
    this.translateService.initialX = this.mousePosition.canvasMousePositionX;
    this.translateService.initialY = this.mousePosition.canvasMousePositionY;
    if (this.hasBoundingRect) {
      if (this.scaleService.isScaling) {
        this.initialTransformValues  = this.createTransformationMap(this.selectedElements);
        this.scaleService.initialTransformValues = this.initialTransformValues;
        this.updateInitialDomRect();
        return;
      }
      if (this.isMouseOutsideGBoundingRect()) {
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeGBoundingRect();
      } else {
        this.updateInitialDomRect();
        this.translateService.beginTranslation();
        this.beginTransformation();
      }
    } else {
      this.selectedElements = [];
      this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
    }
  }

  onMouseMove(currentChildPosition: number, mouseEvent: MouseEvent): void {
    if (this.mouseDown) {
      if (this.hasBoundingRect) {
        if (this.scaleService.isScaling) {
          this.scale(mouseEvent.shiftKey);
          return;
        }
        if (this.translateService.isTranslating) {
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
      this.translateService.finishTranslation();
      this.finishTransformation();
      this.mouseDown = false;
    }
    if (this.scaleService.isScaling) {
      this.scaleService.isScaling = false;
    }
    this.currentDomRect = this.getBoundingRectDimensions();
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
    this.isRotating = false;
    this.mouseDown = false;
  }

  isMouseOutsideGBoundingRect(): boolean {
    const clientRect = this.boundingRect.getBoundingClientRect();
    const canvasClientRect = RendererSingleton.canvas.getBoundingClientRect();
    return this.mousePosition.canvasMousePositionX < clientRect.left - canvasClientRect.left ||
      this.mousePosition.canvasMousePositionX > clientRect.right - canvasClientRect.left ||
      this.mousePosition.canvasMousePositionY < clientRect.top - canvasClientRect.top ||
      this.mousePosition.canvasMousePositionY > clientRect.bottom - canvasClientRect.top;
  }

  removeGBoundingRect(): void {
    this.hasBoundingRect = false;
    RendererSingleton.canvas.removeChild(this.gBoundingRect);
  }

  addBoundingRect(): void {
    this.hasBoundingRect = true;
    const boundingBox = this.getBoundingRectDimensions();
    this.currentDomRect = boundingBox;
    this.drawGBoundingRect(boundingBox);
  }

  private getBoundingRectDimensions(): DOMRect {

    const boundingRect: Dimensions = {
      left: Number.MAX_SAFE_INTEGER,
      top: Number.MAX_SAFE_INTEGER,
      right: 0,
      bottom: 0,
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
    const canvasClientRect = RendererSingleton.canvas.getBoundingClientRect();
    boundingRect.left -= canvasClientRect.left;
    boundingRect.right -= canvasClientRect.left;

    return new DOMRect(
      boundingRect.left,
      boundingRect.top,
      boundingRect.right - boundingRect.left,
      boundingRect.bottom - boundingRect.top);
  }

  private drawGBoundingRect(rectDimensions: DOMRect) {
    const gBoundingRect: SVGGElement = RendererSingleton.renderer.createElement('g', 'svg');
    gBoundingRect.setAttribute('id', this.G_BOUNDING_RECT_ID);
    this.appendBoundingRect(rectDimensions, gBoundingRect);
    this.appendControlPoints(rectDimensions, gBoundingRect);
    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, gBoundingRect);
  }

  private appendBoundingRect(rectDimensions: DOMRect, gBoundingRect: SVGGElement): void {
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

  private appendControlPoints(rectDimensions: DOMRect, gBoundingRect: SVGGElement): void {
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
        if (!this.scaleService.isScaling) {
          this.scaleService.isScaling = true;
          this.scaleService.currentMarkerId = controlPoint.id;
        }
      });
      gBoundingRect.appendChild(controlPoint);
    });
  }

  scale(preserveRatio: boolean): void {
    this.scaleService.scale(preserveRatio, this.selectedElements);
    this.removeGBoundingRect();
    this.addBoundingRect();
  }

  translate() {
    if (this.grid.isMagnetic) {
      this.translateService.translateWithMagnetism(this.selectedElements, this.getBoundingRectDimensions() as DOMRect);
    } else {
      this.translateService.translate(this.selectedElements);
    }
    this.removeGBoundingRect();
    this.addBoundingRect();
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

  finishRotation(): void {
    this.isRotating = false;
    this.finishTransformation();
  }

  beginTransformation(): void {
    this.initialTransformValues = this.createTransformationMap(this.selectedElements);
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

  lowerRotationStep(): void {
      this.rotationStep = MIN_ROTATION_STEP;
  }

  higherRotationStep(): void {
      this.rotationStep = MAX_ROTATION_STEP;
  }

  changeAngle(mouseWheel: WheelEvent) {
    if (mouseWheel.deltaY < 0) {
      this.angle  += this.rotationStep;
    } else { this.angle  -= this.rotationStep; }
    this.angle  = this.angle % 360;
  }

  beginRotation() {
    this.isRotating = true;
    this.beginTransformation();
  }

  rotateSelectedElements(mouseWheel: WheelEvent) {
    if (!this.isRotating) {
      this.beginRotation();
    }
    this.changeAngle(mouseWheel);
    this.selectedElements.forEach((element: SVGElement) => {
      this.rotateSingleElement(element);
    });
  }

  rotateSingleElement(element: SVGElement) {
    if (this.hasBoundingRect) {
      const centerX: number = parseFloat(this.boundingRect.getAttribute('x') as string) +
        parseFloat(this.boundingRect.getAttribute('width') as string) / 2;
      const centerY: number = parseFloat(this.boundingRect.getAttribute('y') as string) +
        parseFloat(this.boundingRect.getAttribute('height') as string) / 2;
      const initialTransform: string = this.initialTransformValues.get(element) as string;
      const translates: number[] = this.transform.getTransformationFromMatrix(initialTransform, Transformation.TRANSLATE);
      const scales: number[] = this.transform.getTransformationFromMatrix(initialTransform, Transformation.SCALE);
      const rotates: number[] = this.transform.getTransformationFromMatrix(initialTransform, Transformation.ROTATE);
      const matrix: number[][] = [[scales[0], rotates[0], 0], [rotates[1], scales[1], 0], [translates[0], translates[1], 1]];
      this.transform.rotate(element, matrix, this.transform.degreesToRadians(this.angle), centerX, centerY);
    }
  }
}
