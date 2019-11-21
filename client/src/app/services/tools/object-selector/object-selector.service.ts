import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { setTranslationAttribute } from '../../utilitary-functions/transform-functions';
import { GridTogglerService } from '../grid/grid-toggler.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

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

  hasBoundingRect: boolean;
  private mouseDown: boolean;
  startX: number;
  startY: number;

  constructor(private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService,
              private grid: GridTogglerService) {
    this.hasBoundingRect = false;
    this.mouseDown = false;
    this.selectedElements = [];
    this.startX = 0;
    this.startY = 0;
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

  onMouseDown() {
    this.mouseDown = true;
    if (this.hasBoundingRect) {
      if (this.isMouseOutsideOfBoundingRect()) {
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(this.SELECTOR_RECT_ID);
        this.removeBoundingRect();
      } else {
        // translate
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
      if (this.hasBoundingRect && !this.isMouseOutsideOfBoundingRect()) {
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
      // finishTranslation
      this.mouseDown = false;
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

        if (svgElement.id.startsWith('penPath')) {
          // Remove this instance since it will be pushed with foreach
          this.selectedElements.pop();
          drawings.forEach((element) => {
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

    this.selectedElements.forEach((svgElement: SVGElement) => {
      const elementClientRectLeft = svgElement.getBoundingClientRect().left;
      const elementClientRectRight = svgElement.getBoundingClientRect().right;
      const elementClientRectTop = svgElement.getBoundingClientRect().top;
      const elementClientRectBottom = svgElement.getBoundingClientRect().bottom;
      if (elementClientRectLeft < boundingRect.left) {
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
        setTranslationAttribute(svgElement, xMove, yMove);
        this.startX = this.mousePosition.canvasMousePositionX;
        this.startY = this.mousePosition.canvasMousePositionY;
      });
      setTranslationAttribute(this.boundingRect.children[1] as SVGElement, xMove, yMove);
    }
  }

  translateWithMagnetism() {
    const newPosition: [number, number] =
    this.getTranslationWithMagnetismValue(this.mousePosition.canvasMousePositionX, this.mousePosition.canvasMousePositionY);
    const xMove = newPosition[0] - this.startX;
    const yMove = newPosition[1] - this.startY;
    this.selectedElements.forEach((svgElement: SVGElement) => {
      setTranslationAttribute(svgElement, xMove, yMove);

      // doit representer le centre de la boite peut importe le point choisi
      this.startX = this.grid.magneticDot.x + (this.getBoundingRectDimensions().width / 2 );
      this.startY = this.grid.magneticDot.y + (this.getBoundingRectDimensions().width / 2 );
    });
    setTranslationAttribute(this.boundingRect.children[1] as SVGElement, xMove, yMove);
  }

  getTranslationWithMagnetismValue( xMove: number, yMove: number): [number , number ] {

    // constantly ajust selected dot position to know where it is (works)
    this.grid.setSelectedDotPosition(this.getBoundingRectDimensions() as DOMRect);
    // set default position to initial position
    const movement: [number , number] = [this.grid.magneticDot.x, this.grid.magneticDot.y];

    const distToClosestVerticalLine = this.grid.getDistanceToClosestVerticalLine();
    const distToClosestHorizontalLine = this.grid.getDistanceToClosestHorizontalLine();
    if (this.isCloseEnough(distToClosestVerticalLine) && this.isMovingInRightDirection(xMove, distToClosestVerticalLine)) {
      movement[0] = (this.grid.getClosestVerticalLine() * this.grid._gridSize);
    }
    if (this.isClosestLineHorizontal(distToClosestVerticalLine, distToClosestHorizontalLine) &&
      this.isCloseEnough(distToClosestHorizontalLine) && this.isMovingInRightDirection(yMove, distToClosestHorizontalLine)) {
      movement[1] = (this.grid.getClosestHorizontalLine() * this.grid._gridSize);
    }
    return movement;
  }

  isMovingInRightDirection(xMove: number, distance: number): boolean {
    return ((xMove > 0 && distance > 0) || (xMove < 0 && distance < 0));
  }

  isCloseEnough(distance: number): boolean {
    return (distance < (this.grid._gridSize / 2));
  }

  isClosestLineVertical(distToClosestVerticalLine: number, distToClosestHorizontalLine: number): boolean {
    return (Math.abs(distToClosestVerticalLine) < Math.abs(distToClosestHorizontalLine));
  }

  isClosestLineHorizontal(distToClosestVerticalLine: number, distToClosestHorizontalLine: number): boolean {
    return (Math.abs(distToClosestVerticalLine) > Math.abs(distToClosestHorizontalLine));
  }
}
