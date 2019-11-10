import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';

const STROKE_COLOR = Colors.BLACK;

const MAX_CANVAS_WIDTH = 2000;
const MAX_CANVAS_HEIGHT = 2000;

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

  private readonly SELECTOR_RECT_ID = 'selectorRect';
  private readonly BOUNDING_RECT_ID = 'boundingRect';

  selectedElements: SVGElement[];

  private hasBoundingRect: boolean;
  private mouseDown: boolean;

  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
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

  onMouseDown(mouseEvent: MouseEvent) {
    if (this.hasBoundingRect) {
      if (this.isMouseOutsideOfBoundingRect()) {
        this.mouseDown = true;
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeBoundingRect();
      } else {
        // translate
      }
    } else {
        this.mouseDown = true;
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
    }
  }

  onMouseMove(currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      if (this.hasBoundingRect && !this.isMouseOutsideOfBoundingRect()) {
        // this.translate(mouseEvent);
      } else {
        this.updateSelection(currentChildPosition, mouseEvent);
      }
    }
  }

  onMouseUp(): void {
    if (this.mouseDown) {
      this.finishSelection();
    } else {
      // finishTranslation
    }
  }

  updateSelection(currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateElement(currentChildPosition, mouseEvent);
    }
  }

  updateSelectedItems(): void {
    const drawings = RendererSingleton.canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    drawings.forEach((svgElement: SVGElement) => {
      if (this.isElementInsideSelection(svgElement) && !this.selectedElements.includes(svgElement)) {
        this.selectedElements.push(svgElement);
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
    this.mouseDown = false;
  }

  isMouseOutsideOfBoundingRect(): boolean {
    const boundingClientRect = this.boundingRect.getBoundingClientRect();
    return this.mousePosition.canvasMousePositionX < boundingClientRect.left - this.canvasBoxRect.left ||
      this.mousePosition.canvasMousePositionX > boundingClientRect.right - this.canvasBoxRect.right ||
      this.mousePosition.canvasMousePositionY < boundingClientRect.bottom ||
      this.mousePosition.canvasMousePositionY > boundingClientRect.top;
  }

  getWidthRect(rect: DOMRect): number {
    return rect.left - rect.right;
  }

  getHeightRect(rect: DOMRect): number {
    return rect.top - rect.bottom;
  }

  removeBoundingRect(): void {
    this.hasBoundingRect = false;
    const boundingRect: SVGElement = RendererSingleton.canvas.querySelector('#boundingRect') as SVGElement;
    RendererSingleton.renderer.removeChild(RendererSingleton.canvas, boundingRect);
  }

  addBoundingRect(): void {
    this.hasBoundingRect = true;
    const boundingBox = this.getBoundingRectDimensions();
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
    boundingRect.innerHTML +=
      `<defs>
            <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                <circle cx="5" cy="5" r="20" fill="red" />
            </marker>
      </defs>
      <polyline
        points="${boundingBox.x},${boundingBox.y}
        ${boundingBox.x + (boundingBox.width / 2)},${boundingBox.y}
        ${boundingBox.x + boundingBox.width},${boundingBox.y}
        ${boundingBox.x + boundingBox.width},${boundingBox.y + (boundingBox.height / 2)}
        ${boundingBox.x + boundingBox.width},${boundingBox.y + boundingBox.height}
        ${boundingBox.x + (boundingBox.width / 2)},${boundingBox.y + boundingBox.height}
        ${boundingBox.x},${boundingBox.y + boundingBox.height}
        ${boundingBox.x},${boundingBox.y + (boundingBox.height / 2)}
        ${boundingBox.x},${boundingBox.y}"
        stroke="${STROKE_COLOR}" fill="transparent"
        marker-start="url(#dot)" marker-mid="url(#dot)">
      </polyline>`;
    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, boundingRect);
  }

  selectAll(canvas: SVGElement): void {
    const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    drawings.forEach((svgElement: SVGElement) => {
      if (this.isSvgDrawing(svgElement)) {
        this.selectedElements.push(svgElement);
      }
    });
  }
}
