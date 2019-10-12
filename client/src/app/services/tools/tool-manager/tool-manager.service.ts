import { Injectable, Renderer2 } from '@angular/core';
import { Tools } from '../../../data-structures/Tools';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
import { LineGeneratorService } from './../line-generator/line-generator.service';

@Injectable()
export class ToolManagerService {

  private numberOfElements = 1;
  private renderer: Renderer2;
  private canvasElement: HTMLElement;
  private activeTool: Tools;

  set _activeTool(tool: Tools) {
    this.activeTool = tool;
  }

  get _activeTool(): Tools {
    return this.activeTool;
  }

  constructor(private rectangleGenerator: RectangleGeneratorService,
    private ellipseGenerator: EllipseGeneratorService,
    private pencilGenerator: PencilGeneratorService,
    private brushGenerator: BrushGeneratorService,
    private colorApplicator: ColorApplicatorService,
    private objectSelector: ObjectSelectorService,
    private lineGenerator: LineGeneratorService,
    protected colorService: ColorService,
    protected mousePosition: MousePositionService) {
    this.activeTool = Tools.Pencil;
  }

  loadRenderer(renderer: Renderer2) {
    this.renderer = renderer;
  }

  createElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.createRectangle(mouseEvent, canvas,
          this.colorService.getSecondaryColor(), this.colorService.getPrimaryColor());
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPenPath(mouseEvent, canvas, this.colorService.getPrimaryColor());
        break;
      case Tools.Brush:
        this.brushGenerator.createBrushPath(mouseEvent, canvas);
        break;
      case Tools.Selector:
        this.objectSelector.createSelectorRectangle(mouseEvent, canvas);
        break;
      case Tools.Ellipse:
        this.ellipseGenerator.createEllipse(mouseEvent, canvas,
          this.colorService.getSecondaryColor(), this.colorService.getPrimaryColor());
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        if (mouseEvent.shiftKey) {
          this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        } else {
          this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        }
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Brush:
        this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Selector:
        this.objectSelector.updateSelectorRectangle(mouseEvent, canvas, this.numberOfElements);
        this.updateNumberOfElements();
        break;
      case Tools.Line:
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        break;
      case Tools.Ellipse:
        if (mouseEvent.shiftKey) {
          this.ellipseGenerator.updateCircle(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        } else {
          this.ellipseGenerator.updateEllipse(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        }
        break;
      default:
        return;
    }
  }

  finishElement() {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.finishRectangle();
        break;
      case Tools.Pencil:
        this.pencilGenerator.finishPenPath();
        break;
      case Tools.Brush:
        this.brushGenerator.finishBrushPath();
        break;
      case Tools.Selector:
        this.objectSelector.finishSelector(this.renderer.selectRootElement('#canvas', true));
        this.updateNumberOfElements();
        break;
      case Tools.Ellipse:
        this.ellipseGenerator.finishEllipse();
        break;
      default:
        return;
    }
  }

  changeElementLeftClick(clickedElement: HTMLElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(clickedElement, this.colorService.getPrimaryColor());
        break;
      default:
        return;
    }
  }

  createElementOnClick(mouseEvent: MouseEvent, canvas: HTMLElement) {
    switch (this._activeTool) {
      case Tools.Line:
        this.lineGenerator.makeLine(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.numberOfElements);
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  changeElementRightClick(clickedElement: HTMLElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changeSecondaryColor(clickedElement, this.colorService.getSecondaryColor());
        break;
      default:
        return;
    }
  }

  finishElementDoubleClick(mouseEvent: MouseEvent, canvas: HTMLElement) {
    if (this._activeTool === Tools.Line) {
      if (mouseEvent.shiftKey) {
        this.lineGenerator.finishAndLinkLineBlock(mouseEvent, canvas, this.numberOfElements);
      } else {
        this.lineGenerator.finishLineBlock();
      }
    }
  }

  changeElementShiftDown() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into square
        this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into circle
        this.ellipseGenerator.updateCircle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeElementShiftUp() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into rectangle
        this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into ellipse
        this.ellipseGenerator.updateEllipse(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  drawingNonEmpty(): boolean {
    return this.numberOfElements > 1;
  }

  deleteAllDrawings(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    for (let i = this.canvasElement.children.length - 1; i > 0; i--) {
      this.canvasElement.children[i].remove();
    }
    this.numberOfElements = 1;
  }

  updateNumberOfElements(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    this.numberOfElements = this.canvasElement.childNodes.length;
  }

  escapePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = this.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLineBlock(this.canvasElement, this.numberOfElements);
        this.numberOfElements = this.canvasElement.children.length;
        break;
      default:
        return;
    }
  }
  selectorLeftClick(): void {
    const selectorBox = this.canvasElement.querySelector('#boxrect') as SVGGElement;
    const box = selectorBox.getBBox();
    if (this.mousePosition._canvasMousePositionX < box.x || this.mousePosition._canvasMousePositionX > (box.x + box.width)
      || this.mousePosition._canvasMousePositionY < box.y || this.mousePosition._canvasMousePositionY > (box.y + box.height)) {
      this.removeSelector();
    // si il y a objet présent, inverser
    } else { this.objectSelector.startTranslation(); }
  }

  translate(mouseEvent: MouseEvent): void {
    this.objectSelector.translate(mouseEvent);
  }

  finishTranslation(): void {
    this.objectSelector.drop();
  }

  removeSelector(): void {
    const box = this.canvasElement.querySelector('#box') as Node;
    const boxrect = this.canvasElement.querySelector('#boxrect') as Node;
    const selected = this.canvasElement.querySelector('#selected') as SVGGElement;
    // tslint:disable-next-line: no-non-null-assertion
    const childArray = Array.from(selected!.childNodes);
    childArray.forEach((child) => {
      this.canvasElement.appendChild(child);
    });
    box.removeChild(boxrect);
    this.canvasElement.removeChild(box);
  }

  backSpacePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = this.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLine(this.canvasElement, this.numberOfElements);
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }
}
