import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { ObjectSelectorService } from 'src/app/services/tools/object-selector/object-selector.service';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { BrushGeneratorService } from '../../../services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../../../services/tools/color-applicator/color-applicator.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { EraserService } from '../../../services/tools/eraser/eraser.service';
import { EyedropperService } from '../../../services/tools/eyedropper/eyedropper.service';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { LineGeneratorService } from '../../../services/tools/line-generator/line-generator.service';
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
  EraserService,
  PenGeneratorService,
];
fdescribe('EraserComponent', () => {
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
        {provide: Renderer2, useValue: rendererSpy},
        {provide: ModalManagerService, useValue: modalManagerSpy},
        {provide: HttpClient, useValue: httpClientSpy}, ],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ToolsAttributesBarComponent,
       DrawingViewComponent] } },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be possible to remove only the first drawing from a pile', () => {
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Rectangle;
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const workChilds = svgHandle.children;
  const initialNumberOfChildren = workChilds.length;
  // Setting up the event
  const offsetX = 64;
  const mouseEvent = new MouseEvent('mousedown', {
    button: 0,
    clientX: 10 + offsetX,
    clientY: 10 ,
  });

  const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
  mousePositionService._canvasMousePositionX = 10;
  mousePositionService._canvasMousePositionY = 10;

  // Adding 3 rectangles in the same place
  component.workZoneComponent.onMouseDown(mouseEvent);
  component.workZoneComponent.onMouseDown(mouseEvent);
  component.workZoneComponent.onMouseDown(mouseEvent);
  expect(workChilds.length).toBe(initialNumberOfChildren + 3);

  // erasing
  toolManagerService._activeTool = Tools.Eraser;
  component.workZoneComponent.onMouseDown(mouseEvent);
  component.workZoneComponent.onMouseUp();
  // only one drawing missing
  expect(workChilds.length).toBe(initialNumberOfChildren + 2);
});

  it('should be possible to use eraser as a brush', () => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Rectangle;
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialNumberOfChildren = workChilds.length;
    // Setting up the event
    const offsetX = 64;
    const mouseDown1 = new MouseEvent('mousedown', {
      button: 0,
      clientX: 10 + offsetX,
      clientY: 10 ,
    });
    const mouseDown2 = new MouseEvent('mousedown', {
      button: 0,
      clientX: 15 + offsetX,
      clientY: 15 ,
    });
    const mouseDown3 = new MouseEvent('mousedown', {
      button: 0,
      clientX: 20 + offsetX,
      clientY: 20 ,
    });
    // Adding 3 rectangles in 3 different places
    component.workZoneComponent.onMouseDown(mouseDown1);
    component.workZoneComponent.onMouseDown(mouseDown2);
    component.workZoneComponent.onMouseDown(mouseDown3);
    expect(workChilds.length).toBe(initialNumberOfChildren + 3);

// erasing
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    const mouseMove = new MouseEvent('mousemove', {});
    toolManagerService._activeTool = Tools.Eraser;
    mousePositionService._canvasMousePositionX = 10;
    mousePositionService._canvasMousePositionY = 10;
    component.workZoneComponent.onMouseDown(mouseDown1);
    mousePositionService._canvasMousePositionX = 15;
    mousePositionService._canvasMousePositionY = 15;
    component.workZoneComponent.onMouseMove(mouseMove);
    mousePositionService._canvasMousePositionX = 20;
    mousePositionService._canvasMousePositionY = 20;
    component.workZoneComponent.onMouseMove(mouseMove);
    component.workZoneComponent.onMouseUp();

// all three drawings have been erased
    expect(workChilds.length).toBe(initialNumberOfChildren);
});

// should bring back all erased drawings with undo

// should have red border when approaching eraser

// should be able to set eraser size
});
