import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RendererSingleton } from 'src/app/services/renderer-singleton';
import { EraserService } from 'src/app/services/tools/eraser/eraser.service';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
import { Tools } from '../../../data-structures/Tools';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { BrushGeneratorService } from '../../../services/tools/brush-generator/brush-generator.service';
import { ClipboardService } from '../../../services/tools/clipboard/clipboard.service';
import { ColorApplicatorService } from '../../../services/tools/color-applicator/color-applicator.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { EmojiGeneratorService } from '../../../services/tools/emoji-generator/emoji-generator.service';
import { EyedropperService } from '../../../services/tools/eyedropper/eyedropper.service';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { LineGeneratorService } from '../../../services/tools/line-generator/line-generator.service';
import { ObjectSelectorService } from '../../../services/tools/object-selector/object-selector.service';
import { PencilGeneratorService } from '../../../services/tools/pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../../../services/tools/polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { DrawingViewComponent } from './drawing-view.component';

// /* tslint:disable:max-classes-per-file for mocking classes*/
// /* tslint:disable:no-string-literal for testing purposes*/
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

const DRAWING_SERVICES = [
  RectangleGeneratorService,
  EllipseGeneratorService,
  EmojiGeneratorService,
  PencilGeneratorService,
  BrushGeneratorService,
  ColorApplicatorService,
  LineGeneratorService,
  EyedropperService,
  ClipboardService,
  EraserService,
  PenGeneratorService,
  ColorService,
  MousePositionService,
  ObjectSelectorService,
  GridTogglerService,
  PolygonGeneratorService,
];

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
          DrawingViewComponent]
      }
    },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should react properly to cut', () => {
    // Create the work-zone
    // tslint:disable-next-line: no-string-literal
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialChildrenLength = workChilds.length;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rectTestCut"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;

    toolManagerService._activeTool = Tools.Selector;
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;

    const mouseEvent0 = new MouseEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    component.workZoneComponent.onMouseDown(mouseEvent0);

    const mouseEvent1 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    component.workZoneComponent.onMouseMove(mouseEvent1);
    component.workZoneComponent.onMouseUp(mouseEvent1);

    const itemToBeCut = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    // The clipboard contains the cut element and the canvas does not
    expect(workChilds.length).toEqual(initialChildrenLength);
    expect(clipboardService.memorizedElements).toContain(itemToBeCut);
  });

  it('should react properly to copy', () => {
    // Create the work-zone
    // tslint:disable-next-line: no-string-literal
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
    `<rect id="rectTestCopy"
        x="200" data-start-x="200"
        y="200" data-start-y="200"
        width="100" height="250" stroke="red" stroke-width="1"
        fill="pink"></rect>`;

    const itemToBeCopied = workChilds[2] as SVGElement;

    mouse.canvasMousePositionX = 210;
    mouse.canvasMousePositionY = 210;
    const mouseEvent0 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 210,
      clientY: 210,
    });

    component.workZoneComponent.onMouseDown(mouseEvent0);

    const mouseEvent1 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 300,
      clientY: 450,
    });
    component.workZoneComponent.onMouseMove(mouseEvent1);
    component.workZoneComponent.onMouseUp(mouseEvent1);

    clipboardService.copy();
    // The clipboard contains the item copied
    expect(clipboardService.memorizedElements).toContain(itemToBeCopied);
  });

  it('should react properly to delete', () => {
    // Create the work-zone
    // tslint:disable-next-line: no-string-literal
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialChildrenLength = workChilds.length;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    toolManagerService._activeTool = Tools.Selector;
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);

    svgHandle.innerHTML +=
    `<rect id="rectTestDelete"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="50" stroke="yellow" stroke-width="1"
        fill="pink"></rect>`;

    // const itemToBeDeleted = workChilds[2] as SVGElement;
    mouse.canvasMousePositionX = 0;
    mouse.canvasMousePositionY = 0;
    const mouseEvent0 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 0,
      clientY: 0,
    });

    component.workZoneComponent.onMouseDown(mouseEvent0);

    const mouseEvent1 = new MouseEvent('mousemove', {
      button: 0,
      clientX: 900,
      clientY: 475,
    });
    mouse.canvasMousePositionX = 900;
    mouse.canvasMousePositionY = 475;
    component.workZoneComponent.onMouseMove(mouseEvent1);
    component.workZoneComponent.onMouseUp(mouseEvent1);
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
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    // selector.selectedElements.push(itemToBeCut);
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
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeDuplicated = workChilds[2] as SVGElement;

    // selector.selectedElements.push(itemToBeDuplicated);
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
    if (parseFloat(clone.getAttribute('height') as unknown as string) !==
      parseFloat(itemToBeDuplicated.getAttribute('height') as unknown as string)) {
      isAClone = false;
    }
    console.log(isAClone);
    if (parseFloat(clone.getAttribute('width') as unknown as string) !==
    parseFloat(itemToBeDuplicated.getAttribute('width') as unknown as string)) {
      isAClone = false;
    }
    if (clone.getAttribute('fill') !== itemToBeDuplicated.getAttribute('fill')) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('stroke-width') as unknown as string) !==
      parseFloat(itemToBeDuplicated.getAttribute('stroke-width') as unknown as string)) {
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
});
