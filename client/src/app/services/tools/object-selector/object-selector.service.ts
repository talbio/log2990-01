import {Injectable} from '@angular/core';
import {Colors} from 'src/app/data-structures/colors';
import {Command, CommandGenerator} from '../../../data-structures/command';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

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

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private mouseDownSelector: boolean;
  private mouseDownTranslation: boolean;
  private currentRect: Element;
  private SVGArray: SVGElement[] = [];
  private isSelectorVisible: boolean;
  private initialX: number;
  private initialY: number;

  /**
   * @desc: the first Position is the position of the element
   * before the translation and the second Position is after the translation.
   */
  private readonly initialAndFinalPositions: Map<SVGElement, [InitialPosition, FinalPosition]>;

  constructor(private undoRedoService: UndoRedoService) {
    this.mouseDownSelector = false;
    this.initialAndFinalPositions = new Map<SVGElement, [InitialPosition, FinalPosition]>();
  }

  createSelectorRectangle(mouseEvent: MouseEvent, canvas: SVGElement) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      `<rect id="selector"
            x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
            data-start-x = "${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
            y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
            data-start-y = "${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
            width = "0" height = "0" stroke="${STROKE_COLOR}" stroke-dasharray = "${DASHED_LINE_VALUE}"
            fill="transparent"></rect>`;
    this.mouseDownSelector = true;
  }

  updateSelectorRectangle(mouseEvent: MouseEvent, canvas: SVGElement) {

    if (this.mouseDownSelector) {
      this.currentRect = canvas.querySelector('#selector') as Element;
      if (this.currentRect != null) {
        this.isSelectorVisible = true;
        const startRectX: number = Number(this.currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(this.currentRect.getAttribute('data-start-y'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY;
        if (actualWidth >= 0) {
          this.currentRect.setAttribute('width', '' + actualWidth);
        } else {
          this.currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          this.currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if (actualHeight >= 0) {
          this.currentRect.setAttribute('height', '' + actualHeight);
        } else {
          this.currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          this.currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
      }
      this.selectItems(canvas);
    }
  }

  selectItems(canvas: SVGElement): void {
    const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
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
    const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    const tempArray = new Array();
    drawings.forEach((drawing) => {
      if ((drawing.id !== 'selector') && (drawing.id !== 'backgroundGrid') && (drawing.id !== '')) {
        tempArray.push(drawing);
      }
    });
    this.SVGArray = tempArray;
    // not quite working
    // this.addToGroup(canvas);
  }

  intersects(a: DOMRect): boolean {
    const b = this.currentRect.getBoundingClientRect();
    return !((a.left > b.right ||
      b.left > a.right) ||
      (a.top > b.bottom ||
        b.top > a.bottom));
  }

  finishSelector(canvas: SVGElement): void {
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
    const group = document.querySelector('#box');
    const box = (group as Element).getBoundingClientRect();
    this.initialX = box.left;
    this.initialY = box.top;
    const selected = RendererSingleton.canvas.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    childArray.forEach((child: SVGElement) => {
      const initialPosition: InitialPosition = {
        xPos: child.getAttribute('x') as string, yPos: child.getAttribute('y') as string,
      };
      this.initialAndFinalPositions.set(child, [initialPosition, {xPos: '0', yPos: '0'}]);
    });
  }

  translate(mouseEvent: MouseEvent): void {
    if (this.mouseDownTranslation) {
      const group = document.querySelector('#box');
      const box = (group as Element).getBoundingClientRect();
      (group as Element).setAttribute('x', '' + (mouseEvent.x - this.initialX - (box.width / 2)));
      (group as Element).setAttribute('y', '' + (mouseEvent.y - this.initialY - (box.height / 2)));
    }
  }

  drop() {
    const selected = RendererSingleton.canvas.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    childArray.forEach((child: SVGElement) => {
      const initialPosition: InitialPosition = (this.initialAndFinalPositions.get(child) as [InitialPosition, FinalPosition])[0];
      const finalPosition: FinalPosition = {
        xPos: child.getAttribute('x') as string,
        yPos: child.getAttribute('y') as string,
      };
      console.log(child);
      console.log(initialPosition);
      console.log(finalPosition);
      this.initialAndFinalPositions.set(child, [initialPosition, finalPosition]);
    });
    this.pushTranslationCommand(this.initialAndFinalPositions);
    const groupElement = document.querySelector('#box') as SVGGElement;
    groupElement.setAttributeNS(null, 'onmousemove', 'null');
    this.mouseDownTranslation = false;
  }

  pushTranslationCommand(initialAndFinalPositions: Map<SVGElement, [InitialPosition, FinalPosition]>): void {
    const command: Command = {
      execute(): void {
        initialAndFinalPositions.forEach(
          ((positions: [InitialPosition, FinalPosition], element: SVGElement) => {
              console.log(element);
              element.setAttribute('x', positions[1].xPos);
              element.setAttribute('y', positions[1].yPos);
          }));
      },
      unexecute(): void {
        initialAndFinalPositions.forEach(
          ((positions: [InitialPosition, FinalPosition], element: SVGElement) => {
            console.log(element);
            element.setAttribute('x', positions[0].xPos);
            element.setAttribute('y', positions[0].yPos);
          }));
      },
    };
    this.pushCommand(command);
  }

  pushCommand(command: Command): void {
    this.undoRedoService.pushCommand(command);
  }
}
