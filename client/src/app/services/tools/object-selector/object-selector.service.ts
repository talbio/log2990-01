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

  private TEMP_RECT_ID = 'selectorRect';
  private selectedElements: SVGElement[];
  private hasBoundingRect: boolean;
  private currentRect: SVGElement;
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
    return RendererSingleton.canvas.querySelector('#selectorRect') as SVGElement;
  }

  get boundingRect(): SVGElement {
    return RendererSingleton.canvas.querySelector('#boundingRect') as SVGElement;
  }

  onMouseDown(xPosition: number, yPosition: number, mouseEvent: MouseEvent) {
    if (this.hasBoundingRect) {
      if (this.isMouseOutsideOfBoundingRect()) {
        this.mouseDown = true;
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(xPosition, yPosition, this.TEMP_RECT_ID, this.rectangleGenerator);
        this.removeBoundingRect();
      } else {
        // translate
      }
    } else {
        this.mouseDown = true;
        this.selectedElements = [];
        this.rectangleGenerator.createTemporaryRectangle(xPosition, yPosition, this.TEMP_RECT_ID, this.rectangleGenerator);
    }
  }

  onMouseMove(xPosition: number, yPosition: number, currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      if (this.hasBoundingRect && !this.isMouseOutsideOfBoundingRect()) {
        // this.translate(mouseEvent);
      } else {
        this.updateSelection(xPosition, yPosition, currentChildPosition, mouseEvent);
      }
    }
  }

  onMouseUp(): void {
    if (this.selectorRect) {
      this.finishSelection();
    } else {
      // finishTranslation
    }
  }

  updateSelection(xPosition: number, yPosition: number, currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateElement(xPosition, yPosition, currentChildPosition, mouseEvent);
      this.currentRect = RendererSingleton.canvas.querySelector('#selectorRect') as Element as SVGElement;
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
    const selectionRectangle = this.currentRect.getBoundingClientRect();
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
      console.log('remove');
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

  /*
  translate(mouseEvent: MouseEvent): void {
    if (this.mouseDownTranslation) {
      const boxClientRect = this.box.getBoundingClientRect();
      this.box.setAttribute('x', '' + (mouseEvent.x - this.initialX - (boxClientRect.width / 2)));
      this.box.setAttribute('y', '' + (mouseEvent.y - this.initialY - (boxClientRect.height / 2)));
      this.hasBeenTranslated = true;
    }
  } */

  /*
  startTranslation(): void {
    this.mouseDownTranslation = true;
    const boxClientRect = (this.box as Element).getBoundingClientRect();
    this.initialX = boxClientRect.left;
    this.initialY = boxClientRect.top;
    this.setInitialCoordinates(this.boxRect);
    const childArray = Array.from(this.selected.children);
    childArray.forEach((child: SVGElement) => {
      this.setInitialCoordinates(child);
    });
  }*/

  /*


  setInitialCoordinates( svgElement: SVGElement){
    const initialPosition: InitialPosition = {
      xPos: '0', yPos: '0',
    };
    if (svgElement.getAttribute('transform')) {
      const translationValues: number[] = this.getTranslationValues(svgElement);
      initialPosition.xPos = (parseFloat(initialPosition.xPos) + translationValues[0]).toString();
      initialPosition.yPos = (parseFloat(initialPosition.yPos) + translationValues[1]).toString();
    }
    this.initialAndFinalPositions.set(svgElement, [initialPosition, {xPos: '0', yPos: '0'}]);
    console.log(svgElement.getAttribute('transform'));
  }

  finishTranslation() {
    const groupElement = RendererSingleton.canvas.querySelector('#box') as SVGGElement;
    groupElement.setAttributeNS(null, 'onmousemove', 'null');
    const box = RendererSingleton.canvas.querySelector('#box') as SVGElement;
    const selected = RendererSingleton.canvas.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    const boxRect = RendererSingleton.canvas.querySelector('#boxrect') as SVGElement;
    if (this.hasBeenTranslated) {
      childArray.forEach((child: SVGElement) => {
        this.translateChild(child, box);
        RendererSingleton.canvas.appendChild(child);
      });
      this.translateChild(boxRect, box);
      RendererSingleton.canvas.appendChild(boxRect);
    }
    this.mouseDownTranslation = false;
    childArray.forEach((child: SVGElement) => {
      this.setFinalCoordinates(child);
    });
    this.setFinalCoordinates(boxRect);
    this.pushTranslationCommand(this.initialAndFinalPositions, box);
  }

  setFinalCoordinates(svgElement: SVGElement): void{
    const initialPosition: InitialPosition = (this.initialAndFinalPositions.get(svgElement) as [InitialPosition, FinalPosition])[0];
    const translationValues: number[] = this.getTranslationValues(svgElement);
    const finalPosition: FinalPosition = {
      xPos: translationValues[0].toString(),
      yPos: translationValues[1].toString(),
    };
    this.initialAndFinalPositions.set(svgElement, [initialPosition, finalPosition]);
  }

  translateChild(child: SVGElement, box: SVGElement): void {
    let newX: number;
    let newY: number;
    const initialPosition = this.getTranslationValues(child);
    if (this.getTranslationValues(child)) {
      newX = parseFloat('' + (initialPosition[0] + parseFloat(box.getAttribute('x') as string)));
      newY = parseFloat('' + (initialPosition[1] + parseFloat(box.getAttribute('y') as string)));
    } else {
      newX = parseFloat('' + box.getAttribute('x'));
      newY = parseFloat('' + box.getAttribute('y'));
    }
    child.setAttribute('transform', 'translate(' + newX + ' ' + newY + ')');
  }

  getTranslationValues(child: SVGElement): number[] {
    const initialPosition = new Array<number>();
    const xforms = child.getAttribute('transform');
    const parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms as string) as unknown as string;
    if (parts) {
      initialPosition[0] = parseFloat(parts[1]);
      initialPosition[1] = parseFloat(parts[2]);
    } else {
      initialPosition[0] = 0;
      initialPosition[1] = 0; }
    return initialPosition;
  }

  get box(): SVGElement {
    return RendererSingleton.canvas.querySelector('#box') as SVGElement;
  }

  get selected(): SVGElement {
    return this.box.querySelector('#selected') as SVGGElement;
  }

  removeSelector(): void {
    RendererSingleton.canvas.removeChild(this.boxRect);
    RendererSingleton.canvas.removeChild(this.box);
    if (this.selected) {
      const childArray = Array.from(this.selected.children);
      childArray.forEach((child: SVGElement) => {
        RendererSingleton.canvas.appendChild(child);
      });
    }
    RendererSingleton.canvas.removeChild(this.selected);
  }

  pushTranslationCommand(initialAndFinalPositions: Map<SVGElement, [InitialPosition, FinalPosition]>, box: SVGElement): void {
    // const selected = RendererSingleton.canvas.querySelector('#selected') as SVGGElement;
    // const childArray = Array.from(selected.children);
    const command: Command = {
      execute(): void {
        initialAndFinalPositions.forEach(
          ((positions: [InitialPosition, FinalPosition], element: SVGElement) => {
            element.setAttribute('transform', 'translate(' + positions[1].xPos + ' ' + positions[1].yPos + ')');
          }));
      },
      unexecute(): void {
        initialAndFinalPositions.forEach(
          ((positions: [InitialPosition, FinalPosition], element: SVGElement) => {
            element.setAttribute('transform', 'translate(' + positions[0].xPos + ' ' + positions[0].yPos + ')');
            console.log(element.getAttribute('transform'));
          }));
      },
    };
    this.pushCommand(command);
  }

  pushCommand(command: Command): void {
    this.undoRedoService.pushCommand(command);
  }
  */
}
