import { Injectable } from '@angular/core';
import { Command } from '../../../data-structures/command';
import { RendererSingleton } from '../../renderer-singleton';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { EllipseGeneratorService } from '../ellipse-generator/ellipse-generator.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import { PenGeneratorService } from '../pen-generator/pen-generator.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import { UndoRedoService } from './../../undo-redo/undo-redo.service';

@Injectable()
export class ClipboardService {

  memorizedElements: SVGElement[];
  selectedItems: SVGElement[];
  newItems: SVGElement[];
  private xSliding: number;
  private ySliding: number;
  private sideImpacts: boolean[];

  constructor(private selector: ObjectSelectorService,
              private ellipseGenerator: EllipseGeneratorService,
              private lineGenerator: LineGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private penGenerator: PenGeneratorService,
              private polygonGenerator: PolygonGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private emojiGenerator: EmojiGeneratorService,
              private rectangleGenerator: RectangleGeneratorService,
              private undoRedo: UndoRedoService) {
    this.selectedItems = [];
    this.memorizedElements = [];
    this.sideImpacts = [false, false];
    this.newItems = [];
  }

  assessSelection() {
    if (this.selectedItems !== this.selector.selectedElements) {
      this.resetCounters();
    }
    this.selectedItems = this.selector.selectedElements;
  }

  // slide(item: SVGElement, consecultive: number) {
  //   const transformation = item.getAttribute('transform');
  //   let newTransform = '';
  //   let foundTranslate = false;
  //   const slides = this.getSlideLength(item, consecultive);
  //   if (transformation === null) {
  //     newTransform = 'translate(' + slides[0] + ' ' + slides[1] + ')';
  //   } else if (!transformation.includes('translate')) {
  //     newTransform = 'translate(' + slides[0] as unknown as string + ' ' + slides[1] as unknown as string + ') ';
  //     newTransform += transformation;

  //   } else {
  //     const eachTrans = transformation.split(' ');
  //     for (const slot of eachTrans) {
  //       if (slot.includes('translate(')) {
  //         const xCord = slot.split('(', 2);
  //         xCord[1] = (parseFloat(xCord[1]) + slides[0]) as unknown as string;
  //         foundTranslate = true;
  //         newTransform += 'translate(' + xCord[1] + ' ';
  //       } else if (foundTranslate) {
  //         const yCord = slot.split(')');
  //         yCord[0] = (parseFloat(yCord[0]) + slides[1]) as unknown as string;
  //         newTransform += yCord[0] + ') ';
  //       } else {
  //         newTransform += slot + ' ';
  //       }
  //     }
  //   }
  //   item.setAttribute('transform', newTransform);
  // }

  // getSlideLength(item: SVGElement, consecultive: number): [number, number] {
  //   const slideLength = 5 * (consecultive);
  //   this.isOutside(item, slideLength);
  //   return [(slideLength - this.xSliding), (slideLength - this.ySliding)];
  // }

  // isOutside(item: SVGElement, consecultive: number) {
  //   const clientRect = item.getBoundingClientRect();
  //   if (clientRect.right + consecultive > RendererSingleton.canvas.getBoundingClientRect().right) {
  //     // this.xSliding = this.xSliding + 10;
  //     this.xSliding = this.xSliding + 5;
  //   }

  //   if (clientRect.bottom + consecultive > RendererSingleton.canvas.getBoundingClientRect().bottom) {
  //     // this.ySliding = this.ySliding + 10;
  //     this.ySliding = this.ySliding + 5;
  //   }
  // }

  slide(item: SVGElement) {
    const transformation = item.getAttribute('transform');
    let newTransform = '';
    let foundTranslate = false;
    this.getSlideLength(item);
    if (transformation === null) {
      newTransform = 'translate(' + this.xSliding + ' ' + this.ySliding + ')';
    } else if (!transformation.includes('translate')) {
      newTransform = 'translate(' + this.xSliding + ' ' + this.ySliding + ') ';
      newTransform += transformation;
    } else {
      const eachTrans = transformation.split(' ');
      for (const slot of eachTrans) {
        if (slot.includes('translate(')) {
          const xCord = slot.split('(', 2);
          xCord[1] = (parseFloat(xCord[1]) + this.xSliding) as unknown as string;
          foundTranslate = true;
          newTransform += 'translate(' + xCord[1] + ' ';
        } else if (foundTranslate) {
          const yCord = slot.split(')');
          yCord[0] = (parseFloat(yCord[0]) + this.ySliding) as unknown as string;
          newTransform += yCord[0] + ') ';
        } else {
          newTransform += slot + ' ';
        }
      }
    }
    item.setAttribute('transform', newTransform);
  }

  getSlideLength(item: SVGElement) {
    this.isOutside(item);
    if (this.sideImpacts[0]) {
      this.xSliding -= 5;
    } else {
      this.xSliding += 5;
    }
    this.isOutside(item);
    if (this.sideImpacts[1]) {
      this.ySliding -= 5;
    } else {
      this.ySliding += 5;
    }
  }

