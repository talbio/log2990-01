import { Injectable, Renderer2 } from '@angular/core';

@Injectable()
export class LineGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private readonly DEFAULT_DIAMETER = 5;
  private strokeWidth: number;
  private markerDiameter: number;
  private currentPolylineNumber: number;
  private isMakingLine = false;
  private currentPolyineStartX: number;
  private currentPolyineStartY: number;

  constructor() {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentPolylineNumber = 0;
    this.markerDiameter = this.DEFAULT_DIAMETER;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _markerDiameter(diameter: number) {
    this.markerDiameter = diameter;
  }

  get _markerDiameter(): number {
    return this.markerDiameter;
  }

  get _isMakingLine(): boolean {
    return this.isMakingLine;
  }

  // Initializes the path
  makeLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, primaryColor: string, currentChildPosition: number,
           defsElement: SVGElement, renderer: Renderer2) {
    if (!this.isMakingLine) {
      // Initiate the line
      canvas.innerHTML +=
      `<polyline id="line${this.currentPolylineNumber}"
      stroke-width="${this.strokeWidth}"
      stroke-linecap="round"
      stroke="${primaryColor}"
      pointer-events="none"
      fill="none"
      stroke-linejoin="round"
      points="${canvasPosX},${canvasPosY}">
      </polyline>`;

      this.createMarkers(primaryColor, renderer);

      this.isMakingLine = true;
      this.currentPolyineStartX = canvasPosX;
      this.currentPolyineStartY = canvasPosY;

    } else {
      this.addPointToCurrentLine(canvasPosX, canvasPosY, canvas, currentChildPosition);
    }
  }

  addPointToCurrentLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (!this.isMakingLine) {
      return;
    }
    const currentPolyLine = canvas.children[currentChildPosition - 1];
    const newPoint = ` ${canvasPosX},${canvasPosY}`;
    currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
  }
  updateLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      let pointsStr = currentPolyLine.getAttribute('points') as string;
      let indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // There is only one point, add a second to enable the update
        this.addPointToCurrentLine(canvasPosX, canvasPosY, canvas, currentChildPosition);
        // There will be a splace since we added a point
        pointsStr = currentPolyLine.getAttribute('points') as string;
        indexLastPoint = pointsStr.lastIndexOf(' ');
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      const newPoints = `${pointsWithoutLastStr} ${canvasPosX},${canvasPosY}`;
      currentPolyLine.setAttribute('points', newPoints);
    }
  }
  finishLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine(canvas, currentChildPosition);
      this.deleteLine(canvas, currentChildPosition);
      this.currentPolylineNumber += 1;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine(canvas, currentChildPosition);
      this.deleteLine(canvas, currentChildPosition);
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      const newPoint = ` ${this.currentPolyineStartX},${this.currentPolyineStartY}`;
      currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
      this.currentPolylineNumber += 1;
      this.isMakingLine = false;
    }
  }
  deleteLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      currentPolyLine.remove();
      this.currentPolylineNumber -= 1;
      this.isMakingLine = false;
    }
  }
  deleteLine(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      const pointsStr = currentPolyLine.getAttribute('points') as string;
      const indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // Only one point, user never moved after creating the line
        return;
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      currentPolyLine.setAttribute('points', pointsWithoutLastStr);
    }
  }

  // This function creates a marker tag with the color and the id of the polyline and returns a string for the URL
  createMarkers(color: string, renderer: Renderer2): SVGElement {
    const marker = renderer.createElement('marker');
    const circle = renderer.createElement('circle');

    renderer.setAttribute(circle, 'fill', color);
    renderer.setAttribute(circle, 'r', this.markerDiameter as unknown as string);
    renderer.setAttribute(circle, 'cy', '5');
    renderer.setAttribute(circle, 'cx', '5');
    renderer.setProperty(marker, 'id', `line${this.currentPolylineNumber}marker`);

    renderer.appendChild(marker, circle);
    const defs = renderer.selectRootElement('#definitions', true);
    const canvas = renderer.selectRootElement('#canvas', true);
    renderer.appendChild(defs, marker);
    this.addMarkersToNewLine(marker, canvas);
    return marker;
  }

  addMarkersToNewLine(markers: SVGElement, canvas: HTMLElement) {
    const newLine = canvas.children[canvas.children.length - 1];
    console.log('new line: \n' + newLine);
    const markersAddress = `url(#${markers.id})`;
    newLine.setAttribute('marker-start', markersAddress);
    newLine.setAttribute('marker-mid', markersAddress);
    newLine.setAttribute('marker-end', markersAddress);
  }
  // this function returns the markers element corresponding to a specific polyline so it can be modified
  findMarkerFromPolyline(polyline: SVGElement, defsElement: SVGElement): SVGElement {
    for (const child of [].slice.call(defsElement.children)) {
      const childCast = child as SVGElement;
      if (childCast.id === polyline.id + 'marker') {
        console.log(childCast);
        return childCast;
      }
    }
    // No marker was found for corresponding polyline, this should not happen as the marker is created with the polyline
    const returnEmpty = new SVGElement();
    return returnEmpty;
  }
}
