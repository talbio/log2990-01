import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rectangle',
  templateUrl: './rectangle.component.html',
  styleUrls: ['./rectangle.component.css']
})

interface RectangleParameter{
  width: number;
  height: number;
  strokeSize: number;
  primColor: string;
  secondColor: string;
  drawMode: string;
}
export class RectangleComponent implements OnInit {
  //default values, to be replaced by others when called from the DOM
  private xValue:number = 10;
  private yValue:number = 10;
  private primaryColor:string = "transparent";
  private secondaryColor:string = "black";
  constructor() {}

  ngOnInit() {}


  //function being tested with hardcode right now, need to incorporate the values in the header and delete the loop when on click position detection is ready.
  //the three options for drawMode are "onlyBorder", "onlyFill" and "fillAndBorder"
  // printRectangle() calls drawRectangle() until mouseUp, then calls createRectangle()
  printRectangle(xVal:number, yVal:number, strokeSize:number, primColor:string, secondColor:string, drawMode:string){
    let Canvas = document.getElementById("canvas");
    //check if Canvas exists
    if(Canvas != null){
      //check for mode so the rectangle uses the proper colors
      if(drawMode == "fillAndBorder")
      {
        Canvas.innerHTML += "<rect x=" + this.xValue + " y="+ this.yValue +" width='30' height='30' stroke="+ this.secondaryColor +" fill="+ this.primaryColor +" stroke-width=" + strokeSize + " />"
      }
      else if(drawMode == "onlyBorder")
      {
        Canvas.innerHTML += "<rect x=" + this.xValue + " y="+ this.yValue +" width='30' height='30' stroke="+ this.secondaryColor +" fill='transparent' stroke-width=" + strokeSize + " />"
      }
      else if(drawMode == "onlyFill")
      {
        Canvas.innerHTML += "<rect x=" + this.xValue + " y="+ this.yValue +" width='30' height='30' stroke='transparent' fill="+ this.primaryColor +" stroke-width=" + strokeSize + " />"
      }

      this.xValue += 40;
      if(this.xValue >= 180)
      {
        this.xValue = 10;
        this.yValue += 40;
      }
      if(this.xValue == 50)
      {
        this.primaryColor = "red";
        this.secondaryColor = "transparent";
      }
      else if(this.xValue == 90)
      {
        this.primaryColor = "azure";
        this.secondaryColor = "burlywood";
      }
      else if(this.xValue == 130)
      {
        this.primaryColor = "gold";
        this.secondaryColor = "gray";
      }
      else if(this.xValue == 170)
      {
        this.primaryColor = "black";
        this.secondaryColor = "lightblue";
      }
      else if(this.xValue == 10)
      {
        this.primaryColor = "transparent";
        this.secondaryColor = "black";
      }
    }
  }

  /*printRectangle1(startPoint: [number, number], param: RectangleParamater){
    let Canvas = document.getElementById("canvas");
    //check if Canvas exists
    if(Canvas != null){
      let endPoint: [number, number];
      while (!mouseUp){
        endPoint[0] = event.clientX;
        endPoint[1] = event.clientY;
        drawRectangle(startPoint, endPoint, param);
      }
      if (mouseUp) createRectangle(startPoint, endPoint, param);
  }*/
  // clickerFunctTest(){
  //   let canvas = document.getElementById("canvas");
  //   if(canvas != null)
  //   {
  //     canvas.addEventListener('mousedown', function(e){
  //       var t = e.target;
  //       if(t != null)
  //       {
  //         console.log(t.getBoundingClientRect());
  //       }
  //     }, false);
  //   }
  // }
  //from the internet, needs to be rewritten in a correct Angular format with our own code, used for testing right now

  // canvas.addEventListener('mousedown', function(e){
  //   var t = e.target;
  //   console.log(t.getBoundingClientRect());
  // }, false);

  // svg.addEventListener('click', function(e) {
  //   var t = e.target;
  //   if (t.nodeName != 'circle') return;
  //   t.setAttributeNS(null, 'r',
  //     parseFloat(t.getAttributeNS(null, 'r')) + 10
  //   );
  //   console.log(t.getBoundingClientRect());
  // }, false);

  /*drawRectangle(startPoint: [number, number], endPoint: [number, number], param: RectangleParameter){
    // Assess height and width of the momentary rectangle
    this.param.width = endPoint[0] - startPoint[0];
    this.param.height = endPoint[1] - startPoint[1];
    // Show the rectangle
    if(param.drawMode == "fillAndBorder")
      {
        Canvas.innerHTML += "<rect x=" + this.startPoint[0] + " y="+ this.startPoint[1] +" width="+ this.param.width + " height=" + this.param.height + " stroke="+ this.param.secondaryColor +" fill="+ this.param.primaryColor +" stroke-width=" + this.param.strokeSize + " />"
      }
      else if(drawMode == "onlyBorder")
      {
        Canvas.innerHTML += "<rect x=" + this.startPoint[0] + " y="+ this.startPoint[1] +" width="+ this.param.width + " height=" + this.param.height + " stroke="+ this.param.secondaryColor +" fill='transparent' stroke-width=" + this.param.strokeSize + " />"
      }
      else if(drawMode == "onlyFill")
      {
        Canvas.innerHTML += "<rect x=" + this.startPoint[0] + " y="+ this.startPoint[1] +" width="+ this.param.width + " height=" + this.param.height + " stroke='transparent' fill="+ this.param.primaryColor +" stroke-width=" + this.param.strokeSize + " />"
      }
  }

  createRectangle(startPoint: [number, number], endPoint: [number, number], param: RectangleParameter){
    if(param.drawMode == "fillAndBorder"){
        Canvas.innerHTML += "<rect x=" + this.startPoint[0] + " y="+ this.startPoint[1] +" width="+ this.param.width + " height=" + this.param.height + " stroke="+ this.param.secondaryColor +" fill="+ this.param.primaryColor +" stroke-width=" + this.param.strokeSize + " />"
        // Ajouter le constructeur de Shape
      }
      else if(drawMode == "onlyBorder"){
        Canvas.innerHTML += "<rect x=" + this.startPoint[0] + " y="+ this.startPoint[1] +" width="+ this.param.width + " height=" + this.param.height + " stroke="+ this.param.secondaryColor +" fill='transparent' stroke-width=" + this.param.strokeSize + " />"
        // Ajouter le constructeur de Shape
      }
      else if(drawMode == "onlyFill"){
        Canvas.innerHTML += "<rect x=" + this.startPoint[0] + " y="+ this.startPoint[1] +" width="+ this.param.width + " height=" + this.param.height + " stroke='transparent' fill="+ this.param.primaryColor +" stroke-width=" + this.param.strokeSize + " />"
        // Ajouter le constructeur de Shape
      }
  }*/
//}
}
