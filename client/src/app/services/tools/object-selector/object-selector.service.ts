import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { Command, CommandGenerator } from '../../../data-structures/command';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';

const DASHED_LINE_VALUE = 5;
const STROKE_COLOR = Colors.BLACK;

interface InitialPosition {
  xPos: string;
  yPos: string;
}

interface FinalPosition {
  xPos: string;
  yPos: string;
}

@Injectable()
export class ObjectSelectorService implements CommandGenerator {

  private mouseDownSelector: boolean;
  private mouseDownTranslation: boolean;
  private currentRect: Element;
  SVGArray: SVGElement[] = [];
  private isSelectorVisible: boolean;
  private initialX: number;
  private initialY: number;
  private hasBeenTranslated: boolean;
  private hasActiveSelection: boolean;

  /**
   * @desc: the first Position is the position of the element
   * before the translation and the second Position is after the translation.
   */
  private readonly initialAndFinalPositions: Map<SVGElement, [InitialPosition, FinalPosition]>;

  constructor(private undoRedoService: UndoRedoService,
              private mousePosition: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService) {
    this.hasActiveSelection = false;
    this.mouseDownSelector = false;
    this.hasBeenTranslated = false;
    this.initialAndFinalPositions = new Map<SVGElement, [InitialPosition, FinalPosition]>();
  }

  get boxRect(): SVGGElement {
    return RendererSingleton.canvas.querySelector('#boxrect') as SVGGElement;
  }


  onMouseDown(xPosition: number, yPosition: number, mouseEvent: MouseEvent) {
    // if there is already a selection
    if (this.hasActiveSelection) {
      // if the mouse is outside the selection
      if (this.isMouseOutsideOfBox()) {
        this.removeSelector();
        this.rectangleGenerator.createTemporaryRectangle(xPosition, yPosition, 'selector', this.rectangleGenerator);
      } else {
        this.startTranslation();
      }
    } else {
      this.rectangleGenerator.createTemporaryRectangle(xPosition, yPosition, 'selector', this.rectangleGenerator);
    }
  }

  isMouseOutsideOfBox(): boolean {
    const box = this.boxRect.getBBox();
    return this.mousePosition.canvasMousePositionX < box.x ||
      this.mousePosition.canvasMousePositionX > (box.x + box.width) ||
      this.mousePosition.canvasMousePositionY < box.y ||
      this.mousePosition.canvasMousePositionY > (box.y + box.height);
  }

  createSelectorRectangle(mouseEvent: MouseEvent, canvas: SVGElement) {

    canvas.innerHTML +=
      `<rect id="selector"
            x="${this.mousePosition.canvasMousePositionX}"
            data-start-x = "${this.mousePosition.canvasMousePositionX}"
            y="${this.mousePosition.canvasMousePositionY}"
            data-start-y = "${this.mousePosition.canvasMousePositionY}"
            width = "0" height = "0" stroke="${STROKE_COLOR}" stroke-dasharray = "${DASHED_LINE_VALUE}"
            fill="transparent"></rect>`;
    this.mouseDownSelector = true;
  }

  updateSelector(xPosition: number, yPosition: number, currentChildPosition: number, mouseEvent: MouseEvent) {
    if (this.hasActiveSelection && !this.isMouseOutsideOfBox()) {
      this.translate(mouseEvent);
    } else {
      this.rectangleGenerator.updateElement(xPosition, yPosition, currentChildPosition, mouseEvent);
      this.selectItems();
    }
  }

  selectItems(): void {
    const drawings = RendererSingleton.canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    const tempArray = new Array();
    drawings.forEach((drawing) => {
      if ((this.intersects(drawing.getBoundingClientRect() as DOMRect)) && (drawing.id !== 'selector')
        && (drawing.id !== 'backgroundGrid') && (drawing.id !== '')) {
        tempArray.push(drawing);
      }
    });
    this.SVGArray = tempArray;
  }

  selectAll(canvas: SVGElement): void {
    if (!canvas.querySelector('#selected')) {
      const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
      const tempArray = new Array();
      drawings.forEach((drawing) => {
        if ((drawing.id !== 'selector') && (drawing.id !== 'backgroundGrid') && (drawing.id !== '')) {
          tempArray.push(drawing);
        }
      });
      this.SVGArray = tempArray;
      this.addToGroup(canvas);
    }
  }