  isOutside(item: SVGElement) {
    const clientRect = item.getBoundingClientRect();
    if (this.sideImpacts[0]) {
      if (clientRect.left + this.xSliding - 5 < RendererSingleton.canvas.getBoundingClientRect().left) {
        this.sideImpacts[0] = false;
      }
    } else {
      if (clientRect.right + this.xSliding + 5 > RendererSingleton.canvas.getBoundingClientRect().right) {
        this.sideImpacts[0] = true;
      }
    }
    if (this.sideImpacts[1]) {
      if (clientRect.top + this.ySliding - 5 < RendererSingleton.canvas.getBoundingClientRect().top) {
        this.sideImpacts[1] = false;
      }
    } else {
      if (clientRect.bottom + this.ySliding + 5 > RendererSingleton.canvas.getBoundingClientRect().bottom) {
        this.sideImpacts[1] = true;
      }
    }
  }

  resetCounters() {
    // this.consecutiveDuplicates = 1;
    // this.consecutivePastes = 1;
    this.xSliding = 0;
    this.ySliding = 0;
  }

  clone(item: SVGElement): SVGElement {
    const type = item.tagName;
    const newItem = item.cloneNode() as SVGElement;
    switch (type) {
      case 'rect':
        newItem.setAttribute('id', type + (this.rectangleGenerator.currentElementsNumber++ as unknown as string));
        break;
      case 'ellipse':
        newItem.setAttribute('id', type + (this.ellipseGenerator.currentElementsNumber++ as unknown as string));
        break;
      case 'polygon':
        newItem.setAttribute('id', type + (this.polygonGenerator.currentElementsNumber++ as unknown as string));
        break;
      case 'path':
        if (item.id.includes('brushPath')) {
          newItem.setAttribute('id', 'brushPath' + (this.brushGenerator.currentElementsNumber++ as unknown as string));
          break;
        } else if (item.id.includes('pencilPath')) {
          newItem.setAttribute('id', 'pencilPath' + (this.pencilGenerator.currentElementsNumber++ as unknown as string));
          break;
        } else {
          newItem.setAttribute('id', 'penPath' + (this.penGenerator.currentElementsNumber++ as unknown as string));
          break;
        }
        case 'polyline':
        newItem.setAttribute('id', type + (this.lineGenerator.currentElementsNumber++ as unknown as string));
        break;
        case 'image':
        newItem.setAttribute('id', type + (this.emojiGenerator.currentElementsNumber++ as unknown as string));
        break;
        default :
        break;
    }
    return newItem;
  }

  // Removes and stores in clipboard
  cut() {
    this.resetCounters();
    this.assessSelection();
    if (this.selectedItems.length === 0) {
      return;
    }
    this.memorizedElements = this.selectedItems;
    for (const item of this.selectedItems) {
      RendererSingleton.canvas.removeChild(item);
    }
    this.selector.removeBoundingRect();
    this.selector.selectedElements = [];
    this.pushCutCommand(this.selectedItems);
  }

  // Stores in clipboard
  copy() {
    this.resetCounters();
    this.assessSelection();
    if (this.selector.selectedElements !== null) {
      this.memorizedElements = this.selectedItems;
    }
  }

  // Appends clipboard to canvas
  paste() {
    const clonedItems: SVGElement[] = [];
    this.memorizedElements.forEach((memorizedElement: SVGElement) => {
      const clonedElement = this.clone(memorizedElement);
      RendererSingleton.canvas.appendChild(clonedElement);
      this.slide(clonedElement);
      clonedItems.push(clonedElement);
    });
    this.pushPasteCommand(clonedItems);
  }

  // Appends a displaced version of the selected items
  duplicate() {
    this.assessSelection();
    const clonedItems: SVGElement[] = [];
    this.selectedItems.forEach((selectedItem: SVGElement) => {
      const newItem = this.clone(selectedItem);
      RendererSingleton.canvas.appendChild(newItem);
      this.slide(newItem);
      clonedItems.push(newItem);
    });
    this.pushPasteCommand(clonedItems);
  }

  // Removes the selected items
  delete() {
    this.resetCounters();
    this.assessSelection();
    if (this.selectedItems.length === 0) {
      return;
    }
    for (const item of this.selector.selectedElements) {
      RendererSingleton.canvas.removeChild(item);
    }
    this.selector.removeBoundingRect();
    this.selector.selectedElements = [];

    this.pushCutCommand(this.selectedItems);
  }

  pushPasteCommand(svgElements: SVGElement[]): void {
    const command: Command = {
      execute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.renderer.appendChild(RendererSingleton.canvas, svgElement));
      },
      unexecute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.canvas.removeChild(svgElement));
      },
    };
    this.undoRedo.pushCommand(command);
  }

  pushCutCommand(svgElements: SVGElement[]): void {
    const command: Command = {
      execute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.canvas.removeChild(svgElement));
        },
      unexecute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.canvas.appendChild(svgElement));
      },
    };
    this.undoRedo.pushCommand(command);
  }
}
