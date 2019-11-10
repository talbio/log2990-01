import { Injectable } from '@angular/core';
import {Command, CommandGenerator} from '../../../data-structures/command';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { LineGeneratorService } from '../line-generator/line-generator.service';

@Injectable()
export class ColorApplicatorService implements CommandGenerator {

  private readonly CLOSED_FORMS = ['rect', 'polygon', 'ellipse'];
  private readonly TREATED_ELEMENTS = ['path', 'polyline'].concat(this.CLOSED_FORMS);

  constructor(private lineGenerator: LineGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private undoRedoService: UndoRedoService) {
  }

  pushCommand(command: Command): void {
    this.undoRedoService.pushCommand(command);
  }

  changePrimaryColor(targetObject: SVGElement, newColor: string) {
    if (this.TREATED_ELEMENTS.includes(targetObject.nodeName)) {
      if (this.isClosedForm(targetObject.nodeName)) {
        this.pushColorApplicatorCommand(targetObject, 'fill', newColor, targetObject.getAttribute('fill') as string);
        targetObject.setAttribute('fill', newColor);
      } else if (targetObject.nodeName === 'path') {
        this.changePathColor(targetObject, newColor);
      } else if (targetObject.nodeName === 'polyline') {
        this.changePolylineColor(targetObject, newColor);
      }
    }
  }

  changeSecondaryColor(targetObject: SVGElement, newColor: string) {

    if (this.TREATED_ELEMENTS.includes(targetObject.nodeName)) {

      if (this.isClosedForm(targetObject.nodeName)) {
        this.pushColorApplicatorCommand(targetObject, 'stroke', newColor, targetObject.getAttribute('stroke') as string);
        targetObject.setAttribute('stroke', newColor);
      } else if (targetObject.nodeName === 'path') {
        if ((targetObject.getAttribute('id') as string).startsWith('brush')) {
          this.changeBrushPatternsColor(targetObject, newColor, 'stroke');
        }
      }
    }
  }

  /**
   * @desc: find the markers and change color of the circles in the markers
   */
  private changePolylineColor(targetObject: SVGElement, newColor: string) {
    targetObject.setAttribute('stroke', newColor);
    const markers = this.lineGenerator.findMarkerFromPolyline(targetObject, RendererSingleton.defs);
    const ancientColor = markers.children[0].getAttribute('fill') as string;
    this.pushPolyLineChangedColorCommand(markers, newColor, ancientColor);
    markers.children[0].setAttribute('fill', newColor);

  }

  /**
   * @desc: change the color of the path element, depending whether it's a pencil path or a brush path
   */
  private changePathColor(targetObject: SVGElement, newColor: string) {
    const id = targetObject.getAttribute('id') as string;
    if (id.startsWith('pencil')) {
      this.pushColorApplicatorCommand(targetObject, 'stroke', newColor, targetObject.getAttribute('stroke') as string);
      targetObject.setAttribute('stroke', newColor);
    } else if (id.startsWith('brush')) {
      this.changeBrushPatternsColor(targetObject, newColor, 'fill');
    }
  }

  /**
   * @desc: Change color of the fill attribute of all children of the pattern
   */
  private changeBrushPatternsColor(targetObject: SVGElement, newColor: string, property: string) {
    const ancientColor = this.getBrushPatternColor(targetObject, property);
    const pattern = this.brushGenerator.findPatternFromBrushPath(targetObject, RendererSingleton.defs);
    if (pattern) {
      console.log(ancientColor)
      this.pushBrushPatternsColorChangedCommand(pattern, property, newColor, ancientColor);
      for (const child of [].slice.call(pattern.children)) {
        if (child.hasAttribute(property)) {
          child.setAttribute(property, newColor);
        }
      }
    }
  }

  private getBrushPatternColor(targetObject: SVGElement, property: string): string {
    const defaultColor = 'black';
    const pattern = this.brushGenerator.findPatternFromBrushPath(targetObject, RendererSingleton.defs);
    if (pattern) {
      for (const child of [].slice.call(pattern.children)) {
        if (child.hasAttribute(property)) {
          return child.getAttribute(property);
        }
      }
    }
    return defaultColor;
  }

  private isClosedForm(nodeName: string): boolean {
    return this.CLOSED_FORMS.includes(nodeName);
  }

  private pushColorApplicatorCommand(svgElement: SVGElement, attribute: string, newColor: string, ancientColor: string): void {
    const command: Command = {
      execute(): void {
        RendererSingleton.renderer.setAttribute(svgElement, attribute, newColor);
      },
      unexecute(): void {
        RendererSingleton.renderer.setAttribute(svgElement, attribute, ancientColor);
      },
    };
    this.pushCommand(command);
  }

  private pushPolyLineChangedColorCommand(markers: SVGElement, newColor: string, ancientColor: string) {
    const command: Command = {
      execute(): void {
        console.log(newColor)
        markers.children[0].setAttribute('fill', newColor);
      },
      unexecute(): void {
        console.log(ancientColor)
        markers.children[0].setAttribute('fill', ancientColor);
      },
    };
    this.pushCommand(command);
  }

  private pushBrushPatternsColorChangedCommand(pattern: SVGElement, property: string, newColor: string, ancientColor: string) {
    const command: Command = {
      execute(): void {
        for (const child of [].slice.call(pattern.children)) {
          if (child.hasAttribute(property)) {
            child.setAttribute(property, newColor);
          }
        }
      },
      unexecute(): void {
        for (const child of [].slice.call(pattern.children)) {
          if (child.hasAttribute(property)) {
            child.setAttribute(property, ancientColor);
          }
        }
      },
    };
    this.pushCommand(command);
  }
}
