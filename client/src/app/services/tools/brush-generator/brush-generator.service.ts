import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class BrushGeneratorService extends AbstractWritingTool {

  private readonly DEFAULT_BRUSH_PATTERN = 'url(#brushPattern1)';
  private currentBrushPattern: string;

  constructor(private mousePosition: MousePositionService,
              undoRedoService: UndoRedoService) {
    super(mousePosition, undoRedoService);
    this.currentBrushPattern = this.DEFAULT_BRUSH_PATTERN;
    this.currentElementsNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _currentBrushPattern(pattern: string) {
    this.currentBrushPattern = pattern;
  }

  get _currentBrushPattern(): string {
    return this.currentBrushPattern;
  }

  createElement(primaryColor: string, secondaryColor: string) {
    const newPattern = this.createPattern(primaryColor, secondaryColor);
    this.generateBrushPath(this.strokeWidth);
    this.addPatternToNewPath(newPattern, RendererSingleton.canvas);
    this.mouseDown = true;
  }

  private createPattern(primaryColor: string, secondaryColor: string): SVGElement {
    const newPattern = RendererSingleton.renderer.createElement('pattern', 'svg');
    const patternToCopy = RendererSingleton.renderer
        .selectRootElement(`${this.currentBrushPattern.substring(4, this.currentBrushPattern.length - 1)}`, true);
    // Copy all children into new pattern
    newPattern.innerHTML = patternToCopy.innerHTML;
    // Also copy the necessary attributes
    RendererSingleton.renderer.setAttribute(newPattern, 'height', patternToCopy.getAttribute('height') as string);
    RendererSingleton.renderer.setAttribute(newPattern, 'width', patternToCopy.getAttribute('width') as string);
    RendererSingleton.renderer.setAttribute(newPattern, 'patternUnits', patternToCopy.getAttribute('patternUnits') as string);
    RendererSingleton.renderer.setProperty(newPattern, 'id', `brushPath${this.currentElementsNumber}pattern`);

    // Fills take the primary color
    for (const child of [].slice.call(newPattern.children)) {
      if (child.hasAttribute('fill')) {
        child.setAttribute('fill', primaryColor);
      }
    }
    // Strokes take the secondaryColor
    for (const child of [].slice.call(newPattern.children)) {
      if (child.hasAttribute('stroke')) {
        child.setAttribute('stroke', secondaryColor);
      }
    }
    RendererSingleton.renderer.appendChild(RendererSingleton.defs, newPattern);
    return newPattern;
  }

  findPatternFromBrushPath(brushPath: SVGElement, defsElement: SVGElement): SVGElement {
    for (const child of [].slice.call(defsElement.children)) {
      const childCast = child as SVGElement;
      if (childCast.id === brushPath.id + 'pattern') {
        return childCast;
      }
    }
    // No pattern was found for corresponding brush path, this should not happen as the pattern is created with the path
    return new SVGElement();
  }

  private addPatternToNewPath(pattern: SVGElement, canvas: SVGElement) {
    const newBrushPath = canvas.children[canvas.children.length - 1];
    const patternAddress = `url(#${pattern.id})`;
    newBrushPath.setAttribute('stroke', patternAddress);
  }

  private generateBrushPath(strokeWidth: number): void {
    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `brushPath${this.currentElementsNumber}`],
      ['d', `M ${this.xPos} ${this.yPos}
        L ${this.xPos} ${this.yPos}`],
      ['stroke-width', `${strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
  }
}
