import { Injectable } from '@angular/core';
import { LineDashStyle, LineJoinStyle } from 'src/app/data-structures/LineStyles';
import {RendererSingleton} from '../../renderer-singleton';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class LineGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private readonly DEFAULT_DIAMETER = 5;
  private readonly DEFAULT_LINEJOIN = 'round';
  private readonly DEFAULT_DASHARRAY = 'none';
  private readonly DEFAULT_LINECAP = 'butt';
  private readonly STRAIGHT_ENDS = 'butt';
  private readonly CURVY_ENDS = 'round';
  private readonly LINEJOIN_ANGLE = 'miter';
  private readonly LINEJOIN_ROUND = 'round';
  private readonly DOT_SIZE = '1';
  private readonly DEFAULT_LINEJOINSTYLE = LineJoinStyle.Round;
  private readonly DEFAULT_LINEDASHSTYLE = LineDashStyle.Continuous;
  private strokeWidth: number;
  private markerDiameter: number;
  private currentPolylineNumber: number;
  private isMakingLine = false;
  private currentPolyineStartX: number;
  private currentPolyineStartY: number;
  private isMarkersActive: boolean;
  private lineJoin: string;
  private dashArray: string;
  private lineCap: string;
  private lineJoinStyle: LineJoinStyle;
  private lineDashStyle: LineDashStyle;

  constructor(private mousePosition: MousePositionService) {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentPolylineNumber = 0;
    this.markerDiameter = this.DEFAULT_DIAMETER;
    this.isMarkersActive = false;
    this.lineJoin = this.DEFAULT_LINEJOIN;
    this.dashArray = this.DEFAULT_DASHARRAY;
    this.lineCap = this.DEFAULT_LINECAP;
    this.lineJoinStyle = this.DEFAULT_LINEJOINSTYLE;
    this.lineDashStyle = this.DEFAULT_LINEDASHSTYLE;
  }

  set _lineJoinStyle(style: LineJoinStyle) {
    this.lineJoinStyle = style;
    switch (style) {
      case LineJoinStyle.WithPoints:
        this.isMarkersActive = true;
        this.lineJoin = this.DEFAULT_LINEJOIN;
        break;
      case LineJoinStyle.Angled:
        this.isMarkersActive = false;
        this.lineJoin = this.LINEJOIN_ANGLE;
        break;
      case LineJoinStyle.Round:
        this.isMarkersActive = false;
        this.lineJoin = this.LINEJOIN_ROUND;
        break;
      default:
        break;
    }
  }

  get _lineJoinStyle(): LineJoinStyle {
    return this.lineJoinStyle;
  }

  set _lineDashStyle(style: LineDashStyle) {
    this.lineDashStyle = style;
    switch (style) {
      case LineDashStyle.Continuous:
        this.dashArray = this.DEFAULT_DASHARRAY;
        this.lineCap = this.DEFAULT_LINECAP;
        break;
      case LineDashStyle.Dashed:
        this.dashArray = `${this.strokeWidth * 2}, ${this.strokeWidth}`;
        this.lineCap = this.STRAIGHT_ENDS;
        break;
      case LineDashStyle.Dotted:
        this.dashArray = `${this.DOT_SIZE}, ${this.strokeWidth * 2}`;
        this.lineCap = this.CURVY_ENDS;
        break;
      default:
        break;
    }
  }

  get _lineDashStyle(): LineDashStyle {
    return this.lineDashStyle;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
    // reload linedashstyle with new strokewidth
    this._lineDashStyle = this.lineDashStyle;

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
  set _currentPolylineNumber(count: number) { this.currentPolylineNumber = count; }

  // Initializes the path
  makeLine(canvas: SVGElement, primaryColor: string, currentChildPosition: number) {
    if (!this.isMakingLine) {
      // Initiate the line
      canvas.innerHTML +=
      `<polyline id="line${this.currentPolylineNumber}"
      stroke-width="${this.strokeWidth}"
      stroke-linecap="${this.lineCap}"
      stroke="${primaryColor}"
      stroke-dasharray="${this.dashArray}"
      fill="none"
      stroke-linejoin="${this.lineJoin}"
      points="${this.mousePosition.canvasMousePositionX},${this.mousePosition.canvasMousePositionY}">
      </polyline>`;

      this.createMarkers(primaryColor);

      this.isMakingLine = true;
      this.currentPolyineStartX = this.mousePosition.canvasMousePositionX;
      this.currentPolyineStartY = this.mousePosition.canvasMousePositionY;

    } else {
      this.addPointToCurrentLine(canvas, currentChildPosition);
    }
  }

  addPointToCurrentLine(canvas: SVGElement, currentChildPosition: number) {
    if (!this.isMakingLine) {
      return;
    }
    const currentPolyLine = canvas.children[currentChildPosition - 1];
    const newPoint = ` ${this.mousePosition.canvasMousePositionX},${this.mousePosition.canvasMousePositionY}`;
    currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
  }
  updateLine(canvas: SVGElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      let pointsStr = currentPolyLine.getAttribute('points') as string;
      let indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // There is only one point, add a second to enable the update
        this.addPointToCurrentLine(canvas, currentChildPosition);
        // There will be a splace since we added a point
        pointsStr = currentPolyLine.getAttribute('points') as string;
        indexLastPoint = pointsStr.lastIndexOf(' ');
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      const newPoints = `${pointsWithoutLastStr} ${this.mousePosition.canvasMousePositionX},${this.mousePosition.canvasMousePositionY}`;
      currentPolyLine.setAttribute('points', newPoints);
    }
  }
  finishLineBlock(canvas: SVGElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine(canvas, currentChildPosition);
      this.deleteLine(canvas, currentChildPosition);
      this.currentPolylineNumber += 1;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock(canvas: SVGElement, currentChildPosition: number) {
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
  deleteLineBlock(canvas: SVGElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      currentPolyLine.remove();
      this.currentPolylineNumber -= 1;
      this.isMakingLine = false;
    }
  }
  deleteLine(canvas: SVGElement, currentChildPosition: number) {
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
  createMarkers(color: string): SVGElement {
    const marker = RendererSingleton.renderer.createElement('marker');
    const circle = RendererSingleton.renderer.createElement('circle');

    RendererSingleton.renderer.setAttribute(circle, 'fill', color);
    RendererSingleton.renderer.setAttribute(circle, 'r', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(circle, 'cy', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(circle, 'cx', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerWidth', (this.markerDiameter * 2) as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerHeight', (this.markerDiameter * 2) as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'refX', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'refY', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerUnits', 'userSpaceOnUse');
    RendererSingleton.renderer.setProperty(marker, 'id', `line${this.currentPolylineNumber}marker`);

    RendererSingleton.renderer.appendChild(marker, circle);
    const defs = RendererSingleton.renderer.selectRootElement('#definitions', true);
    const canvas = RendererSingleton.renderer.selectRootElement('#canvas', true);
    RendererSingleton.renderer.appendChild(defs, marker);
    if (this.isMarkersActive) {
      this.addMarkersToNewLine(marker, canvas);
    }
    // reload
    canvas.innerHTML = canvas.innerHTML;
    return marker;
  }

  addMarkersToNewLine(markers: SVGElement, canvas: HTMLElement) {
    const newLine = canvas.children[canvas.children.length - 1];
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
        return childCast;
      }
    }
    // No marker was found for corresponding polyline, this should not happen as the marker is created with the polyline
    return new SVGElement();
  }

  clone(item: SVGElement): string {
    const linecap = item.getAttribute('stroke-linecap');
    const color2 = item.getAttribute('stroke');
    const strokeWidth = item.getAttribute('stroke-width');
    const dasharray = item.getAttribute('stroke-dasharray');
    const linejoin = item.getAttribute('stroke-linejoin');
    const currentPath = item.getAttribute('points');
    let points: string[];
    if (currentPath !== null) {
      points = currentPath.split(' ');
      // Slightly displacing each point
      for (let point of points) {
        const xAndY = point.split(',', 2);
        xAndY[0] = (parseFloat(xAndY[0]) + 10) as unknown as string;
        xAndY[1] = (parseFloat(xAndY[1]) + 10) as unknown as string;
        point = '' + xAndY[0] + ',' + xAndY[1];
      }
      const newItem =
        `<polyline id="line${this.currentPolylineNumber}"
        stroke-width="${strokeWidth}" stroke-linecap="${linecap}"
        stroke="${color2}" stroke-dasharray="${dasharray}"
        fill="none" stroke-linejoin="${linejoin}"
        points="${points}"></polyline>`;
      this.currentPolylineNumber++;
      return newItem;
    } else {
      console.log('cannot recognize "d" in html of ' + item.id);
      return 'to discard';
    }
  }
}
