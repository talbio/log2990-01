import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { Injectable } from '@angular/core';

@Injectable()
export class PencilGeneratorService {

  /**
   * attributes of pencil tool :
   */
  private readonly DEFAULT_WIDTH = 5;
  private strokeWidth: number;
  private currentPencilPathNumber: number;
  private mouseDown = false;

  constructor(private mousePosition: MousePositionService) {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentPencilPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }
  // Uniquely useful for tests, comment for further usage
  set _mouseDown(state: boolean) {
    this.mouseDown = state;
  }

  set _currentPencilPathNumber(count: number) { this.currentPencilPathNumber = count; }

  // Initializes the path
  createPenPath(canvas: SVGElement, primaryColor: string) {

    // let string addToHTML = generateHTML();
    canvas.innerHTML +=
      `<path id=\'pencilPath${this.currentPencilPathNumber}\'
      d=\'M ${this.mousePosition.canvasMousePositionX} ${this.mousePosition.canvasMousePositionY}
      L ${this.mousePosition.canvasMousePositionX} ${this.mousePosition.canvasMousePositionY}\'
      stroke=\'${primaryColor}\' stroke-width=\'${this.strokeWidth}\' stroke-linecap=\'round\' fill=\'none\'></path>`;

    this.mouseDown = true;
  }

  /**
   * @desc // Updates the path when the mouse is moving (mousedown)
   */
  updatePenPath(canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + this.mousePosition.canvasMousePositionX +
        ' ' + (this.mousePosition.canvasMousePositionY));
      }
    }
  }

  /**
   * @desc Finalizes the path, sets up the next one
   */
  finishPenPath() {
    if (this.mouseDown) {
      this.currentPencilPathNumber += 1;
      this.mouseDown = false;
    }
  }

  clone(item: SVGElement): SVGElement {
    const newItem = item.cloneNode() as SVGElement;
    newItem.setAttribute('id', 'pencilPath' + this.currentPencilPathNumber++);
    return newItem;
    /*const linecap = newItem.getAttribute('stroke-linecap');
    const color1 = newItem.getAttribute('fill');
    // const color2 = item.getAttribute('stroke');
    const strokeWidth = newItem.getAttribute('stroke-width');
    const currentPath = newItem.getAttribute('d');
    let points: string[];
    if (currentPath !== null) {
      let newPath: string;
      points = currentPath.split(' ');
      // Slightly displacing each point
      for (const point of points) {
        let initialX: string;
        if (point[0] === 'M') {
          for (let i = 1 ; i < point.length ; i++) {
            initialX += point[i];
          }
        }
        if (point !== 'L' && point !== 'M' && point !== 'Z') {
          newPath += (parseFloat(point) + 10) as unknown as string;
          if()
        }
      }/*
      const newItem =
        `<path id="pencilPath${this.currentPencilPathNumber}"
        d="${points}" stroke="${color1}" stroke-width="${strokeWidth}"
        stroke-linecap="${linecap}" fill="none"></path>`;
      this.currentPencilPathNumber++;
      return newItem;
    } else {
      console.log('cannot recognize "d" in html of ' + item.id);
      return 'to discard';
    }*/
  }
}
