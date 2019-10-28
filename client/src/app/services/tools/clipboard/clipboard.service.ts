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

  isSelecting: boolean;

constructor(private selector: ObjectSelectorService,
            private renderer: Renderer2,
            private rectangleGenerator: RectangleGeneratorService,
            private ellipseGenerator: EllipseGeneratorService,
            private emojiGenerator: EmojiGeneratorService,
            private pencilGenerator: PencilGeneratorService,
            private brushGenerator: BrushGeneratorService,
            private lineGenerator: LineGeneratorService,
            private polygonGenerator: PolygonGeneratorService,) {
  this.isSelecting = false;
}

  // Removes and stores in clipboard
  cut() {
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
    this.assessSelection();
    this.memorizedAction = this.selector.SVGArray;
  }

  // Appends clipboard to canvas
  paste() {
    if (this.canvas !== null) {
      for (const item of this.memorizedAction) {
        const index = this.findChildIndex(item);
        this.canvas.innerHTML += this.duplicateElement(index);
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
      }
      this.canvas.innerHTML += this.duplicateElement(index);
    }
  }

  // Removes the selected items
  delete() {
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

  duplicateElement(index: number): string {
    const item = this.canvas.children[index] as SVGElement;
    const type = item.tagName;
    switch (type) {
      case 'rect':
        return this.rectangleGenerator.clone(item);
        case 'ellipse':
        return this.ellipseGenerator.clone(item);
      case 'polygon':
        return this.polygonGenerator.clone(item);
      case 'path':
        const subtype = item.id.split(/0-9/)[0];
        if (subtype === 'brushPath') { return this.brushGenerator.clone(item);
        } else {
          return this.pencilGenerator.clone(item);
        }
      case 'polyline':
        return this.lineGenerator.clone(item);
      case 'image':
        return this.emojiGenerator.clone(item);
      default :
        console.log('cannot recognize tag ' + item.tagName + ', did not duplicate');
        return 'to discard';
    }
  }
}
