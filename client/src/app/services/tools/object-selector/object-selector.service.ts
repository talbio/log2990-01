import { Injectable } from '@angular/core';
import {Colors} from '../../../data-structures/colors';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import {setScaleAttribute, setTranslationAttribute} from '../../utilitary-functions/transform-functions';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';

const MAX_CANVAS_WIDTH = 2000;
const MAX_CANVAS_HEIGHT = 2000;
const POINT_CONTROL_SIZE = 20;
const STROKE_COLOR = Colors.BLACK;

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
  hasBoundingRect: boolean;
  startX: number;
  startY: number;

  private isScaling: boolean;
  private mouseDown: boolean;

  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
    this.isScaling = false;
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

  onMouseDown() {
    console.log('down');
    this.mouseDown = true;
    if (this.hasBoundingRect) {
      if (this.isScaling) {
        this.startX = this.mousePosition.canvasMousePositionX;
        this.startY = this.mousePosition.canvasMousePositionY;
        return;
      }
      if (this.isMouseOutsideBoundingRect()) {
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeGBoundingRect();
        this.initialLeft = -1;
      } else {
        // translate
        this.startX = this.mousePosition.canvasMousePositionX;
        this.startY = this.mousePosition.canvasMousePositionY;
      }
    } else {
      this.selectedElements = [];
      this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
      this.initialLeft = -1;
    }
  }

  onMouseMove(currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      if (this.isScaling) {
        this.scale();
        return;
      }
      if (this.hasBoundingRect && !this.isMouseOutsideBoundingRect()) {
        this.translate();
      } else {
        this.updateSelectorRect(currentChildPosition, mouseEvent);
      }
    }
  }

  onMouseUp(): void {
    if (this.isScaling) {
      this.isScaling = false;
      this.mouseDown = false;
      return;
    }
    if (!this.hasBoundingRect) {
      this.finishSelection();
    } else {
      // finishTranslation
      this.mouseDown = false;
      this.initialLeft = -1;
    }
  }

  updateSelectorRect(currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateElement(currentChildPosition, mouseEvent);
    }
  }

  updateSelectedItems(): void {
    const drawings = RendererSingleton.canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    drawings.forEach((svgElement: SVGElement) => {
      if (this.isElementInsideSelection(svgElement) && !this.selectedElements.includes(svgElement)) {
        this.selectedElements.push(svgElement);

        if (svgElement.id.startsWith('penPath')) {
          // Remove this instance since it will be pushed with foreach
          this.selectedElements.pop();
          drawings.forEach((element) => {
            if (element.id === svgElement.id) {
              this.selectedElements.push(element as SVGElement);
            }
          }); }
      }});
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
      if (this.initialLeft === -1) {
        this.initialLeft = this.boundingRect.getBoundingClientRect().left - this.canvasBoundingRect.left;
        console.log(`Setting initialLeft to ${this.initialLeft}`)
        this.initialBB = this.boundingRect.getBoundingClientRect();
      }
    }
    this.mouseDown = false;
  }

  isMouseOutsideBoundingRect(): boolean {
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
    this.drawGBoundingRect(boundingBox);
  }

  private getBoundingRectDimensions(): Dimensions {
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
    const markers: string[] = [
      `${rectDimensions.x},${rectDimensions.y}`,
      `${rectDimensions.x + (rectDimensions.width / 2)},${rectDimensions.y}`,
      `${rectDimensions.x + rectDimensions.width},${rectDimensions.y}`,
      `${rectDimensions.x + rectDimensions.width},${rectDimensions.y + (rectDimensions.height / 2)}`,
      `${rectDimensions.x + rectDimensions.width},${rectDimensions.y + rectDimensions.height}`,
      `${rectDimensions.x + (rectDimensions.width / 2)},${rectDimensions.y + rectDimensions.height}`,
      `${rectDimensions.x},${rectDimensions.y + rectDimensions.height}`,
      `${rectDimensions.x},${rectDimensions.y + (rectDimensions.height / 2)}`,
      `${rectDimensions.x},${rectDimensions.y}`,
    ];

    markers.forEach( (marker: string) => {
      const commaIndex = marker.indexOf(',');
      const x: number = parseFloat(marker.substr(0, commaIndex));
      const y: number = parseFloat(marker.substr(commaIndex + 1, marker.length));
      const properties: [string, string][] = [
        ['x', `${x - POINT_CONTROL_SIZE / 2}`],
        ['y', `${y - POINT_CONTROL_SIZE / 2}`],
        ['height', `${POINT_CONTROL_SIZE}`],
        ['width', `${POINT_CONTROL_SIZE}`],
        ['fill', `${STROKE_COLOR}`],
        ['z-index', `123`],
        // ['pointer-events', `visible`],
      ];
      const controlPoint: SVGElement = RendererSingleton.renderer.createElement('rect', 'svg');
      properties.forEach( (property: [string, string]) => controlPoint.setAttribute(property[0], property[1]));
      controlPoint.addEventListener('mousemove', () => {

        this.isScaling = true;
        console.log('hey');
      });
      gBoundingRect.appendChild(controlPoint);
    });
  }
  initialLeft: number = -1;
  initialBB: ClientRect | undefined;
  scale(): void {
    const width = this.boundingRect.getBoundingClientRect().width;
    const scalingFactor = 1 + Math.max(0, (this.mousePosition.canvasMousePositionX - this.startX) / width);
    const dimensions = this.getBoundingRectDimensions();
    const x = dimensions.width  * scalingFactor / 2; // * scalingFactor / 2;
    const y = dimensions.height  * scalingFactor / 2; //  * scalingFactor / 2;
    console.log(' x : ' + dimensions.x, 'y: ' + dimensions.y);
    // console.log(x, y);
    setTranslationAttribute(this.boundingRect, -dimensions.x, -dimensions.y);
    setTranslationAttribute(this.boundingRect, x, y);
    setScaleAttribute(this.boundingRect, scalingFactor, 1);
    setTranslationAttribute(this.boundingRect, -x, -y);
    debugger;
    setTranslationAttribute(this.boundingRect, dimensions.x, dimensions.y);

    /*
    console.log('called');
    // const newLeft = parseFloat(this.boundingRect.getAttribute('x') as string) - (this.initialLeft / scalingFactor);
    const newLeft = this.initialLeft / scalingFactor;
    const resultingWidth = this.initialBB!.width * scalingFactor;
    // this.boundingRect.setAttribute('width', resultingWidth.toString())
    // this.boundingRect.setAttribute('x', newLeft.toString())
    console.log(`Start X: ${this.startX}`)
    console.log(`[L ${this.initialLeft}, S ${scalingFactor}] Setting to ${newLeft}. BB is ${this.initialBB!.width} and new width ${resultingWidth}. MP ${this.mousePosition.canvasMousePositionX}, ${this.mousePosition.canvasMousePositionY}`)
    */
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
    return;
    const xMove = this.mousePosition.canvasMousePositionX - this.startX;
    const yMove = this.mousePosition.canvasMousePositionY - this.startY;
    this.selectedElements.forEach((svgElement: SVGElement) => {
      setTranslationAttribute(svgElement, xMove, yMove);
      this.startX = this.mousePosition.canvasMousePositionX;
      this.startY = this.mousePosition.canvasMousePositionY;
    });
    setTranslationAttribute(this.gBoundingRect as SVGGElement, xMove, yMove);
  }

}
