import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shape',
  templateUrl: './shape.component.html',
  styleUrls: ['./shape.component.css']
})
export class ShapeComponent implements OnInit {
/*
  const shapeType = {
    RECTANGLE : 'rectangle',
    ELIPSE : 'elipse',
    POLYGONE : 'polygone'
  }

  struct RectangleParameter{
    width: number;
    height: number;
    strokeSize: number;
    primColor: string;
    secondColor: string;
    drawMode: string;
  }
  // Attributs

  protected ShapeParameter: ParameterSet
*/
  constructor(shape: shapeType, startPoint: [number, number], endPoint: [number, number], param: RectangleParameter) {
    switch (shape) {
      case 'rectangle':


    }
   }

  ngOnInit() {
  }

  printRectangle1(startPoint: [number, number], param: RectangleParamater){
    let Canvas = document.getElementById('canvas');
    //check if Canvas exists
    if (Canvas != null){
      let endPoint: [number, number];
      while (!mouseUp){
        endPoint[0] = event.clientX;
        endPoint[1] = event.clientY;
        drawRectangle(startPoint, endPoint, param);
      }
      if (onmouseUp) {
        createRectangle(startPoint, endPoint, param)
      }
  }
  
  drawRectangle(startPoint: [number, number], endPoint: [number, number], param: RectangleParameter){
    // Assess height and width of the momentary rectangle
    this.param.width = endPoint[0] - startPoint[0];
    this.param.height = endPoint[1] - startPoint[1];
    // Show the rectangle
    if (param.drawMode == 'fillAndBorder') {
        Canvas.innerHTML += '<rect x=' + this.startPoint[0] + ' y=' + this.startPoint[1] + ' width=' + this.param.width + ' height=' +
        this.param.height + ' stroke=' + this.param.secondaryColor + ' fill=' + this.param.primaryColor + ' stroke-width=' +
        this.param.strokeSize + ' />';
      }
      else if (drawMode == 'onlyBorder') {
        Canvas.innerHTML += '<rect x=' + this.startPoint[0] + ' y=' + this.startPoint[1] + ' width=' + this.param.width + ' height=' +
        this.param.height + ' stroke=' + this.param.secondaryColor + ' fill=\'transparent\' stroke-width=' + this.param.strokeSize + ' />';
      }
      else if (drawMode === 'onlyFill') {
        Canvas.innerHTML += '<rect x=' + this.startPoint[0] + ' y=' + this.startPoint[1] + ' width=' + this.param.width + ' height=' +
        this.param.height + ' stroke=\'transparent\' fill=' + this.param.primaryColor + ' stroke-width=' + this.param.strokeSize + ' />';
      }
  }

  createRectangle(startPoint: [number, number], endPoint: [number, number], param: RectangleParameter){
    if (param.drawMode == 'fillAndBorder') {
        Canvas.innerHTML += '<rect id = ' + shapeCounter + ' x=' + this.startPoint[0] + ' y=' + this.startPoint[1] + ' width=' + this.param.width + ' height=' +
        this.param.height + ' stroke=' + this.param.secondaryColor + ' fill=' + this.param.primaryColor + ' stroke-width=' +
        this.param.strokeSize + ' />';
        ShapeCounter += 1;
      }
      else if (drawMode == 'onlyBorder') {
        Canvas.innerHTML += '<rect x=' + this.startPoint[0] + ' y=' + this.startPoint[1] + ' width=' + this.param.width + ' height=' +
        this.param.height + ' stroke=' + this.param.secondaryColor + ' fill=\'transparent\' stroke-width=' + this.param.strokeSize + ' />';
        ShapeCounter += 1;
      }
      else if (drawMode == 'onlyFill') {
        Canvas.innerHTML += '<rect x=' + this.startPoint[0] + ' y=' + this.startPoint[1] + ' width=' + this.param.width + ' height=' +
        this.param.height + ' stroke=\'transparent\' fill=' + this.param.primaryColor + ' stroke-width=' + this.param.strokeSize + ' />';
        ShapeCounter += 1;
      }
  }


}
