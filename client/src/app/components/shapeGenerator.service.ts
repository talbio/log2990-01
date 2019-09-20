import { Injectable } from '@angular/core';

@Injectable()
export class ShapeGeneratorService {

  // private currentRectNumber = 1;
  // private currentPathNumber = 1;
  // mouseDown = false;

constructor() {}

  //
 // whenMouseDown(e: any){
   // canvas.innerHTML += "<rect id='rect" + currentRectNumber + "' x='" + (e.pageX - OFFSET_CANVAS_X) + "' y='" +
    //(e.pageY - OFFSET_CANVAS_Y) + '\' width = \'0\' height = \'0\' stroke=\'black\' stroke-width=\'6\' fill=\'transparent\'></rect>';
    // canvas.innerHTML += "<circle id='pathBegin" + currentPathNumber + "' cx='" + (e.pageX - OFFSET_CANVAS_X) +
    // "' cy='" +(e.pageY - OFFSET_CANVAS_Y) + "' r='3'  fill='black'></circle><path id='path" + currentPathNumber +
    // "' d='M"+(e.pageX - OFFSET_CANVAS_X) + " " + (e.pageY - OFFSET_CANVAS_Y) + "' stroke='black' stroke-width='6'
    // stroke-linecap='round' fill='none'></path>";
  //}

  printRectangle(){
    console.log("yea");
  }/*
  if (canvas != null)
  {
    const OFFSET_CANVAS_X:number = canvas.getBoundingClientRect().left;
    const OFFSET_CANVAS_Y:number = canvas.getBoundingClientRect().top;
    canvas.addEventListener('mousedown', e => {
      canvas.innerHTML += "<rect id='rect" + currentRectNumber + "' x='" + (e.pageX - OFFSET_CANVAS_X) + "' y='" + (e.pageY - OFFSET_CANVAS_Y) + "' width = '0' height = '0' stroke='black' stroke-width='6' fill='transparent'></rect>";
      // canvas.innerHTML += "<circle id='pathBegin" + currentPathNumber + "' cx='" + (e.pageX - OFFSET_CANVAS_X) + "' cy='" +(e.pageY - OFFSET_CANVAS_Y) + "' r='3'  fill='black'></circle><path id='path" + currentPathNumber + "' d='M"+(e.pageX - OFFSET_CANVAS_X) + " " + (e.pageY - OFFSET_CANVAS_Y) + "' stroke='black' stroke-width='6' stroke-linecap='round' fill='none'></path>"
    })
    canvas.addEventListener('mousemove', e => {
      if(mouseDown)
      {
        let currentRect = document.getElementById("rect" + currentRectNumber);
        if(currentRect != null)
        {
          let currentRectX: number = Number(currentRect.getAttribute("x"));
          let currentRectY: number = Number(currentRect.getAttribute("y"));
          currentRect.setAttribute('width', '' + ((e.pageX - OFFSET_CANVAS_X) - currentRectX));
          currentRect.setAttribute('height', '' + ((e.pageY - OFFSET_CANVAS_Y) - currentRectY));
        }
        // let currentPath = document.getElementById("path" + currentPathNumber);
        // if (currentPath != null)
        // {
        //   currentPath.setAttribute("d", currentPath.getAttribute("d") + " L" + (e.pageX - OFFSET_CANVAS_X) + " " + (e.pageY - OFFSET_CANVAS_Y));
        // }
      }
    })
    canvas.addEventListener('mouseup', e => {
      let currentPath = document.getElementById("path" + currentPathNumber);
      if (currentPath != null)
      {
        // closes path, not necessary for draw
        // currentPath.setAttribute("d", currentPath.getAttribute("d") + " Z");
      }
      // currentPathNumber += 1;
      currentRectNumber += 1;
    })
  }
})
}*/
}
