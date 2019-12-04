import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { Command } from 'src/app/data-structures/command';
import { MAX_ROTATION_STEP, MIN_ROTATION_STEP } from 'src/app/data-structures/constants';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';
import { TransformationService } from './../../transformation/transformation.service';
import { UndoRedoService } from './../../undo-redo/undo-redo.service';

const STROKE_COLOR = Colors.BLACK;

const MAX_CANVAS_WIDTH = 2000;
const MAX_CANVAS_HEIGHT = 2000;
//const INITIAL_ROTATE = 'rotate(0 0 0)';
const INITIAL_MATRIX = 'matrix(1, 0, 0, 1, 0, 0) translate(0, 0)';

interface Box {
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

// @ts-ignore
@Injectable()
export class ObjectSelectorService {

  isRotating: boolean;
  lastRotate: string;
  lastMatrix: string;
  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService,
              private transform: TransformationService,
              private undoRedoService: UndoRedoService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
    this.isRotating = false;
    this.isTranslating = false;
    this.initialTranslateValues = new Map<SVGElement, string>();
    this.selectedElements = [];
    this.startX = 0;
    this.startY = 0;
    this.angle = 0;
    this.rotationStep = MAX_ROTATION_STEP;
  }

  get canvasBoxRect(): BoundingRect {
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
    return RendererSingleton.canvas.querySelector('#' + this.BOUNDING_RECT_ID) as SVGElement;
  }

  private readonly SELECTOR_RECT_ID = 'selectorRect';
  private readonly BOUNDING_RECT_ID = 'boundingRect';

  selectedElements: SVGElement[];
  private isTranslating: boolean;
  private initialTranslateValues: Map<SVGElement, string>;
  hasBoundingRect: boolean;
  private mouseDown: boolean;
  startX: number;
  startY: number;
  angle: number;
  rotationStep: number;
  private currentBoundingRectDimensions: Box;