  intersects(a: DOMRect): boolean {
    const b = this.currentRect.getBoundingClientRect();
    return !((a.left > b.right ||
      b.left > a.right) ||
      (a.top > b.bottom ||
        b.top > a.bottom));
  }

  finish(canvas: SVGElement): void {
    if (!canvas.querySelector('#selected')) {
      this.finishSelection(canvas);
    } else { this.finishTranslation(); }
  }

  finishSelection(canvas: SVGElement): void {
    if (this.mouseDownSelector) {
      if (this.isSelectorVisible) {
        canvas.removeChild(this.currentRect);
        this.isSelectorVisible = false;
        if (this.SVGArray.length !== 0) {
          this.addToGroup(canvas);
        }
      }
    }
    this.mouseDownSelector = false;
  }

  addToGroup(canvas: SVGElement): void {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'selected');
    this.SVGArray.forEach((drawing) => {
      group.append(drawing);
    });
    canvas.append(group);
    const boxGroup = (group as SVGGElement).getBBox();
    canvas.innerHTML +=
      `<svg id="box">
        <defs><marker id="dot" viewBox="0 0 10 10" refX="5" refY="5"
        markerWidth="5" markerHeight="5">
        <circle cx="5" cy="5" r="20" fill="red" />
        </marker></defs>
        <polyline id="boxrect"
        points="${boxGroup.x},${boxGroup.y} ${boxGroup.x + (boxGroup.width / 2)},${boxGroup.y} ${boxGroup.x + boxGroup.width},${boxGroup.y}
        ${boxGroup.x + boxGroup.width},${boxGroup.y + (boxGroup.height / 2)} ${boxGroup.x + boxGroup.width},${boxGroup.y + boxGroup.height}
        ${boxGroup.x + (boxGroup.width / 2)},${boxGroup.y + boxGroup.height} ${boxGroup.x},${boxGroup.y + boxGroup.height}
         ${boxGroup.x},${boxGroup.y + (boxGroup.height / 2)} ${boxGroup.x},${boxGroup.y}"
        stroke="${STROKE_COLOR}" fill="transparent"
        marker-start="url(#dot)" marker-mid="url(#dot)">
        </polyline></svg>`;
    const box = canvas.querySelector('#box') as SVGGElement;
    box.append(group);
    const selected = canvas.querySelector('#selected') as SVGGElement;
    canvas.removeChild(selected);
  }

  startTranslation(): void {
    this.mouseDownTranslation = true;
    const boxClientRect = (this.box as Element).getBoundingClientRect();
    this.initialX = boxClientRect.left;
    this.initialY = boxClientRect.top;
    this.setInitialCoordinates(this.boxRect);
    const childArray = Array.from(this.selectedElements.children);
    childArray.forEach((child: SVGElement) => {
     this.setInitialCoordinates(child);
    });
  }

