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

  pushColorApplicatorCommand(svgElement: SVGElement, attribute: string, newColor: string, ancientColor: string): void {
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
          // TODO: BRUSH ??
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
    const markers = this.lineGenerator.findMarkerFromPolyline(targetObject, RendererSingleton.getDefs());
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
      // TODO: BRUSH???
      this.changeBrushPatternsColor(targetObject, newColor, 'fill');
    }
  }

  /**
   * @desc: Change color of the fill attribute of all children of the pattern
   */
  private changeBrushPatternsColor(targetObject: SVGElement, newColor: string, property: string) {
    const pattern = this.brushGenerator.findPatternFromBrushPath(targetObject, RendererSingleton.getDefs());
    if (pattern) {
      for (const child of [].slice.call(pattern.children)) {
        if (child.hasAttribute(property)) {
          child.setAttribute(property, newColor);
        }
      }
    }
  }

  private isClosedForm(nodeName: string): boolean {
    return this.CLOSED_FORMS.includes(nodeName);
  }
}