  onMouseDown() {
    this.mouseDown = true;
    if (this.hasBoundingRect) {
      if (this.isMouseOutsideOfBoundingRect()) {
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeBoundingRect();
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

  onMouseMove(currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      if (this.hasBoundingRect && this.isTranslating) {
        this.translate();
      } else {
        this.updateSelection(currentChildPosition, mouseEvent);
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
  }

  updateSelection(currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateElement(currentChildPosition, mouseEvent);
    }
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
    return (element.id !== 'selectorRect') && (element.id !== 'backgroundGrid') && (element.id !== '');
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

  isMouseOutsideOfBoundingRect(): boolean {
    const boundingClientRect = this.boundingRect.getBoundingClientRect();
    return this.mousePosition.canvasMousePositionX < boundingClientRect.left - this.canvasBoxRect.left ||
      this.mousePosition.canvasMousePositionX > boundingClientRect.right - this.canvasBoxRect.left ||
      this.mousePosition.canvasMousePositionY < boundingClientRect.top - this.canvasBoxRect.top ||
      this.mousePosition.canvasMousePositionY > boundingClientRect.bottom - this.canvasBoxRect.top;
  }

  getWidthRect(rect: DOMRect): number {
    return rect.left - rect.right;
  }

  getHeightRect(rect: DOMRect): number {
    return rect.top - rect.bottom;
  }

  removeBoundingRect(): void {
    this.hasBoundingRect = false;
    const boundingRect: SVGElement = RendererSingleton.renderer.selectRootElement('#boundingRect', true) as SVGElement;
    RendererSingleton.canvas.removeChild(boundingRect);
    this.isRotating = false;
  }

  addBoundingRect(): void {
    this.hasBoundingRect = true;
    const boundingBox = this.getBoundingRectDimensions();
    this.currentBoundingRectDimensions = boundingBox;
    this.drawBoundingRect(boundingBox);
  }

  private getBoundingRectDimensions(): Box {
    const boundingRect: BoundingRect = {
      left: MAX_CANVAS_WIDTH,
      right: 0,
      bottom: 0,
      top: MAX_CANVAS_HEIGHT,
    };

    this.selectedElements.forEach( (svgElement: SVGElement) => {
      const elementClientRectLeft = svgElement.getBoundingClientRect().left;
      const elementClientRectRight = svgElement.getBoundingClientRect().right;
      const elementClientRectTop = svgElement.getBoundingClientRect().top;
      const elementClientRectBottom = svgElement.getBoundingClientRect().bottom;
      if (elementClientRectLeft < boundingRect.left ) {
        boundingRect.left = elementClientRectLeft;
      }
      if (elementClientRectRight > boundingRect.right) {
        boundingRect.right = elementClientRectRight;
      }
      if (elementClientRectTop < boundingRect.top) {
        boundingRect.top = elementClientRectTop;
      }
      if (elementClientRectBottom > boundingRect.bottom) {
        boundingRect.bottom = elementClientRectBottom;
      }
    });

    boundingRect.left -= this.canvasBoxRect.left;
    boundingRect.right -= this.canvasBoxRect.left;

    return {
      x: boundingRect.left,
      y: boundingRect.top,
      width: boundingRect.right - boundingRect.left,
      height: boundingRect.bottom - boundingRect.top,
    };
  }

  private drawBoundingRect(boundingBox: Box) {
    const boundingRect: SVGElement = RendererSingleton.renderer.createElement('svg', 'svg');
    boundingRect.setAttribute('id', 'boundingRect');
    const defs: SVGElement = RendererSingleton.renderer.createElement('defs', 'svg');
    const marker: SVGElement = RendererSingleton.renderer.createElement('marker', 'svg');
    const circle: SVGElement = RendererSingleton.renderer.createElement('circle', 'svg');
    const polyline: SVGElement = RendererSingleton.renderer.createElement('polyline', 'svg');

    // circle attributes
    RendererSingleton.renderer.setAttribute(circle, 'cx', '5');
    RendererSingleton.renderer.setAttribute(circle, 'cy', '5');
    RendererSingleton.renderer.setAttribute(circle, 'r', '20');
    RendererSingleton.renderer.setAttribute(circle, 'fill', 'red');

    // marker attributes
    RendererSingleton.renderer.setAttribute(marker, 'id', 'dot');
    RendererSingleton.renderer.setAttribute(marker, 'viewBox', '0 0 10 10');
    RendererSingleton.renderer.setAttribute(marker, 'refX', '5');
    RendererSingleton.renderer.setAttribute(marker, 'refY', '5');
    RendererSingleton.renderer.setAttribute(marker, 'markerWidth', '5');
    RendererSingleton.renderer.setAttribute(marker, 'markerHeight', '5');

    // polyline attributes
    RendererSingleton.renderer.setAttribute(polyline, 'points',
      `${boundingBox.x},${boundingBox.y}
      ${boundingBox.x + (boundingBox.width / 2)},${boundingBox.y}
      ${boundingBox.x + boundingBox.width},${boundingBox.y}
      ${boundingBox.x + boundingBox.width},${boundingBox.y + (boundingBox.height / 2)}
      ${boundingBox.x + boundingBox.width},${boundingBox.y + boundingBox.height}
      ${boundingBox.x + (boundingBox.width / 2)},${boundingBox.y + boundingBox.height}
      ${boundingBox.x},${boundingBox.y + boundingBox.height}
      ${boundingBox.x},${boundingBox.y + (boundingBox.height / 2)}
      ${boundingBox.x},${boundingBox.y}`);
    RendererSingleton.renderer.setAttribute(polyline, 'stroke', `${STROKE_COLOR}`);
    RendererSingleton.renderer.setAttribute(polyline, 'fill', 'transparent');
    RendererSingleton.renderer.setAttribute(polyline, 'marker-start', 'url(#dot)');
    RendererSingleton.renderer.setAttribute(polyline, 'marker-mid', 'url(#dot)');

    // nesting children
    RendererSingleton.renderer.appendChild(marker, circle);
    RendererSingleton.renderer.appendChild(defs, marker);
    RendererSingleton.renderer.appendChild(boundingRect, defs);
    RendererSingleton.renderer.appendChild(boundingRect, polyline);
    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, boundingRect);
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
    if (this.angle > 359) {
      this.angle  = 0; }
    if (this.angle  < 0) {this.angle  = 359; }
  }

  getBoundingBox(): SVGElement {
    const boundingRect = RendererSingleton.canvas.children[RendererSingleton.canvas.children.length - 1] as SVGElement;
    return boundingRect.children[1] as SVGElement;
  }

  initializeRotateValue(element: SVGElement) {
    const currentTransform = element.getAttribute('transform');
    if (!currentTransform) {
    //   element.setAttribute('transform', INITIAL_ROTATE);
      element.setAttribute('transform', INITIAL_MATRIX);
    } else {
      const initializedTransform = '' + currentTransform + ' ' + INITIAL_MATRIX;
      element.setAttribute('transform', initializedTransform);
    }
  }

  beginRotation() {
    this.isRotating = true;
    // this.lastRotate = INITIAL_ROTATE;
    this.lastMatrix = INITIAL_MATRIX;
    this.selectedElements.forEach((element: SVGElement) => {
      this.initializeRotateValue(element);
    });
    const box = this.getBoundingBox();
    this.initializeRotateValue(box);
  }

  rotateSelectedElements(mouseWheel: WheelEvent) {
    if (!this.isRotating) {
      this.beginRotation();
    }
    this.changeAngle(mouseWheel);
    // const newMatrix = this.produceRotateData();
    this.selectedElements.forEach((element: SVGElement) => {
      // this.rotateSingleElement(element, newMatrix);
      this.rotateSingleElement(element);
    });
    // this.rotateSingleElement(this.getBoundingBox(), newMatrix);
    this.rotateSingleElement(this.getBoundingBox());
    // this.lastMatrix = newMatrix;
  }

  rotateSingleElement(element: SVGElement) {
    const currentTransform = element.getAttribute('transform') as string;
    const matrixBeginIndex = currentTransform.lastIndexOf('matrix(');
    this.lastMatrix = currentTransform.substr(matrixBeginIndex);
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
    const xCenter = box.x + box.width / 2;
    const yCenter = box.y + box.height / 2;
    // return 'rotate(' + this.angle + ' ' + Math.round(xCenter) + ' ' + Math.round(yCenter) + ') ';
    // if (this.selectedElements.length === 1) {
    const cos = Math.cos(this.degreesToRadians(this.angle));
    const sin = Math.sin(this.degreesToRadians(this.angle));
    // return 'matrix(' + cos + ', ' + sin + ', ' + -sin + ', ' + cos + ', ' +
    //  xCenter + ', ' + yCenter + ') translate(' + -xCenter + ', ' + -yCenter + ')';
    const newTransform = this.produceMatrix(cos, sin, -sin, cos, xCenter, yCenter);
    const newMatrix = this.multiplyMatrices(this.getMatrixInHtml(element), newTransform);
    return this.produceMatrixHtml(newMatrix) + ' translate(' + newMatrix[2][0] + ', ' + newMatrix[2][1] + ') ';
    // } else {

    // }
  }

  produceMatrix(a: number, b: number, c: number, d: number, e: number, f: number): number[][] {
    const matrix = [[0]];
    matrix[0] = [a, b, 0];
    matrix[1] = [c, d, 0];
    matrix[2] = [e, f, 1];
    return matrix;
  }

  produceMatrixHtml(mat: number[][]): string {
    return 'matrix(' + mat[0][0] + ', ' + mat[0][1] + ', ' + mat[1][0] + ', ' + mat[1][1] + ', ' + mat[2][0] + ', ' + mat[2][1] +
      ') translate(' + -mat[2][0] + ', ' + -mat[2][1] + ')';
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

  findTranslateValues = (transformAttribute: string): number[] => {
    const parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transformAttribute) as RegExpExecArray;
    return [parseFloat(parts[1]), parseFloat(parts[2])];
  }
}
