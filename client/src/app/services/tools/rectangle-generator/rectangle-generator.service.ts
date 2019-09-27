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

  updateSquare(mouseEvent: any, canvas: any, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY;
        if (actualWidth >= 0) {
          if(Math.abs(actualHeight) > Math.abs(actualWidth))
          {
            //height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
          }
          else{
            //width is bigger, act normal
            currentRect.setAttribute('width', '' + actualWidth);
          }
        } else {
          if(Math.abs(actualHeight) > Math.abs(actualWidth))
          {
            //height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
            currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X + Math.abs(actualWidth) - Math.abs(actualHeight)));
          }
          else{
            //width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
          }
        }
        if (actualHeight >= 0) {
          if(Math.abs(actualWidth) > Math.abs(actualHeight))
          {
            //width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
          }
          else{
            //height is bigger, act normal
            currentRect.setAttribute('height', '' + actualHeight);
          }
        } else {
          if(Math.abs(actualWidth) > Math.abs(actualHeight))
          {
            //width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
            currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y + Math.abs(actualHeight) - Math.abs(actualWidth)));
          }
          else{
            //height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
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
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
      }
    }
  }

  finishRectangle(mouseEvent: any) {
    this.currentRectNumber += 1;
    this.mouseDown = false;
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
