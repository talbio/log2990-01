import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RendererSingleton } from 'src/app/services/renderer-singleton';
import { Tools } from '../../../data-structures/tools';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { ClipboardService } from '../../../services/tools/clipboard/clipboard.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { ObjectSelectorService } from '../../../services/tools/object-selector/object-selector.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { UndoRedoService } from './../../../services/undo-redo/undo-redo.service';
import { DrawingViewComponent } from './drawing-view.component';
import { DRAWING_SERVICES } from './integration-tests-environment.spec';

/* tslint:disable:max-classes-per-file for mocking classes*/
/* tslint:disable:no-string-literal for testing purposes*/
@Component({ selector: 'app-lateral-bar', template: '' })
class LateralBarStubComponent { }
@Component({ selector: 'app-welcome-modal', template: '' })
class WelcomeModalStubComponent { }

const rendererSpy: jasmine.SpyObj<Renderer2> =
  jasmine.createSpyObj('Renderer2', ['selectRootElement']);

const modalManagerSpy: jasmine.SpyObj<ModalManagerService> =
  jasmine.createSpyObj('ModalManagerService', ['showCreateDrawingDialog']);
const httpClientSpy: jasmine.SpyObj<HttpClient> =
  jasmine.createSpyObj('HttpClient', ['get', 'post']);

