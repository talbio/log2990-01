import { Injectable } from '@angular/core';
import { BrushGeneratorService } from 'src/app/services/tools/brush-generator/brush-generator.service';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
import { RendererSingleton } from '../../renderer-singleton';
import { EllipseGeneratorService } from '../ellipse-generator/ellipse-generator.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class ClipboardService {

  memorizedElements: SVGElement[];
  private selectedItems: SVGElement[];
  private consecutivePastes: number;
  private consecutiveDuplicates: number;
  private xSliding: number;
  private ySliding: number;

  constructor(private selector: ObjectSelectorService,
              private ellipseGenerator: EllipseGeneratorService,
              private lineGenerator: LineGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private penGenerator: PenGeneratorService,
              private polygonGenerator: PolygonGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private emojiGenerator: EmojiGeneratorService,
              private rectangleGenerator: RectangleGeneratorService) {
    this.consecutivePastes = 1;
    this.consecutiveDuplicates = 1;
  }

  // hasSelectedElements(): boolean {
  //   return this.selector.selectedElements.length === 0;
  // }

  // Removes and stores in clipboard
  cut() {
    this.resetCounters();
    this.assessSelection();
    this.memorizedElements = this.selectedItems;
    for (const item of this.memorizedElements) {
      const index = this.findChildIndex(item);
      if (index === -1) {
        console.log('cannot cut item ' + item.id);
        return;
      }
      this.selector.boundingRect.removeChild(item);
      console.log('removed ' + item.tagName);
    }
    this.removeSelector();
  }

  // Stores in clipboard
  copy() {
    this.resetCounters();
    this.assessSelection();
    if (this.selector.selectedElements !== null) {
      this.memorizedElements = this.selector.selectedElements;
      console.log(this.memorizedElements);
    } else {
      console.log('nothing to copy, nothing selected');
    }
  }

  // Appends clipboard to canvas
  paste() {
    if (RendererSingleton.canvas !== null) {
      for (const item of this.memorizedElements) {
        console.log('paste initiated');
        const newItem = this.duplicateElement(item);
        RendererSingleton.canvas.appendChild(newItem);
        const itemInCanvas = RendererSingleton.canvas.children[RendererSingleton.canvas.children.length - 1] as SVGElement;
        console.log(itemInCanvas, ' is new item in canvas');
        this.slide(itemInCanvas, this.consecutivePastes);
      }
      this.consecutivePastes++;
    } else {
      console.log('nothing to paste, clipboard is empty');
    }
  }

  // Appends a displaced version of the selected items
  duplicate() {
    this.assessSelection();
    for (const item of this.selector.selectedElements) {
      const newItem = this.duplicateElement(item);
      RendererSingleton.canvas.appendChild(newItem);
      const itemInCanvas = RendererSingleton.canvas.children[RendererSingleton.canvas.children.length - 1] as SVGElement;
      console.log(itemInCanvas, ' is new item in canvas');
      this.slide(itemInCanvas, this.consecutiveDuplicates);
    }
    this.consecutiveDuplicates++;
  }

  // Removes the selected items
  delete() {
    this.resetCounters();
    this.assessSelection();
    const box = RendererSingleton.renderer.selectRootElement('#selected', true);
    for (const item of this.selectedItems) {
      const index = this.findChildIndex(item);
      if (index === -1) {
        console.log('cannot cut item ' + item.id);
        return;
      }
      box.removeChild(item);
      console.log('removed ' + item.tagName);
    }
  }

  assessSelection() {
    if (this.selectedItems !== this.selector.selectedElements) {
      this.resetCounters();
    }
    this.selectedItems = this.selector.selectedElements;
  }

  findChildIndex(item: SVGElement): number {
    const id = item.id;
    const box = RendererSingleton.renderer.selectRootElement('#selected', true);
    const list = box.children;
    console.log(list);
    for (let i = 0 ; i < list.length ; i++) {
      if (list[i].getAttribute('id') === id) { return i; }
    }
    console.log('cannot get item in canvas for ' + item.id);
    return -1;
  }

  duplicateElement(item: SVGElement): SVGElement {
    const type = item.tagName;
    return this.clone(item, type);
  }

  slide(item: SVGElement, consecultive: number) {
    const transformation = item.getAttribute('transform');
    let newTransform = '';
    let foundTranslate = false;
    const slides = this.getSlideSide(item, consecultive);
    if (transformation === null) {
      newTransform = 'translate(' + slides[0] + ' ' + slides[1] + ')';
    } else if (!transformation.includes('translate')) {
      console.log('emoji found');
      newTransform = 'translate(' + slides[0] as unknown as string + ' ' + slides[1] as unknown as string + ') ';
      newTransform += transformation;
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
    const slideLength = 3 * (consecultive);
    this.isOutside(item, slideLength);
    return [(slideLength - this.xSliding), (slideLength - this.ySliding)];
  }

  isOutside(item: SVGElement, consecultive: number) {
    const clientRect = item.getBoundingClientRect();
    if (clientRect.right + consecultive > RendererSingleton.canvas.getBoundingClientRect().right) {
      // this.xSliding = this.xSliding + 6;
      this.xSliding = this.xSliding + 3;
    }
    if (clientRect.bottom + consecultive > RendererSingleton.canvas.getBoundingClientRect().bottom) {
      // this.ySliding = this.ySliding + 6;
      this.ySliding = this.ySliding + 3;
    }
  }

  removeSelector(): void {
    const box = RendererSingleton.renderer.selectRootElement('#box', true) as SVGElement;
    RendererSingleton.canvas.removeChild(box);
  }

  resetCounters() {
    this.consecutiveDuplicates = 1;
    this.consecutivePastes = 1;
    this.xSliding = 0;
    this.ySliding = 0;
  }

  clone(item: SVGElement, type: string): SVGElement {
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
          newItem.setAttribute('id', type + (this.brushGenerator.currentElementsNumber++ as unknown as string));
          break;
        } else if (item.id.includes('pencilPath')){
          newItem.setAttribute('id', type + (this.pencilGenerator.currentElementsNumber++ as unknown as string));
          break;
        } else {
          newItem.setAttribute('id', type + (this.penGenerator.currentElementsNumber++ as unknown as string));
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
}
