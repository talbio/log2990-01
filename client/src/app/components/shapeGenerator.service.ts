// import { Injectable, Renderer2 } from '@angular/core';
import { Injectable} from '@angular/core';

@Injectable()
export class ShapeGeneratorService {

  private OFFSET_CANVAS_Y: any;
  private OFFSET_CANVAS_X: any;
  // private canvas: any;
  private currentRectNumber = 0;
  private mouseDown = false;

  // private canvas = document.getElementById('canvas');
  // private OFFSET_CANVAS_Y = this.canvas.getBoundingClientRect().top;
  // private OFFSET_CANVAS_X = this.canvas.getBoundingClientRect().left;
  // constructor(private renderer: Renderer2) {}
  constructor() {}

  // createRectangle(e: any) {
  createRectangle(e: any, canvas:any) {

    // this.canvas = document.getElementById('canvas');
    // this.canvas = this.renderer.selectRootElement('canvas');


    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML += '<rect id=\'rect' + this.currentRectNumber + '\' x=\'' + (e.pageX - this.OFFSET_CANVAS_X) +
    '\' data-start-x = \'' + (e.pageX - this.OFFSET_CANVAS_X) + '\' y=\'' + (e.pageY - this.OFFSET_CANVAS_Y) + '\' data-start-y = \''
    + (e.pageY - this.OFFSET_CANVAS_Y) + '\' width = \'0\' height = \'0\' stroke=\'black\' stroke-width=\'6\' fill=\'transparent\'></rect>';
    
    this.mouseDown = true;
  }

  updateRectangle(e: any) {
    if (this.mouseDown) {
      //problématique, puisqu'il faut connaitre le mode pour aller chercher l'élément, mais que le renderer se produit avant le mode-manager
      const currentRect = document.getElementById('rect' + this.currentRectNumber);
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        if ((e.pageX - this.OFFSET_CANVAS_X) >= startRectX) {
          currentRect.setAttribute('width', '' + ((e.pageX - this.OFFSET_CANVAS_X) - startRectX));
        } else {
          currentRect.setAttribute('width', '' + (startRectX - (e.pageX - this.OFFSET_CANVAS_X)));
          currentRect.setAttribute('x', '' + (e.pageX - this.OFFSET_CANVAS_X));
        }
        if ((e.pageY - this.OFFSET_CANVAS_Y) >= startRectY) {
          currentRect.setAttribute('height', '' + ((e.pageY - this.OFFSET_CANVAS_Y) - startRectY));
        } else {
          currentRect.setAttribute('height', '' + (startRectY - (e.pageY - this.OFFSET_CANVAS_Y)));
          currentRect.setAttribute('y', '' + (e.pageY - this.OFFSET_CANVAS_Y));
        }
      }
    }
  }

  finishRectangle(e: any) {
    this.currentRectNumber += 1;
    this.mouseDown = false;
  }
}
