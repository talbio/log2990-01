import { Injectable } from '@angular/core';
import { RendererSingleton } from './../../renderer-singleton';
import { ObjectSelectorService } from './../object-selector/object-selector.service';
import { RectangleGeneratorService } from './../rectangle-generator/rectangle-generator.service';

@Injectable()
export class ClipboardService {

  memorizedAction: SVGElement[];
  private selectedItems: SVGElement[];
  private canvas: SVGElement;
  private consecultivePastes: number;
  private consecultiveDuplicates: number;
  private xSliding: number;
  private ySliding: number;

  constructor(private selector: ObjectSelectorService,
              private rectangleGenerator: RectangleGeneratorService) {
    this.consecultivePastes = 1;
    this.consecultiveDuplicates = 1;
  }

  hasSelectedElements(): boolean {
    return this.selector.SVGArray.length === 0;
  }

  // Removes and stores in clipboard
  cut() {
    this.resetCounters();
    this.assessSelection();
    this.memorizedAction = this.selectedItems;
    const box = RendererSingleton.renderer.selectRootElement('#selected', true);
    for (const item of this.memorizedAction) {
      const index = this.findChildIndex(item);
      if (index === -1) {
        console.log('cannot cut item ' + item.id);
        return;
      }
      box.removeChild(item);
      console.log('removed ' + item.tagName);
    }
    this.removeSelector();
  }

  // Stores in clipboard
  copy() {
    this.resetCounters();
    this.assessSelection();
    if (this.selector.SVGArray !== null) {
      this.memorizedAction = this.selector.SVGArray;
      console.log(this.memorizedAction);
    } else {
      console.log('nothing to copy, nothing selected');
    }
  }

  // Appends clipboard to canvas
  paste() {
    if (this.canvas !== null) {
      for (const item of this.memorizedAction) {
        console.log('paste initiated');
        const newItem = this.duplicateElement(item);
        this.canvas.appendChild(newItem);
        const itemInCanvas = this.canvas.children[this.canvas.children.length - 1] as SVGElement;
        console.log(itemInCanvas, ' is new item in canvas');
        this.slide(itemInCanvas, this.consecultivePastes);
      }
      this.consecultivePastes++;
    } else {
      console.log('nothing to paste, clipboard is empty');
    }
  }

  // Appends a displaced version of the selected items
  duplicate() {
    this.assessSelection();
    for (const item of this.selector.SVGArray) {
      const newItem = this.duplicateElement(item);
      this.canvas.appendChild(newItem);
      const itemInCanvas = this.canvas.children[this.canvas.children.length - 1] as SVGElement;
      console.log(itemInCanvas, ' is new item in canvas');
      this.slide(itemInCanvas, this.consecultiveDuplicates);
    }
    this.consecultiveDuplicates++;
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
    this.removeSelector();
  }

  assessSelection() {
    this.canvas = RendererSingleton.renderer.selectRootElement('#canvas', true);
    if (this.selectedItems !== this.selector.SVGArray) {
      this.resetCounters();
    }
    this.selectedItems = this.selector.SVGArray;
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
    return this.rectangleGenerator.clone(item, type);
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
    if (clientRect.right + consecultive > this.canvas.getBoundingClientRect().right) {
      // this.xSliding = this.xSliding + 6;
      this.xSliding = this.xSliding + 3;
    }
    if (clientRect.bottom + consecultive > this.canvas.getBoundingClientRect().bottom) {
      // this.ySliding = this.ySliding + 6;
      this.ySliding = this.ySliding + 3;
    }
  }

  removeSelector(): void {
    const box = RendererSingleton.renderer.selectRootElement('#box', true) as SVGElement;
    this.canvas.removeChild(box);
  }

  resetCounters() {
    this.consecultiveDuplicates = 1;
    this.consecultivePastes = 1;
    this.xSliding = 0;
    this.ySliding = 0;
  }
}
