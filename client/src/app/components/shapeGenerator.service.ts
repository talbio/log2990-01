import { WorkZoneComponent } from './draw-view/work-zone/work-zone.component';
import { Injectable } from '@angular/core';

@Injectable()
export class ShapeGeneratorService {

  private currentPathNumber = 0;
  private currentRectNumber = 0;
  private mouseDown = false;

  // private canvas = document.getElementById('canvas');
  // private OFFSET_CANVAS_Y = this.canvas.getBoundingClientRect().top;
  // private OFFSET_CANVAS_X = this.canvas.getBoundingClientRect().left;
  constructor() {}

  printRectangle(){
    console.log("yea");
  }
/*

document.body.onmousedown = function() {
  mouseDown = true;
}
document.body.onmouseup = function() {
  mouseDown = false;
}*/

finishRectangle(e: any){
  // currentPathNumber += 1;
  this.currentRectNumber += 1;
  this.mouseDown = false;
}

createRectangle(e: any){
  let canvas = document.getElementById('canvas');
  if(canvas != null){
  let OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
  let OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
  canvas.innerHTML += "<rect id='rect" + this.currentRectNumber + "' x='" + (e.pageX - OFFSET_CANVAS_X) +
  '\' data-start-x = \'' + (e.pageX - OFFSET_CANVAS_X) + "' y='" + (e.pageY - OFFSET_CANVAS_Y) + "' data-start-y = '"
  + (e.pageY - OFFSET_CANVAS_Y) + "' width = '0' height = '0' stroke='black' stroke-width='6' fill='transparent'></rect>";
  // canvas.innerHTML += "<circle id='pathBegin" + currentPathNumber + "' cx='" + (e.pageX - OFFSET_CANVAS_X) + "' cy='" +(e.pageY - OFFSET_CANVAS_Y) + "' r='3'  fill='black'></circle><path id='path" + currentPathNumber + "' d='M"+(e.pageX - OFFSET_CANVAS_X) + " " + (e.pageY - OFFSET_CANVAS_Y) + "' stroke='black' stroke-width='6' stroke-linecap='round' fill='none'></path>";
  this.mouseDown = true;
  }
}
updateRectangle(e: any){
  let canvas = document.getElementById('canvas');
  if(canvas != null){
  let OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
  let OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
  if(this.mouseDown)
    {
      let currentRect = document.getElementById("rect" + this.currentRectNumber);
      if(currentRect != null)
      {
        let startRectX:number = Number(currentRect.getAttribute("data-start-x"));
        let startRectY:number = Number(currentRect.getAttribute("data-start-y"));
        if((e.pageX - OFFSET_CANVAS_X) >= startRectX)
        {
          currentRect.setAttribute("width", "" + ((e.pageX - OFFSET_CANVAS_X)- startRectX));
        }
        else{
          currentRect.setAttribute("width", "" + (startRectX - (e.pageX - OFFSET_CANVAS_X)));
          currentRect.setAttribute("x", "" + (e.pageX - OFFSET_CANVAS_X));
        }
        if((e.pageY - OFFSET_CANVAS_Y) >= startRectY)
        {
          currentRect.setAttribute("height", "" + ((e.pageY - OFFSET_CANVAS_Y)- startRectY));
        }
        else{
          currentRect.setAttribute("height", "" + (startRectY - (e.pageY - OFFSET_CANVAS_Y)));
          currentRect.setAttribute("y", "" + (e.pageY - OFFSET_CANVAS_Y));
        }
      }
      // let currentPath = document.getElementById("path" + currentPathNumber);
      // if (currentPath != null)
      // {
      //   currentPath.setAttribute("d", currentPath.getAttribute("d") + " L" + (e.pageX - OFFSET_CANVAS_X) + " " + (e.pageY - OFFSET_CANVAS_Y));
      // }
    }
  }
  }
}
