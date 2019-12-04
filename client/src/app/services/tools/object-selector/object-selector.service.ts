import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { Command } from 'src/app/data-structures/command';
import { MAX_ROTATION_STEP, MIN_ROTATION_STEP } from 'src/app/data-structures/constants';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { Transformation, TransformationService } from '../../transformation/transformation.service';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
import { GridTogglerService } from '../grid/grid-toggler.service';
import { MagnetismGeneratorService } from '../magnetism-generator/magnetism-generator.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';

const POINT_CONTROL_SIZE = 10;
const STROKE_COLOR = Colors.BLUE;

const INITIAL_MATRIX = 'matrix(1,0,0,1,0,0) translate(0, 0)';

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

  isRotating: boolean;
  lastRotate: string;
  lastMatrix: string;

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
  scaleFromCenter: boolean;

  rotationStep: number;
  angle: number;

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
    this.isRotating = false;
    this.isScaling = false;
    this.isTranslating = false;
    this.initialTransformValues = new Map<SVGElement, string>();
    this.selectedElements = [];
    this.startX = 0;
    this.startY = 0;
    this.angle = 0;
    this.rotationStep = MAX_ROTATION_STEP;
    this.startWidth = 0;
    this.startHeight = 0;
    this.scaleFromCenter = false;
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
          this.scale(mouseEvent.shiftKey);
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
    this.isRotating = false;
    this.mouseDown = false;
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

  scale(preserveRatio: boolean): void {
    if (this.isScaling) {
      const scalingFactors: [number, number, number, number] = this.getScalingFactors(preserveRatio);
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

  private getScalingFactors(preserveRatio: boolean): [number, number, number, number] {
    let scalingFactorX: number;
    let scalingFactorY: number;

    scalingFactorY = 1;
    scalingFactorX = 1;

    if (this.currentMarker.includes('top')) {
      scalingFactorY = 1 + -(this.mousePosition.canvasMousePositionY - this.startY) / this.startHeight;
    } else if (this.currentMarker.includes('bottom')) {
      scalingFactorY = 1 + (this.mousePosition.canvasMousePositionY - this.startY) / this.startHeight;
    }
    if (this.currentMarker.includes('left')) {
      scalingFactorX = 1 + -(this.mousePosition.canvasMousePositionX - this.startX) / this.startWidth;
    } else if (this.currentMarker.includes('right')) {
      scalingFactorX = 1 + (this.mousePosition.canvasMousePositionX - this.startX) / this.startWidth;
    }
    if (preserveRatio) {
      if (Math.abs(scalingFactorX) > Math.abs(scalingFactorY)) {
        scalingFactorY = scalingFactorX;
      } else {
        scalingFactorX = scalingFactorY;
      }
    }
    const corrections: number[] = this.calculateCorrection(scalingFactorX, scalingFactorY);
    return [scalingFactorX, scalingFactorY, corrections[0], corrections[1]];
  }

  calculateCorrection(scalingFactorX: number, scalingFactorY: number): number[] {
    let xCorrection: number;
    let yCorrection: number;
    xCorrection = 0;
    yCorrection = 0;
    let height: number;
    let width: number;
    if (this.scaleFromCenter) {
      height = this.startHeight / 2;
      width = this.startWidth / 2;
    } else {
      height = this.startHeight;
      width = this.startWidth;
    }
    if (this.currentMarker.includes('top')) {
      yCorrection = -((this.startY + height) * (scalingFactorY - 1));
    } else if (this.currentMarker.includes('bottom')) {
      yCorrection = -((this.startY - height) * (scalingFactorY - 1));
    }
    if (this.currentMarker.includes('left')) {
      xCorrection = -((this.startX + width) * (scalingFactorX - 1));
    } else if (this.currentMarker.includes('right')) {
      xCorrection = -((this.startX - width) * (scalingFactorX - 1));
    }
    return [xCorrection, yCorrection];
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

  getBoundingBox(): SVGElement {
    const boundingRect = RendererSingleton.canvas.children[RendererSingleton.canvas.children.length - 1] as SVGElement;
    return boundingRect.children[1] as SVGElement;
  }

  initializeRotateValue(element: SVGElement) {
    const currentTransform = element.getAttribute('transform');
    if (!currentTransform) {
      element.setAttribute('transform', INITIAL_MATRIX);
    } else {
      const initializedTransform = '' + currentTransform + ' ' + INITIAL_MATRIX;
      element.setAttribute('transform', initializedTransform);
    }
  }

  beginRotation() {
    this.isRotating = true;
    this.lastMatrix = INITIAL_MATRIX;
    this.selectedElements.forEach((element: SVGElement) => {
      this.initializeRotateValue(element);
    });
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
    const currentTransform = element.getAttribute('transform') as string;
    const matrixBeginIndex = currentTransform.lastIndexOf('matrix(');
    this.lastMatrix = currentTransform.substr(matrixBeginIndex, (currentTransform.length - matrixBeginIndex));
    const newTransform = currentTransform.replace(this.lastMatrix, this.produceRotateData(element));
    element.setAttribute('transform', newTransform);
  }

  degreesToRadians(angle: number) {
    return angle * (Math.PI / 180);
  }

  degreesToWhateverThatIs(angle: number) {
    return angle / 360;
  }

  produceRotateData(element: SVGElement): string {
    const box = this.currentBoundingRectDimensions;
    const priorMatrix = this.getPriorMatrix(element);
    // const scalingFactors = this.getScalingFactors(true);
    console.log(priorMatrix + ' is prior translation');
    const xCenter = (box.x + box.width / 2) - priorMatrix[4];
    const yCenter = (box.y + box.height / 2) - priorMatrix[5];
    const cos = Math.cos(this.degreesToRadians(this.angle));
    const sin = Math.sin(this.degreesToRadians(this.angle));
    const newTransform = this.produceMatrix(cos, sin, -sin, cos, xCenter / priorMatrix[0], yCenter / priorMatrix[3]);
    // const newTransform = this.produceMatrix(cos, sin, -sin, cos, xCenter / priorMatrix[0], yCenter / priorMatrix[3]);
    return this.produceMatrixHtml(newTransform, [0, 0]);
  }

  produceMatrix(a: number, b: number, c: number, d: number, e: number, f: number): number[][] {
    const matrix = [[0]];
    matrix[0] = [a, b, 0];
    matrix[1] = [c, d, 0];
    matrix[2] = [e, f, 1];
    return matrix;
  }

  produceMatrixHtml(mat: number[][], priorTranslate: number[]): string {
    return 'matrix(' + mat[0][0] + ',' + mat[0][1] + ',' + mat[1][0] + ',' + mat[1][1] + ',' + mat[2][0] +
      ',' + mat[2][1] + ') translate(' + -(mat[2][0]) + ', ' + -(mat[2][1]) + ')';
  }

  getPriorMatrix(element: SVGElement): number[] {
    const before = element.getAttribute('transform') as string;
    const beginningOfMatrix = 7;
    if (before.lastIndexOf('matrix(') === 0) {
      return [1, 0, 0, 1, 0, 0];
    }
    const endOfMatrix = before.indexOf(')');
    const matrixInner = before.substring(beginningOfMatrix, endOfMatrix);
    const eachSlots = matrixInner.split(',');
    const param: number[] = [];
    eachSlots.forEach((slot: string) => {
      param.push(parseFloat(slot));
    });
    return param;
  }

  multiplyMatrices(mat2: number[][], mat1: number[][]): number[][] {
    const matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    // 1st line
    matrix[0][0] = mat1[0][0] * mat2[0][0] + mat1[1][0] * mat2[0][1] + mat1[2][0] * mat2[0][2];
    matrix[1][0] = mat1[0][0] * mat2[1][0] + mat1[1][0] * mat2[1][1] + mat1[2][0] * mat2[1][2];
    matrix[2][0] = mat1[0][0] * mat2[2][0] + mat1[1][0] * mat2[2][1] + mat1[2][0] * mat2[2][2];

    // 2nd line
    matrix[0][1] = mat1[0][1] * mat2[0][0] + mat1[1][1] * mat2[0][1] + mat1[2][1] * mat2[0][2];
    matrix[1][1] = mat1[0][1] * mat2[1][0] + mat1[1][1] * mat2[1][1] + mat1[2][1] * mat2[1][2];
    matrix[2][1] = mat1[0][1] * mat2[2][0] + mat1[1][1] * mat2[2][1] + mat1[2][1] * mat2[2][2];

    // 3rd line
    matrix[0][2] = mat1[0][2] * mat2[0][0] + mat1[1][2] * mat2[0][1] + mat1[2][2] * mat2[0][2];
    matrix[1][2] = mat1[0][2] * mat2[1][0] + mat1[1][2] * mat2[1][1] + mat1[2][2] * mat2[1][2];
    matrix[2][2] = mat1[0][2] * mat2[2][0] + mat1[1][2] * mat2[2][1] + mat1[2][2] * mat2[2][2];
    return matrix;
  }

  actualizeMatrix(element: SVGElement, matToMultiply: number[][]): number[][] {
    return this.multiplyMatrices(this.getMatrixInHtml(element), matToMultiply);
  }

  getMatrixInHtml(element: SVGElement): number[][] {
    const before = element.getAttribute('transform') as string;
    const matrixBeginIndex = before.lastIndexOf('matrix(') + 7;
    const matrixEndIndex = before.lastIndexOf('translate(') - 2;
    // const translateBeginIndex
    const matrixInner = before.substring(matrixBeginIndex, matrixEndIndex);
    const eachSlots = matrixInner.split(', ');
    const param: number[] = [];
    eachSlots.forEach((slot: string) => {
      param.push(parseFloat(slot));
    });
    return this.produceMatrix(param[0], param[1], param[2], param[3], param[4], param[5]);
  }
}
