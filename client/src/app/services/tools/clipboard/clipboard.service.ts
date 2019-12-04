import { Injectable } from '@angular/core';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import {Command, CommandGenerator} from '../../../data-structures/command';
import { RendererSingleton } from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import {ToolManagerService} from '../tool-manager/tool-manager.service';
import { TransformService } from '../../transformations/transform.service';

@Injectable()
export class ClipboardService implements CommandGenerator {

  memorizedElements: SVGElement[];
  selectedItems: SVGElement[];
  newItems: SVGElement[];
  private xSliding: number;
  private ySliding: number;
  private readonly sideImpacts: boolean[];

  constructor(private selector: ObjectSelectorService,
              private toolManager: ToolManagerService,
              private undoRedoService: UndoRedoService,
              private transform: TransformService) {
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

  hasMemorizedElements(): boolean {
    return this.memorizedElements.length !== 0;
  }

  slide(item: SVGElement) {
    this.getSlideLength(item);
    this.transform.translate(item, this.xSliding, this.ySliding);
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
    this.xSliding = 0;
    this.ySliding = 0;
  }

  clone(item: SVGElement): SVGElement {
    const newItem = item.cloneNode() as SVGElement;
    const generator: AbstractGenerator = this.toolManager.returnGeneratorFromElement(item) as AbstractGenerator;
    newItem.setAttribute('id', generator.idPrefix + (generator.currentElementsNumber++).toString());
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
    this.selector.removeGBoundingRect();
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
    this.selector.removeGBoundingRect();
    this.selector.selectedElements = [];

    this.pushCutCommand(this.selectedItems);
  }

  pushPasteCommand(svgElements: SVGElement[]): void {
    const removeGBoundingRect = () => {
      if (this.selector.hasBoundingRect) {
        this.selector.removeGBoundingRect();
      }
    };
    const command: Command = {
      execute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.renderer.appendChild(RendererSingleton.canvas, svgElement));
      },
      unexecute(): void {
        removeGBoundingRect();
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.canvas.removeChild(svgElement));
      },
    };
    this.pushCommand(command);
  }

  pushCutCommand(svgElements: SVGElement[]): void {
    const removeGBoundingRect = () => {
      if (this.selector.hasBoundingRect) {
        this.selector.removeGBoundingRect();
      }
    };
    const command: Command = {
      execute(): void {
        removeGBoundingRect();
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.canvas.removeChild(svgElement));
        },
      unexecute(): void {
        svgElements.forEach((svgElement: SVGElement) =>
          RendererSingleton.canvas.appendChild(svgElement));
      },
    };
    this.pushCommand(command);
  }

  pushCommand(command: Command): void {
    this.undoRedoService.pushCommand(command);
  }

  reset(): void {
    this.memorizedElements = [];
  }
}
