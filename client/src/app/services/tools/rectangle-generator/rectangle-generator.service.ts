import { MousePositionService } from './../../mouse-position/mouse-position.service';
import {Injectable} from '@angular/core';
import {PlotType} from '../../../data-structures/PlotType';

@Injectable()
export class RectangleGeneratorService {

  private currentRectNumber: number;
  private mouseDown: boolean;

  // attributes of rectangle
  private strokeWidth: number;
  private plotType: PlotType;

  constructor(private mouse: MousePositionService) {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentRectNumber = 0;
    this.mouseDown = false;
  }

  get _currentRectNumber() { return this.currentRectNumber; }
  set _currentRectNumber(count: number) { this.currentRectNumber = count; }
  get _strokeWidth() {
    return this.strokeWidth;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _plotType() {
    return this.plotType;
  }

  set _plotType(plotType: PlotType) {
    this.plotType = plotType;
  }

  // createRectangle(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {
  createRectangle(canvas: SVGElement, primaryColor: string, secondaryColor: string) {
    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<rect id="rect${this.currentRectNumber}"
        x="${this.mouse.canvasMousePositionX}"
        data-start-x="${this.mouse.canvasMousePositionX}"
        y="${this.mouse.canvasMousePositionY}"
        data-start-y="${this.mouse.canvasMousePositionY}"
        width="0" height="0" stroke="${secondaryColor}" stroke-width="${this.strokeWidth}"
        fill="transparent"></rect>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<rect id="rect${this.currentRectNumber}"
        x="${this.mouse.canvasMousePositionX}"
        data-start-x="${this.mouse.canvasMousePositionX}"
        y="${this.mouse.canvasMousePositionY}"
        data-start-y="${this.mouse.canvasMousePositionY}"
        width = "0" height = "0" stroke="transparent" stroke-width="${this.strokeWidth}"
        fill="${primaryColor}"></rect>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<rect id="rect${this.currentRectNumber}"
        x="${this.mouse.canvasMousePositionX}"
        data-start-x="${this.mouse.canvasMousePositionX}"
        y="${this.mouse.canvasMousePositionY}"
        data-start-y="${this.mouse.canvasMousePositionY}"
        width="0" height="0" stroke="${secondaryColor}" stroke-width="${this.strokeWidth}"
        fill="${primaryColor}"></rect>`;
        break;
    }
    this.mouseDown = true;
  }

  updateSquare(canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.mouse.canvasMousePositionX - startRectX;
        const actualHeight: number = this.mouse.canvasMousePositionY - startRectY;
        if (actualWidth >= 0) {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + actualWidth);
          }
        } else {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
            currentRect.setAttribute('x', '' + (this.mouse.canvasMousePositionX + Math.abs(actualWidth) - Math.abs(actualHeight)));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + this.mouse.canvasMousePositionX);
          }
        }
        if (actualHeight >= 0) {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + actualHeight);
          }
        } else {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
            currentRect.setAttribute('y', '' + (this.mouse.canvasMousePositionY + Math.abs(actualHeight) - Math.abs(actualWidth)));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + this.mouse.canvasMousePositionY);
          }
        }
      }
    }
  }

  updateRectangle(canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.mouse.canvasMousePositionX - startRectX;
        const actualHeight: number = this.mouse.canvasMousePositionY - startRectY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('x', '' + this.mouse.canvasMousePositionX);
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('y', '' + this.mouse.canvasMousePositionY);
        }
      }
    }
  }

  finishRectangle() {
    if (this.mouseDown) {
      this.currentRectNumber += 1;
      this.mouseDown = false;
    }
  }

  clone(item: SVGElement): string {
    const x = parseFloat(item.getAttribute('x') as unknown as string) + 10;
    const y = parseFloat(item.getAttribute('y') as unknown as string) + 10;
    const h = parseFloat(item.getAttribute('height') as unknown as string);
    const w = parseFloat(item.getAttribute('width') as unknown as string);
    const color1 = item.getAttribute('fill');
    const color2 = item.getAttribute('stroke');
    const strokeWidth = item.getAttribute('stroke-width');
    const newItem =
        `<rect id="rect${this.currentRectNumber}"
        x="${x}" data-start-x="${x}"
        y="${y}" data-start-y="${y}"
        width="${w}" height="${h}" stroke="${color2}" stroke-width="${strokeWidth}"
        fill="${color1}"></rect>`;
    this.currentRectNumber++;
    return newItem;
  }
}
