import {ChangeDetectorRef, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from '../../../data-structures/tools';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import {ColorService} from '../../../services/tools/color/color.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import {UndoRedoService} from '../../../services/undo-redo/undo-redo.service';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { DrawingViewComponent } from './drawing-view.component';
import {STUB_COMPONENTS} from './drawing-view.component.spec';
import {
  CanvasDrawer,
  COMPONENTS,
  DRAWING_SERVICES,
  IMPORTS,
  modalManagerSpy
} from './integration-tests-environment.spec';

describe('UndoRedoService integrations tests', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;
  let canvasDrawer: CanvasDrawer;

  const expectCreationToBeUndoable = async (tool: Tools, id: string) => {
    const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
    canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, tool);
    const svgElement = canvasDrawer.getLastSvgElement(svgCanvas, 1) as SVGElement;
    await expect(svgElement.getAttribute('id')).toBe(id);
    const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
    undoRedoService.undo();
    fixture.detectChanges();
    await expect(svgCanvas.querySelector('#' + id)).toBe(null);
  };

  const expectCreationToBeRedoable = async (id: string) => {
    const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
    expect(svgCanvas.querySelector('#' + id)).toBe(null);
    const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
    undoRedoService.redo();
    fixture.detectChanges();
    await expect(svgCanvas.querySelector('#' + id)).not.toBe(null);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [COMPONENTS, STUB_COMPONENTS],
      imports: [IMPORTS],
      providers: [
        Renderer2, ToolManagerService, ChangeDetectorRef, ...DRAWING_SERVICES,
        {provide: ModalManagerService, useValue: modalManagerSpy},
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).overrideModule(BrowserDynamicTestingModule, {
        set: {entryComponents: [ToolsAttributesBarComponent, DrawingViewComponent]},
      },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      canvasDrawer = new CanvasDrawer(fixture, component);
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Generators', () => {
    it('should be able to undo and redo a rectangle', async () => {
      await expectCreationToBeUndoable(Tools.Rectangle, 'rect0');
      await expectCreationToBeRedoable('rect0');
    });

    it('should be able to undo and redo a polygon', async () => {
      await expectCreationToBeUndoable(Tools.Polygon, 'polygon0');
      await expectCreationToBeRedoable('polygon0');
    });

    it('should be able to undo and redo a pencil', async () => {
      await expectCreationToBeUndoable(Tools.Pencil, 'pencilPath0');
      await expectCreationToBeRedoable('pencilPath0');
    });

    it('should be able to undo and redo a pen', async () => {
      await expectCreationToBeUndoable(Tools.Pen, 'penPath0');
      await expectCreationToBeRedoable('penPath0');
    });

    it('should be able to undo and redo a line', async () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      canvasDrawer.drawLine();
      const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
      undoRedoService.undo();
      await expect(svgCanvas.querySelector('#line0')).toBe(null);
      await expectCreationToBeRedoable('line0');
    });

    it('should be able to undo and redo an emoji', async () => {
      await expectCreationToBeUndoable(Tools.Stamp, 'emoji0');
      await expectCreationToBeRedoable('emoji0');
    });

    it('should be able to undo and redo an ellipse', async () => {
      await expectCreationToBeUndoable(Tools.Ellipse, 'ellipse0');
      await expectCreationToBeRedoable('ellipse0');
    });

    it('should be able to undo and redo a brush', async () => {
      await expectCreationToBeUndoable(Tools.Brush, 'brushPath0');
      await expectCreationToBeRedoable('brushPath0');
    });
  });

  describe('ColorApplicator', () => {
    const setPrimaryColor = (color: string) => {
      const colorService = fixture.debugElement.injector.get(ColorService);
      colorService.setPrimaryColor(color);
      colorService.assignPrimaryColor();
    };
    const setSecondaryColor = (color: string) => {
      const colorService = fixture.debugElement.injector.get(ColorService);
      colorService.setSecondaryColor(color);
      colorService.assignSecondaryColor();
    };
    const applyColorApplicatorOnElement = (clickX: number, clickY: number, element: SVGElement, color: string, isPrimaryColor: boolean) => {
      const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
      toolManagerService._activeTool = Tools.ColorApplicator;
      const mouseEvent = new MouseEvent(isPrimaryColor ? 'click' : 'contextmenu', {
        button: isPrimaryColor ? 0 : 2,
        clientX: clickX,
        clientY: clickY,
        bubbles: true,
      });
      if (isPrimaryColor) {
        setPrimaryColor(color);
      } else {
        setSecondaryColor(color);
      }
      const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
      mousePositionService.canvasMousePositionX = clickX;
      mousePositionService.canvasMousePositionY = clickY;
      element.dispatchEvent(mouseEvent);
    };

    const expectPropertyToBeUndoAndRedoable =
      (svgElement: SVGElement, property: string, newAttribute: string, ancientAttribute: string) => {
      expect(svgElement.getAttribute(property)).toBe(newAttribute);
      const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
      undoRedoService.undo();
      expect(svgElement.getAttribute(property)).toBe(ancientAttribute);
      undoRedoService.redo();
      expect(svgElement.getAttribute(property)).toBe(newAttribute);
    };

    /**
     * since closed forms are treated in the same way for the color change,
     * we test only for a rectangle and we can assert that it will also work for ellipse and polygon.
     */
    it('should be able to undo and redo a fill color change for a closed shape', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const fillColor = 'rgba(100,100,100,1)';
      setPrimaryColor(fillColor);
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const rectangleChild = canvasDrawer.getLastSvgElement(svgCanvas, 1) as SVGElement;
      expect(rectangleChild.getAttribute('fill')).toBe('transparent');
      applyColorApplicatorOnElement(150, 150, rectangleChild,  fillColor, true);
      expectPropertyToBeUndoAndRedoable(rectangleChild, 'fill', fillColor, 'transparent');
    });

    it('should be able to undo and redo a stroke color change for a closed shape', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const initialColor = 'rgba(100,100,100,1)';
      setSecondaryColor(initialColor);
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const rectangleChild = canvasDrawer.getLastSvgElement(svgCanvas, 1) as SVGElement;
      expect(rectangleChild.getAttribute('stroke')).toBe(initialColor);
      const changedColor = 'rgba(180,180,180,1)';
      applyColorApplicatorOnElement(150, 150, rectangleChild, changedColor, false);
      expectPropertyToBeUndoAndRedoable(rectangleChild, 'stroke', changedColor, initialColor);
    });

    it('should be able to undo and redo a path stroke color change', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const initialColor = 'rgba(150,150,150,1)';
      setPrimaryColor(initialColor);
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 100, Tools.Pencil);
      const pencil: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
      expect(pencil.getAttribute('stroke')).toBe(initialColor);
      const changedColor = 'rgba(167,167,167,1)';
      applyColorApplicatorOnElement(100, 150, pencil, changedColor, true);
      expectPropertyToBeUndoAndRedoable(pencil, 'stroke', changedColor, initialColor);
    });


    it('should be able to undo and redo a path line color change', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const initialColor = 'rgba(150,150,150,1)';
      setSecondaryColor(initialColor);
      canvasDrawer.drawLine();
      const changedColor = 'rgba(100, 100, 100, 1)';
      const pen: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
      applyColorApplicatorOnElement(100, 100, pen, changedColor, true);
      expectPropertyToBeUndoAndRedoable(pen, 'stroke', changedColor, initialColor);
    });
  });

  describe('eraser', () => {
    it('should be able to undo an erased element', () => {
    });
  });
});
