
import { Injectable } from '@angular/core';

@Injectable()
// This service keeps track of the position of the mouse both on the page and on the canvas
// The information is fed to the service from the lateral-bar component
export class MousePositionService {
  private pageMousePositionX: number;
  private pageMousePositionY: number;
  private canvasMousePositionX: number;
  private canvasMousePositionY: number;
  constructor() {
    this.pageMousePositionX = 0;
    this.pageMousePositionY = 0;
    this.canvasMousePositionX = 0;
    this.canvasMousePositionY = 0;
  }
  get _pageMousePositionX(): number {
    return this.pageMousePositionX;
  }
  set _pageMousePositionX(xPos: number) {
    this.pageMousePositionX = xPos;
  }
  get _pageMousePositionY(): number {
    return this.pageMousePositionY;
  }
  set _pageMousePositionY(yPos: number) {
    this.pageMousePositionY = yPos;
  }
  get _canvasMousePositionX(): number {
    return this.canvasMousePositionX;
  }
  set _canvasMousePositionX(xPos: number) {
    this.canvasMousePositionX = xPos;
  }
  get _canvasMousePositionY(): number {
    return this.canvasMousePositionY;
  }
  set _canvasMousePositionY(yPos: number) {
    this.canvasMousePositionY = yPos;
  }
}