describe('DrawingViewComponent', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DrawingViewComponent,
        WelcomeModalStubComponent,
        WorkZoneComponent,
        LateralBarStubComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        ColorPickerDialogComponent,
        LastTenColorsComponent,
        ToolsAttributesBarComponent,
      ],
      imports: [
        DemoMaterialModule,
        CommonModule,
        FormsModule,
        PortalModule,
      ],
      providers: [ToolManagerService, ...DRAWING_SERVICES, ColorService, ChangeDetectorRef,
        { provide: Renderer2, useValue: rendererSpy },
        { provide: ModalManagerService, useValue: modalManagerSpy },
        { provide: HttpClient, useValue: httpClientSpy }, ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ToolsAttributesBarComponent,
          DrawingViewComponent],
      },
    },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

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
    component.workZoneComponent.onMouseDown();
    mouseEvent = new MouseEvent('mousemove', {
    clientX: x2,
    clientY: y2,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = x2;
    mousePositionService.canvasMousePositionY = y2;
    component.workZoneComponent.onMouseMove(mouseEvent);
    component.workZoneComponent.onMouseUp();
  };

  it('should react properly to cut', () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialChildrenLength = workChilds.length;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    toolManagerService._activeTool = Tools.Selector;

    drawShapeOnCanvas(100, 100, 200, 250, Tools.Rectangle);

    toolManagerService._activeTool = Tools.Selector;
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;

    component.workZoneComponent.onMouseDown();

    const mouseEvent1 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    component.workZoneComponent.onMouseMove(mouseEvent1);
    component.workZoneComponent.onMouseUp();

    const itemToBeCut = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    // The clipboard contains the cut element and the canvas does not
    expect(workChilds.length).toEqual(initialChildrenLength);
    expect(clipboardService.memorizedElements).toContain(itemToBeCut);
  });

  it('should react properly to copy', () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    drawShapeOnCanvas(200, 200, 300, 450, Tools.Rectangle);

    toolManagerService._activeTool = Tools.Selector;
    const itemToBeCopied = workChilds[2] as SVGElement;

    mouse.canvasMousePositionX = 210;
    mouse.canvasMousePositionY = 210;

    component.workZoneComponent.onMouseDown();

    const mouseEvent1 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 300,
      clientY: 450,
    });
    component.workZoneComponent.onMouseMove(mouseEvent1);
    component.workZoneComponent.onMouseUp();

    clipboardService.copy();
    // The clipboard contains the item copied
    expect(clipboardService.memorizedElements).toContain(itemToBeCopied);
  });

  it('should react properly to delete', () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialChildrenLength = workChilds.length;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    drawShapeOnCanvas(200, 200, 300, 450, Tools.Rectangle);
    toolManagerService._activeTool = Tools.Selector;

    mouse.canvasMousePositionX = 210;
    mouse.canvasMousePositionY = 210;

    component.workZoneComponent.onMouseDown();

    const mouseEvent1 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 300,
      clientY: 450,
    });

    component.workZoneComponent.onMouseMove(mouseEvent1);
    component.workZoneComponent.onMouseUp();
    clipboardService.delete();
    // The clipboard contains only one element and it is not the one that was deleted
    expect(clipboardService.memorizedElements.length).toEqual(0);
    expect(workChilds.length).toEqual(initialChildrenLength);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas and not affect the clipboard (paste)', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);

    drawShapeOnCanvas(100, 100, 250, 200, Tools.Rectangle);
    toolManagerService._activeTool = Tools.Selector;

    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    toolManagerService._activeTool = Tools.Selector;
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    selector.onMouseDown();

    const mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    selector.onMouseMove(workChilds.length, mouseEvent);
    selector.onMouseUp();

    clipboardService.copy();
    const nbChildrenBeforePaste = workChilds.length;
    clipboardService.paste();
    // The paste added a child on the canvas, which is the one selected and the clipboard contains still the element selected
    expect(workChilds.length).toBeGreaterThan(nbChildrenBeforePaste);
    expect(workChilds[2]).toEqual(itemToBeCut);
    expect(clipboardService.memorizedElements[0]).toEqual(itemToBeCut);
    expect(clipboardService.memorizedElements.length).toEqual(1);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (duplicate)', () => {
    const svgHandle = RendererSingleton.canvas as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);

    drawShapeOnCanvas(100, 100, 200, 250, Tools.Rectangle);

    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeDuplicated = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    toolManagerService._activeTool = Tools.Selector;
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    selector.onMouseDown();

    const mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    selector.onMouseMove(workChilds.length, mouseEvent);
    selector.onMouseUp();

    clipboardService.duplicate();
    // 4 because 2 is the itemToDuplicate and 3 is the boundingRect
    const clone = workChilds[4];
    let isAClone = true;
    if (clone.getAttribute('height') !== itemToBeDuplicated.getAttribute('height')) {
      isAClone = false;
    }
    if (clone.getAttribute('width') !== itemToBeDuplicated.getAttribute('width')) {
      isAClone = false;
    }
    if (clone.getAttribute('fill') !== itemToBeDuplicated.getAttribute('fill')) {
      isAClone = false;
    }
    if (clone.getAttribute('stroke-width') !== itemToBeDuplicated.getAttribute('stroke-width')) {
      isAClone = false;
    }
    if (clone.getAttribute('stroke') !== itemToBeDuplicated.getAttribute('stroke')) {
      isAClone = false;
    }
    expect(isAClone).toBe(true);
    // The clipboard is still empty and a slightely displaced clone of the selected element was added
    // Def + Grid + item + clone + boundingRect
    expect(workChilds.length).toEqual(5);
    expect(clipboardService.memorizedElements.length).toEqual(0);
  });

  it('should react properly to command pattern when paste/duplicate is called', () => {
    const svgHandle = RendererSingleton.canvas as SVGElement;
    const workChilds = svgHandle.children;
    const initialChildrenLength = workChilds.length;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);

    drawShapeOnCanvas(100, 100, 200, 250, Tools.Rectangle);

    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeDuplicated = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    toolManagerService._activeTool = Tools.Selector;
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    selector.onMouseDown();

    const mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 200,
      clientY: 250,
    });
    mouse.canvasMousePositionX = 200;
    mouse.canvasMousePositionY = 250;
    selector.onMouseMove(workChilds.length, mouseEvent);
    selector.onMouseUp();

    const undoRedo = fixture.debugElement.injector.get(UndoRedoService);
    // since duplicate utilizes the command pattern in the same way as paste, let's just test duplicate
    clipboardService.duplicate();
    undoRedo.undo();
    // defs + grid + initialRect + boundingRect = 4
    expect(workChilds.length).toEqual(initialChildrenLength + 2);

    undoRedo.redo();
    // defs + grid + initialRect + boundingRect + clone = 5
    expect(workChilds.length).toEqual(initialChildrenLength + 3);
    expect(workChilds[2]).toEqual(itemToBeDuplicated);

  });

  it('should react properly to command pattern when delete/cut is called', () => {
    const svgHandle = RendererSingleton.canvas as SVGElement;
    const workChilds = svgHandle.children;
    const initialChildrenLength = workChilds.length;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);

    drawShapeOnCanvas(100, 100, 200, 250, Tools.Rectangle);

    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeDeleted = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    toolManagerService._activeTool = Tools.Selector;
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    selector.onMouseDown();

    const mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 200,
      clientY: 250,
    });
    mouse.canvasMousePositionX = 200;
    mouse.canvasMousePositionY = 250;
    selector.onMouseMove(workChilds.length, mouseEvent);
    selector.onMouseUp();

    const undoRedo = fixture.debugElement.injector.get(UndoRedoService);

    // since delete utilizes the command pattern in the same way as cut, let's just test delete
    clipboardService.delete();

    undoRedo.undo();
    // defs + grid + initialRect = 3
    expect(workChilds.length).toEqual(initialChildrenLength + 1);
    // is a clone ignoring transform
    expect(workChilds[workChilds.length - 1]).toEqual(itemToBeDeleted);

    undoRedo.redo();
    // defs + grid + initialRect = 3
    expect(workChilds.length).toEqual(initialChildrenLength);
  });
});
