
import { Injectable } from '@angular/core';

@Injectable()
// This service keeps track of the position of the mouse both on the page and on the canvas
// The information is fed to the service from the lateral-bar component
export class MousePositionService {
  pageMousePositionX: number;
  pageMousePositionY: number;
  canvasMousePositionX: number;
  canvasMousePositionY: number;
  constructor() {
    this.pageMousePositionX = 0;
    this.pageMousePositionY = 0;
    this.canvasMousePositionX = 0;
    this.canvasMousePositionY = 0;
  }
}
