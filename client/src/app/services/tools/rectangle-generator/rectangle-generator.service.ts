import {Injectable} from '@angular/core';
import {PlotType} from '../../../data-structures/PlotType';

@Injectable()
export class RectangleGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentRectNumber = 0;
  private mouseDown = false;

  // attributes of rectangle
  private strokeWidth: number;
  private plotType: PlotType;


  constructor() {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
  }

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

  createRectangle(mouseEvent: any, canvas: any, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    switch(this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        '<rect id=\'rect' + this.currentRectNumber +
        '\' x=\'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        '\' data-start-x = \'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        '\' y=\'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
        '\' data-start-y = \'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
        '\' width = \'0\' height = \'0\' stroke=\'' + secondaryColor + '\' stroke-width=' + this.strokeWidth +
        ' fill=\'transparent\'></rect>';
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        '<rect id=\'rect' + this.currentRectNumber +
        '\' x=\'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        '\' data-start-x = \'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        '\' y=\'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
        '\' data-start-y = \'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
        '\' width = \'0\' height = \'0\' stroke=\'transparent\' stroke-width=' + this.strokeWidth +
        ' fill=\'' + primaryColor + '\'></rect>';
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        '<rect id=\'rect' + this.currentRectNumber +
        '\' x=\'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        '\' data-start-x = \'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        '\' y=\'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
        '\' data-start-y = \'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
        '\' width = \'0\' height = \'0\' stroke=\'' + secondaryColor + '\' stroke-width=' + this.strokeWidth +
        ' fill=\'' + primaryColor + '\'></rect>';
        break;
    }
    this.mouseDown = true;
  }

  finishRectangle(mouseEvent: any) {
    this.currentRectNumber += 1;
    this.mouseDown = false;
  }

  updateSquare(mouseEvent: any, canvas: any, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY;

        if (actualWidth >= 0) {
          if (actualHeight >= 0) {
            if (actualWidth > actualHeight) {
              currentRect.setAttribute('height', '' + actualWidth);
            } else {
              currentRect.setAttribute('width', '' + actualHeight);
            }
          } else {
            if (actualWidth > -actualHeight) {
              currentRect.setAttribute('height', '' + actualWidth);
            } else {
              currentRect.setAttribute('width', '' + -actualHeight);
            }
          }
        } else {
          if (actualHeight >= 0) {
            if (-actualWidth > actualHeight) {
              currentRect.setAttribute('height', '' + -actualWidth);
            } else {
              currentRect.setAttribute('width', '' + actualHeight);
            }
          } else {
            if (-actualWidth > -actualHeight) {
              currentRect.setAttribute('height', '' + -actualWidth);
            } else {
              currentRect.setAttribute('width', '' + -actualHeight);
            }
          }
        }
      }
    }
  }

  updateRectangle(mouseEvent: any, canvas: any, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + -actualWidth);
          currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + -actualHeight);
          currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
      }
    }
  }

  getBiggest(width: number, height: number) {

    if (width > 0 && height > 0 && width > height) {
      height = width;
    }
    if (width > 0 && height > 0 && width < height) {
      width = height;
    }
    if (width < 0 && height > 0 && -width > height) {
      height = -width;
    }
    if (width < 0 && height > 0 && -width < height) {
      width = -height;
    }
    if (width > 0 && height < 0 && width > height) {
      height = width;
    }
    if (width > 0 && height < 0 && width < height) {
      width = height;
    }
    if (width < 0 && height > 0 && -width > height) {
      height = -width;
    }
    if (width < 0 && height > 0 && -width < height) {
      width = -height;
    }
  }
}
