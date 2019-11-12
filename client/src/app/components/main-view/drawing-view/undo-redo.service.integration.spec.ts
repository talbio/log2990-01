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
import {COMPONENTS, DRAWING_SERVICES, IMPORTS, modalManagerSpy} from './integration-tests-environment.spec';

describe('UndoRedoService integrations tests', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;

  const drawLine = () => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    const xInitial = 100;
    const yInitial = 100;
    const mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = xInitial;
    mousePositionService.canvasMousePositionY = yInitial;
    component.workZoneComponent.onLeftClick(mouseEvent);
    const finalMouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    component.workZoneComponent.onDoubleClick(finalMouseEvent);
  };

  // This takes 2 x and y coordinates and draws a shape from point 1 to 2 on the canvas
  const drawShapeOnCanvas = (x1: number, y1: number, x2: number, y2: number, toolType: Tools) => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = toolType;
    let mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: x1,
      clientY: y1,
    });
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = x1;
    mousePositionService.canvasMousePositionY = y1;
    component.workZoneComponent.onMouseDown(mouseEvent);
    mouseEvent = new MouseEvent('mousemove', {
      clientX: x2,
      clientY: y2,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = x2;
    mousePositionService.canvasMousePositionY = y2;
    component.workZoneComponent.onMouseMove(mouseEvent);
    component.workZoneComponent.onMouseUp(mouseEvent);
  };

  // This returns the child at 'position' from the canvas's last position (1 for last)
  const getLastSvgElement = (svgHandle: SVGElement, position: number) => {
    return svgHandle.children.item(svgHandle.children.length - position) as SVGElement;
  };

  const expectCreationToBeUndoable = async (tool: Tools, id: string) => {
    const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
    drawShapeOnCanvas(100, 100, 200, 200, tool);
    const svgElement = getLastSvgElement(svgCanvas, 1) as SVGElement;
    await expect(svgElement.getAttribute('id')).toBe(id);
    const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
    undoRedoService.undo();
    fixture.detectChanges();
    await expect(svgCanvas.querySelector('#' + id)).toBe(null);
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
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Generators', () => {
    it('should be able to undo a rectangle', async () => {
      await expectCreationToBeUndoable(Tools.Rectangle, 'rect0');
    });

    it('should be able to undo a polygon', async () => {
      await expectCreationToBeUndoable(Tools.Polygon, 'polygon0');
    });

    it('should be able to undo a pencil', async () => {
      await expectCreationToBeUndoable(Tools.Pencil, 'pencilPath0');
    });

    it('should be able to undo a pen', async () => {
      await expectCreationToBeUndoable(Tools.Pen, 'penPath0');
    });

    it('should be able to undo a line', async () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      drawLine();
      const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
      undoRedoService.undo();
      await expect(svgCanvas.querySelector('#line0')).toBe(null);
    });

    it('should be able to undo an emoji', async () => {
      await expectCreationToBeUndoable(Tools.Stamp, 'emoji0');
    });

    it('should be able to undo an ellipse', async () => {
      await expectCreationToBeUndoable(Tools.Ellipse, 'ellipse0');
    });

    it('should be able to undo a brush', async () => {
      await expectCreationToBeUndoable(Tools.Brush, 'brushPath0');
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

    /**
     * since closed forms are treated in the same way for the color change,
     * we test only for a rectangle and we can assert that it will also work for ellipse and polygon.
     */
    it('should be able to undo a fill color change for a closed form', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const newColor = 'rgba(100,100,100,1)';
      drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const rectangleChild = getLastSvgElement(svgCanvas, 1) as SVGElement;
      expect(rectangleChild.getAttribute('fill')).toBe('transparent');
      applyColorApplicatorOnElement(150, 150, rectangleChild,  newColor, true);
      expect(rectangleChild.getAttribute('fill')).toBe(newColor);
      const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
      undoRedoService.undo();
      expect(rectangleChild.getAttribute('fill')).toBe('transparent');
    });

    it('should be able to undo a stroke color change for a closed form', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const initialColor = 'rgba(100,100,100,1)';
      setSecondaryColor(initialColor);
      drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const rectangleChild = getLastSvgElement(svgCanvas, 1) as SVGElement;
      expect(rectangleChild.getAttribute('stroke')).toBe(initialColor);
      const changedColor = 'rgba(180,180,180,1)';
      applyColorApplicatorOnElement(150, 150, rectangleChild, changedColor, false);
      expect(rectangleChild.getAttribute('stroke')).toBe(changedColor);
      const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
      undoRedoService.undo();
      expect(rectangleChild.getAttribute('stroke')).toBe(initialColor);
    });

    it('should be able to undo a path stroke color change', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const initialColor = 'rgba(150,150,150,1)';
      setPrimaryColor(initialColor);
      drawShapeOnCanvas(100, 100, 200, 100, Tools.Pencil);
      const pencil: SVGElement = getLastSvgElement(svgCanvas, 1);
      expect(pencil.getAttribute('stroke')).toBe(initialColor);
      const changedColor = 'rgba(167,167,167,1)';
      applyColorApplicatorOnElement(100, 150, pencil, changedColor, true);
      expect(pencil.getAttribute('stroke')).toBe(changedColor);
      const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
      undoRedoService.undo();
      expect(pencil.getAttribute('stroke')).toBe(initialColor);
    });
  });

});
