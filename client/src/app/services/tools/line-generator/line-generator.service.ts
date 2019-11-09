import { Injectable } from '@angular/core';
import { LineDashStyle, LineJoinStyle } from 'src/app/data-structures/line-styles';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class LineGeneratorService extends AbstractGenerator {

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
  private isMakingLine = false;
  private currentPolyineStartX: number;
  private currentPolyineStartY: number;
  private isMarkersActive: boolean;
  private lineJoin: string;
  private dashArray: string;
  private lineCap: string;
  private lineJoinStyle: LineJoinStyle;
  private lineDashStyle: LineDashStyle;

  constructor(private mousePosition: MousePositionService,
              protected undoRedoService: UndoRedoService) {
    super(mousePosition, undoRedoService);
    this.strokeWidth = this.DEFAULT_WIDTH;
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

  // Initializes the path
  createElement(primaryColor: string) {
    if (!this.isMakingLine) {
      // Initiate the line
      const polyline: SVGElement = RendererSingleton.renderer.createElement('polyline', 'svg');
      RendererSingleton.renderer.setAttribute(polyline, 'id', `line${this.currentElementsNumber}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-width', `${this.strokeWidth}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-linecap', `${this.lineCap}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke', `${primaryColor}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-dasharray', `${this.dashArray}`);
      RendererSingleton.renderer.setAttribute(polyline, 'fill', `none`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-linejoin', `${this.lineJoin}`);
      RendererSingleton.renderer.setAttribute(polyline, 'points', `${this.xPos},${this.yPos}`);
      RendererSingleton.renderer.appendChild(RendererSingleton.canvas, polyline);

      this.currentElement = polyline;
      this.createMarkers(primaryColor);
      this.isMakingLine = true;
      this.currentPolyineStartX = this.xPos;
      this.currentPolyineStartY = this.yPos;

    } else {
      this.addPointToCurrentLine();
    }
  }

  addPointToCurrentLine() {
    if (!this.isMakingLine) {
      return;
    }
    const newPoint = ` ${this.xPos},${this.yPos}`;
    this.currentElement.setAttribute('points', this.currentElement.getAttribute('points') + newPoint);
  }

  updateElement(currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = RendererSingleton.canvas.children[currentChildPosition - 1];
      let pointsStr = currentPolyLine.getAttribute('points') as string;
      let indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // There is only one point, add a second to enable the update
        this.addPointToCurrentLine();
        // There will be a splace since we added a point
        pointsStr = currentPolyLine.getAttribute('points') as string;
        indexLastPoint = pointsStr.lastIndexOf(' ');
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      const newPoints = `${pointsWithoutLastStr} ${this.xPos},${this.yPos}`;
      currentPolyLine.setAttribute('points', newPoints);
    }
  }

  finishElement(mouseEvent: MouseEvent) {
    if (mouseEvent.shiftKey) {
      this.finishAndLinkLineBlock();
    } else {
      this.finishLineBlock();
    }
    this.pushGeneratorCommand(this.currentElement);
  }
  finishLineBlock() {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine();
      this.deleteLine();
      this.currentElementsNumber += 1;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock() {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine();
      this.deleteLine();
      const newPoint = ` ${this.currentPolyineStartX},${this.currentPolyineStartY}`;
      this.currentElement.setAttribute('points', this.currentElement.getAttribute('points') + newPoint);
      this.currentElementsNumber += 1;
      this.isMakingLine = false;
    }
  }
  deleteLineBlock(canvas: SVGElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      currentPolyLine.remove();
      this.currentElementsNumber -= 1;
      this.isMakingLine = false;
    }
  }
  deleteLine() {
    if (this.isMakingLine) {
      const pointsStr = this.currentElement.getAttribute('points') as string;
      const indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // Only one point, user never moved after creating the line
        return;
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      this.currentElement.setAttribute('points', pointsWithoutLastStr);
    }
  }

  // This function creates a marker tag with the color and the id of the polyline and returns a string for the URL
  createMarkers(color: string): SVGElement {
    const marker = RendererSingleton.renderer.createElement('marker', 'svg');
    const circle = RendererSingleton.renderer.createElement('circle', 'svg');

    RendererSingleton.renderer.setAttribute(circle, 'fill', color);
    RendererSingleton.renderer.setAttribute(circle, 'r', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(circle, 'cy', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(circle, 'cx', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerWidth', (this.markerDiameter * 2) as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerHeight', (this.markerDiameter * 2) as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'refX', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'refY', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerUnits', 'userSpaceOnUse');
    RendererSingleton.renderer.setProperty(marker, 'id', `line${this.currentElementsNumber}marker`);

    RendererSingleton.renderer.appendChild(marker, circle);
    const defs = RendererSingleton.renderer.selectRootElement('#definitions', true);
    const canvas = RendererSingleton.renderer.selectRootElement('#canvas', true);
    RendererSingleton.renderer.appendChild(defs, marker);
    if (this.isMarkersActive) {
      this.addMarkersToNewLine(marker, canvas);
    }
    // reload
    // canvas.innerHTML = canvas.innerHTML;
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
}
