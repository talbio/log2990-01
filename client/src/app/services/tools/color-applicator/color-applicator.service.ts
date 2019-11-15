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
        if (targetObject.nodeName === 'polygon') {
          this.changePolygonColor(targetObject, newColor);
        } else {
          this.pushColorApplicatorCommand(targetObject, 'fill', newColor, targetObject.getAttribute('fill') as string);
          targetObject.setAttribute('fill', newColor);
        }
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
  private changePolylineColor(targetObject: SVGElement, newColor: string): void {
    targetObject.setAttribute('stroke', newColor);
    const markers = this.lineGenerator.findMarkerFromPolyline(targetObject, RendererSingleton.defs);
    const ancientColor = markers.children[0].getAttribute('fill') as string;
    this.pushPolyLineChangedColorCommand(targetObject, markers, newColor, ancientColor);
    markers.children[0].setAttribute('fill', newColor);

  }

  /**
   * @desc: change the color of the path element, depending whether it's a pencil path or a brush path
   */
  private changePathColor(targetObject: SVGElement, newColor: string): void {
    const id = targetObject.getAttribute('id') as string;
    if (id.startsWith('pencil')) {
      this.pushColorApplicatorCommand(targetObject, 'stroke', newColor, targetObject.getAttribute('stroke') as string);
      targetObject.setAttribute('stroke', newColor);
    } else if (id.startsWith('brush')) {
      this.changeBrushPatternsColor(targetObject, newColor, 'fill');
    } else if (id.startsWith('penPath')) {
      this.changePenColor(targetObject, newColor);
    }
  }

  /**
   * @desc: Change color of the fill attribute of all children of the pattern
   */
  private changeBrushPatternsColor(targetObject: SVGElement, newColor: string, property: string): void {
    const ancientColor = this.getBrushPatternColor(targetObject, property);
    const pattern = this.brushGenerator.findPatternFromBrushPath(targetObject, RendererSingleton.defs);
    if (pattern) {
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

  private changePenColor(targetObject: SVGElement, newColor: string): void {
    const paths: NodeListOf<SVGElement> = RendererSingleton.canvas.querySelectorAll('path');
    const penTable: SVGElement[] = [];
    const ancientColor: string = targetObject.getAttribute('fill') as string;
    paths.forEach((path) => {
        if (path.id === targetObject.id) {
            path.setAttribute('stroke', newColor);
            path.setAttribute('fill', newColor);
            penTable.push(path);
        }
    });
    this.pushMultipleObjectsColorChangedCommand(penTable, newColor, ancientColor);
  }

  private changePolygonColor(targetObject: SVGElement, newColor: string): void {
    if (targetObject.id.startsWith('polygon')) {
      this.pushColorApplicatorCommand(targetObject, 'fill', newColor, targetObject.getAttribute('fill') as string);
      targetObject.setAttribute('fill', newColor);
    } else if (targetObject.id.startsWith('featherPenPath')) {
      const polygons: NodeListOf<SVGElement> = RendererSingleton.canvas.querySelectorAll('polygon');
      const featherTable: SVGElement[] = [];
      const ancientColor: string = targetObject.getAttribute('fill') as string;
      polygons.forEach((polygon) => {
        if (polygon.id === targetObject.id) {
            polygon.setAttribute('stroke', newColor);
            polygon.setAttribute('fill', newColor);
            featherTable.push(polygon);
        }
      });
      this.pushMultipleObjectsColorChangedCommand(featherTable, newColor, ancientColor);
    }
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

  private pushPolyLineChangedColorCommand(targetObject: SVGElement, markers: SVGElement, newColor: string, ancientColor: string) {
    const command: Command = {
      execute(): void {
        markers.children[0].setAttribute('fill', newColor);
        targetObject.setAttribute('stroke', newColor);
      },
      unexecute(): void {
        markers.children[0].setAttribute('fill', ancientColor);
        targetObject.setAttribute('stroke', ancientColor);
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
  pushMultipleObjectsColorChangedCommand(targetObjects: SVGElement[], newColor: string, ancientColor: string) {
    const command: Command = {
      execute(): void {
        targetObjects.forEach((element: SVGElement) => {
          element.setAttribute('fill', newColor);
          element.setAttribute('stroke', newColor);
        });
      },
      unexecute(): void {
        targetObjects.forEach((element: SVGElement) => {
          element.setAttribute('fill', ancientColor);
          element.setAttribute('stroke', ancientColor);
        });
      },
    };
    this.pushCommand(command);
  }
}
