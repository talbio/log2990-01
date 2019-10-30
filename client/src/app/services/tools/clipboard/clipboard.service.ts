import { Injectable, Renderer2 } from '@angular/core';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../polygon-generator/polygon-generator.service';
import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
import { ObjectSelectorService } from './../object-selector/object-selector.service';
import { RectangleGeneratorService } from './../rectangle-generator/rectangle-generator.service';

@Injectable()
export class ClipboardService {

  private memorizedAction: SVGElement[];
  private selectedItems: SVGElement[];
  private canvas: SVGElement;
  private consecultivePastes: number;
  private consecultiveDuplicates: number;

  isSelecting: boolean;

  constructor(private selector: ObjectSelectorService,
              private renderer: Renderer2,
              private rectangleGenerator: RectangleGeneratorService,
              private ellipseGenerator: EllipseGeneratorService,
              private emojiGenerator: EmojiGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private lineGenerator: LineGeneratorService,
              private polygonGenerator: PolygonGeneratorService) {
    this.isSelecting = false;
    this.consecultivePastes = 0;
  }

  // Removes and stores in clipboard
  cut() {
    this.resetCounters();
    this.assessSelection();
    this.memorizedAction = this.selector.SVGArray;
    for (const item of this.selectedItems) {
      const index = this.findChildIndex(item);
      if (index === -1) {
        console.log('cannot cut item ' + item.id);
      }
      this.canvas.removeChild(this.canvas.children[index]);
    }
  }

  // Stores in clipboard
  copy() {
    this.resetCounters();
    this.assessSelection();
    if (this.selector.SVGArray !== null) {
      this.memorizedAction = this.selector.SVGArray;
    } else {
      console.log('nothing to copy, nothing selected');
    }
  }

  // Appends clipboard to canvas
  paste() {
    if (this.canvas !== null) {
      for (const item of this.memorizedAction) {
        const index = this.findChildIndex(item);
        this.canvas.innerHTML += this.duplicateElement(index, this.consecultivePastes);
        this.consecultivePastes++;
      }
    } else {
      console.log('nothing to paste, clipboard is empty');
    }
  }

  // Appends a displaced version of the selected items
  duplicate() {
    this.assessSelection();
    for (const item of this.selectedItems) {
      const index = this.findChildIndex(item);
      if (index === -1) {
        console.log('cannot duplicate item ' + item.id);
      } else {
        this.canvas.innerHTML += this.duplicateElement(index, this.consecultiveDuplicates);
        this.consecultiveDuplicates++;
      }
    }
  }

  // Removes the selected items
  delete() {
    this.resetCounters();
    this.assessSelection();
    for (const item of this.selectedItems) {
      this.canvas.removeChild(this.canvas.children[this.findChildIndex(item)]);
    }
  }

  assessSelection() {
    this.canvas = this.renderer.selectRootElement('#canvas', true);
    this.selectedItems = this.selector.SVGArray;
  }

  findChildIndex(item: SVGElement): number {
    const id = item.id;
    const list = this.canvas.children;
    for (let i = 0 ; i < this.canvas.children.length ; i++) {
      if (list[i].getAttribute('id') === id) { return i; }
    }
    console.log('cannot get item in canvas for ' + item.id);
    return -1;
  }

  /*
  isOutside(x: number, y: number): boolean {
    if (x > 1080 || y > 700) {
      return true;
    } else {
      return false;
    }
  }*/

  duplicateElement(index: number, consecultive: number): SVGElement {
    const item = this.canvas.children[index] as SVGElement;
    const type = item.tagName;
    let newItem: SVGElement = new SVGElement();
    switch (type) {
      case 'rect':
        newItem = this.rectangleGenerator.clone(item);
        break;
      case 'ellipse':
        newItem = this.ellipseGenerator.clone(item);
        break;
      case 'polygon':
        newItem = this.polygonGenerator.clone(item);
        break;
      case 'path':
        if (item.id.includes('brushPath')) {
          newItem = this.brushGenerator.clone(item);
          break;
        } else {
          newItem = this.pencilGenerator.clone(item);
          break;
        }
      case 'polyline':
        newItem = this.lineGenerator.clone(item);
        break;
      case 'image':
        newItem = this.emojiGenerator.clone(item);
        break;
      default :
        console.log('cannot recognize tag ' + item.tagName + ', did not duplicate');
    }
    this.slide(newItem, consecultive);
    return newItem;
  }

  slide(item: SVGElement, consecultive: number) {
    const transformation = item.getAttribute('transform');
    let newTransform = '';
    let foundTranslate = false;
    const slides = this.getSlideSide(item, consecultive);
    if (transformation === null) {
      newTransform = 'translate(' + slides[0] + ' ' + slides[1] + ')';
    } else {
      const eachTrans = transformation.split(' ');
      for (const slot of eachTrans) {
        if (slot.includes('translate(')) {
          const xCord = slot.split('(', 2);
          xCord[1] = (parseFloat(xCord[1]) + slides[0]) as unknown as string;
          foundTranslate = true;
          newTransform += 'translate(' + xCord[1] + ' ';
        } else if (foundTranslate) {
          const yCord = slot.split(')');
          yCord[0] = (parseFloat(yCord[0]) + slides[1]) as unknown as string;
          newTransform += yCord[0] + ') ';
        } else {
          newTransform += slot + ' ';
        }
    }
    }
    item.setAttribute('transform', newTransform);
  }

  getSlideSide(item: SVGElement, consecultive: number): [number, number] {
    const bounderiesTouched: [boolean, boolean] = [false, false];
    const slideLength = 5 * consecultive;
    if (item.getBoundingClientRect().right > this.canvas.getBoundingClientRect().right - slideLength) { bounderiesTouched[0] = true; }
    if (item.getBoundingClientRect().bottom > this.canvas.getBoundingClientRect().bottom - slideLength) { bounderiesTouched[1] = true; }
    if (bounderiesTouched[0]) {
      if (bounderiesTouched[1]) {
        return [-slideLength, -slideLength];
      } else {
        return [-slideLength, slideLength];
      }
    } else {
      if (bounderiesTouched[1]) {
        return [slideLength, -slideLength];
      } else {
        return [slideLength, slideLength];
      }
    }
  }

  resetCounters() {
    this.consecultiveDuplicates = 0;
    this.consecultivePastes = 0;
  }
}
