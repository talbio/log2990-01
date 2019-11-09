import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
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

const DRAWING_SERVICES = [
  RectangleGeneratorService,
  EllipseGeneratorService,
  EmojiGeneratorService,
  PencilGeneratorService,
  BrushGeneratorService,
  ColorApplicatorService,
  LineGeneratorService,
  EyedropperService,
  ColorService,
  MousePositionService,
  ObjectSelectorService,
  GridTogglerService,
  PolygonGeneratorService,
];

fdescribe('DrawingViewComponent', () => {
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

  it('should react properly to cut, copy and delete', () => {
    // Create the work-zone
    // tslint:disable-next-line: no-string-literal
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    selector.SVGArray.push(workChilds[2] as SVGElement);

    const itemToBeCut = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    // The clipboard contains the cut element and the canvas does not
    expect(workChilds.length).toEqual(2);
    expect(clipboardService.memorizedAction).toContain(itemToBeCut);

    svgHandle.innerHTML +=
    `<rect id="rect1"
        x="200" data-start-x="200"
        y="200" data-start-y="200"
        width="100" height="250" stroke="red" stroke-width="1"
        fill="pink"></rect>`;
    const itemToBeCopied = workChilds[3] as SVGElement;
    selector.SVGArray.push(workChilds[3] as SVGElement);
    clipboardService.copy();
    // The clipboard contains the item copied
    expect(clipboardService.memorizedAction).toContain(itemToBeCopied);

    svgHandle.innerHTML +=
    `<rect id="rect2"
        x="400" data-start-x="400"
        y="100" data-start-y="100"
        width="100" height="50" stroke="yellow" stroke-width="1"
        fill="pink"></rect>`;
    selector.SVGArray.push(workChilds[4] as SVGElement);
    clipboardService.delete();
    // The clipboard contains only one element and it is not the one that was deleted
    expect(clipboardService.memorizedAction).toContain(itemToBeCopied);
    expect(clipboardService.memorizedAction.length).toEqual(1);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (paste)', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;
    // const polygonGen = fixture.debugElement.injector.get(PolygonGeneratorService);
    // const mouse = fixture.debugElement.injector.get(MousePositionService);
    // const mouseDownEvent = new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 });
    // const movedX = 200;
    // const movedY = 200;
    // const mouseMoveEvent = new MouseEvent('mousemove', { button: 0, clientX: 200, clientY: 200 });
    // mouse.canvasMousePositionX = movedX;
    // mouse.canvasMousePositionY = movedY;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    // component.onMouseDown(mouseDownEvent);
    // component.onMouseMove(mouseMoveEvent);
    // component.onMouseUp();
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    clipboardService.paste();
    clipboardService.paste();

    expect(workChilds.length).toEqual(4);
    expect(workChilds[2]).toEqual(itemToBeCut);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas and not affect the clipboard (paste)', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    const nbChildrenBeforePaste = workChilds.length;
    clipboardService.paste();

    // The paste added a child on the canvas, which is the one selected and the clipboard contains still the element selected
    expect(workChilds.length).toBeGreaterThan(nbChildrenBeforePaste);
    expect(workChilds[2]).toEqual(itemToBeCut);
    expect(clipboardService.memorizedAction[0]).toEqual(itemToBeCut);
    expect(clipboardService.memorizedAction.length).toEqual(1);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (duplicate)', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeDuplicated = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeDuplicated);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.duplicate();

    const clone = workChilds[3];
    let isAClone = true;
    if (parseFloat(clone.getAttribute('height')) !== parseFloat(itemToBeDuplicated.getAttribute('height'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('width')) !== parseFloat(itemToBeDuplicated.getAttribute('width'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('fill')) !== parseFloat(itemToBeDuplicated.getAttribute('fill'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('stroke-width')) !== parseFloat(itemToBeDuplicated.getAttribute('stroke-width'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('stroke')) !== parseFloat(itemToBeDuplicated.getAttribute('stroke'))) {
      isAClone = false;
    }
    expect(isAClone).toBe(true);
    // The clipboard is still empty and a slightely displaced clone of the selected element was added
    expect(workChilds.length).toEqual(4);
    expect(workChilds[3]).toEqual(workChilds[2]);
    expect(clipboardService.memorizedAction.length).toEqual(0);
  });

  it('should ', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.duplicate();

    expect(workChilds.length).toEqual(4);
    expect(workChilds[3]).toEqual(workChilds[2]);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (duplicate)', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.duplicate();

    expect(workChilds.length).toEqual(4);
    expect(workChilds[3]).toEqual(workChilds[2]);
  });
});