setInitialCoordinates( svgElement: SVGElement){
  const initialPosition: InitialPosition = {
    xPos: '0', yPos: '0',
  };
  if (svgElement.getAttribute('transform')) {
    const translationValues: number[] = this.getTranslationValue(svgElement);
    initialPosition.xPos = (parseFloat(initialPosition.xPos) + translationValues[0]).toString();
    initialPosition.yPos = (parseFloat(initialPosition.yPos) + translationValues[1]).toString();
  }
  this.initialAndFinalPositions.set(svgElement, [initialPosition, {xPos: '0', yPos: '0'}]);
  console.log(svgElement.getAttribute('transform'));
}

  translate(mouseEvent: MouseEvent): void {
    if (this.mouseDownTranslation) {
      const boxClientRect = this.box.getBoundingClientRect();
      this.box.setAttribute('x', '' + (mouseEvent.x - this.initialX - (boxClientRect.width / 2)));
      this.box.setAttribute('y', '' + (mouseEvent.y - this.initialY - (boxClientRect.height / 2)));
      this.hasBeenTranslated = true;
    }
  }

  finishTranslation() {
    const groupElement = RendererSingleton.canvas.querySelector('#box') as SVGGElement;
    groupElement.setAttributeNS(null, 'onmousemove', 'null');
    const box = RendererSingleton.canvas.querySelector('#box') as SVGElement;
    const selected = RendererSingleton.canvas.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    const boxRect = RendererSingleton.canvas.querySelector('#boxrect') as SVGElement;
    if (this.hasBeenTranslated) {
      childArray.forEach((child: SVGElement) => {
        this.translateChild(child, box);
        RendererSingleton.canvas.appendChild(child);
      });
      this.translateChild(boxRect, box);
      RendererSingleton.canvas.appendChild(boxRect);
    }
    this.mouseDownTranslation = false;
    childArray.forEach((child: SVGElement) => {
      this.setFinalCoordinates(child);
    });
    this.setFinalCoordinates(boxRect);
    this.pushTranslationCommand(this.initialAndFinalPositions, box);
  }

  setFinalCoordinates(svgElement: SVGElement): void{
    const initialPosition: InitialPosition = (this.initialAndFinalPositions.get(svgElement) as [InitialPosition, FinalPosition])[0];
    const translationValues: number[] = this.getTranslationValue(svgElement);
    const finalPosition: FinalPosition = {
      xPos: translationValues[0].toString(),
      yPos: translationValues[1].toString(),
    };
    this.initialAndFinalPositions.set(svgElement, [initialPosition, finalPosition]);
  }

  translateChild(child: SVGElement, box: SVGElement): void {
    let newX: number;
    let newY: number;
    const initialPosition = this.getTranslationValue(child);
    if (this.getTranslationValue(child)) {
      newX = parseFloat('' + (initialPosition[0] + parseFloat(box.getAttribute('x') as string)));
      newY = parseFloat('' + (initialPosition[1] + parseFloat(box.getAttribute('y') as string)));
    } else {
      newX = parseFloat('' + box.getAttribute('x'));
      newY = parseFloat('' + box.getAttribute('y'));
    }
    child.setAttribute('transform', 'translate(' + newX + ' ' + newY + ')');
  }

  getTranslationValue(child: SVGElement): number[] {
    const initialPosition = new Array<number>();
    const xforms = child.getAttribute('transform');
    const parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms as string) as unknown as string;
    if (parts) {
      initialPosition[0] = parseFloat(parts[1]);
      initialPosition[1] = parseFloat(parts[2]);
    } else {
      initialPosition[0] = 0;
      initialPosition[1] = 0; }
    return initialPosition;
  }

  get box(): SVGElement {
    return RendererSingleton.canvas.querySelector('#boxrect') as SVGElement;
  }

  get selectedElements(): SVGElement {
    return this.box.querySelector('#selected') as SVGGElement;
  }

  removeSelector(canvas: SVGElement): void {
    canvas.removeChild(this.boxRect);
    canvas.removeChild(this.box);
    if (this.selectedElements) {
      const childArray = Array.from(this.selectedElements.children);
      childArray.forEach((child: SVGElement) => {
        RendererSingleton.canvas.appendChild(child);
      });
    }
    canvas.removeChild(this.selectedElements);
  }

  pushTranslationCommand(initialAndFinalPositions: Map<SVGElement, [InitialPosition, FinalPosition]>, box: SVGElement): void {
    // const selected = RendererSingleton.canvas.querySelector('#selected') as SVGGElement;
    // const childArray = Array.from(selected.children);
    const command: Command = {
      execute(): void {
        initialAndFinalPositions.forEach(
          ((positions: [InitialPosition, FinalPosition], element: SVGElement) => {
            element.setAttribute('transform', 'translate(' + positions[1].xPos + ' ' + positions[1].yPos + ')');
          }));
      },
      unexecute(): void {
        initialAndFinalPositions.forEach(
          ((positions: [InitialPosition, FinalPosition], element: SVGElement) => {
            element.setAttribute('transform', 'translate(' + positions[0].xPos + ' ' + positions[0].yPos + ')');
            console.log(element.getAttribute('transform'));
          }));
      },
    };
    this.pushCommand(command);
  }

  pushCommand(command: Command): void {
    this.undoRedoService.pushCommand(command);
  }
}
