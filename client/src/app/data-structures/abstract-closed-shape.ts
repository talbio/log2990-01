import {RendererSingleton} from '../services/renderer-singleton';
import {RectangleGeneratorService} from '../services/tools/rectangle-generator/rectangle-generator.service';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {AbstractGenerator} from './abstract-generator';
import {PlotType} from './plot-type';

export abstract class AbstractClosedShape extends AbstractGenerator {

  protected plotType: PlotType;
  protected strokeWidth: number;

  protected OFFSET_CANVAS_Y: number;
  protected OFFSET_CANVAS_X: number;

  protected mouseDown: boolean;

  protected constructor(protected undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.mouseDown = false;
  }

  abstract createElement(mouseEvent: MouseEvent, primaryColor: string, secondaryColor: string): void;
  abstract updateElement(canvasPosX: number, canvasPosY: number, currentChildPosition: number, mouseEvent?: MouseEvent): void;
  abstract finishElement(): void;

  createTemporaryRectangle(mouseEvent: MouseEvent, rectangleGenerator: RectangleGeneratorService) {
    rectangleGenerator._plotType = PlotType.Contour;
    rectangleGenerator.createElement(mouseEvent, 'black', 'black');
    RendererSingleton.canvas.children[RendererSingleton.canvas.children.length - 1].id = 'tempRect';
    RendererSingleton.canvas.children[RendererSingleton.canvas.children.length - 1].setAttribute('stroke-dasharray', '4');
  }

  drawElement(element: SVGElement, properties: [string, string][], primaryColor: string, secondaryColor: string): void {
    this.setProperties(element, properties);
    this.setStrokeFillProperties(element, primaryColor, secondaryColor);
    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, element);
    this.currentElement = element;
  }

  private setStrokeFillProperties(element: SVGElement, primaryColor: string, secondaryColor: string): void {
    let stroke = '';
    let fill = '';
    switch (this.plotType) {
      case PlotType.Contour:
        stroke = secondaryColor;
        fill = 'transparent';
        break;
      case PlotType.Full:
        stroke = 'transparent';
        fill = primaryColor;
        break;
      case PlotType.FullWithContour:
        stroke = secondaryColor;
        fill = primaryColor;
        break;
    }
    RendererSingleton.renderer.setAttribute(element, 'stroke', `${stroke}`);
    RendererSingleton.renderer.setAttribute(element, 'stroke-width', `${this.strokeWidth}`);
    RendererSingleton.renderer.setAttribute(element, 'fill', `${fill}`);
  }

  private setProperties(element: SVGElement, properties: [string, string][]): void {
    for (const property of properties) {
      RendererSingleton.renderer.setAttribute(element, property[0], property[1]);
    }
  }
}
