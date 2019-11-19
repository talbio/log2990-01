import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RendererSingleton } from 'src/app/services/renderer-singleton';
import { AerosolGeneratorService } from 'src/app/services/tools/aerosol-generator/aerosol-generator.service';
import { EraserService } from 'src/app/services/tools/eraser/eraser.service';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
import { Tools } from '../../../data-structures/tools';
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
import { FeatherPenGeneratorService } from '../../../services/tools/feather-Pen-generator/feather-Pen-generator.service';
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
// import { UndoRedoService } from './../../../services/undo-redo/undo-redo.service';
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
  AerosolGeneratorService,
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
  FeatherPenGeneratorService,
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
          DrawingViewComponent],
      },
    },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  const drawFeatherPathOnCanvas = (mouse: MousePositionService, feather: FeatherPenGeneratorService) => {
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    feather.createElement(['black', 'black']);
    mouse.canvasMousePositionX = 200;
    mouse.canvasMousePositionY = 250;
    feather.updateElement();
    feather.finishElement();
  };

  it('should draw with featherPen on canvas', () => {
    const svgHandle = RendererSingleton.canvas as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManager = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const feather = fixture.debugElement.injector.get(FeatherPenGeneratorService);
    toolManager._activeTool = Tools.Feather;

    drawFeatherPathOnCanvas(mouse, feather);

    expect(workChilds[workChilds.length - 1].id).toBe('featherPenPath0');
  });

  it(`should change the angle of the feather with a mouse's wheel mouvement`, () => {
    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    const feather = fixture.debugElement.injector.get(FeatherPenGeneratorService);
    toolManagerService._activeTool = Tools.Feather;

    const initialAngle = feather.angle;

    const wheelEvent = new WheelEvent('mousewheel', {
      deltaY: -1,
    });

    component.workZoneComponent.onMouseWheel(wheelEvent);

    // Verify that the angle really changed and that the initial step is of 15
    expect(feather.angle).toEqual(initialAngle + 15);
  });

  it(`should change the step of changes to the angle with the wheel when alt is used`, () => {
    // Setting up the event
    const toolManager = fixture.debugElement.injector.get(ToolManagerService);
    const feather = fixture.debugElement.injector.get(FeatherPenGeneratorService);
    toolManager._activeTool = Tools.Feather;

    const initialAngle = feather.angle;

    const wheelEvent = new WheelEvent('mousewheel', {
      deltaY: -1,
    });
    toolManager.changeElementAltDown();
    component.workZoneComponent.onMouseWheel(wheelEvent);
    // When alt is used
    expect(feather.angle).toEqual(initialAngle + 1);
    const newAngle = feather.angle;

    toolManager.changeElementAltUp();
    component.workZoneComponent.onMouseWheel(wheelEvent);
    // When alt is unused
    expect(feather.angle).toEqual(newAngle + 15);
  });

  it(`should infinitely increase or decrease the angle (go full circle)`, () => {
    // Setting up the event
    const toolManager = fixture.debugElement.injector.get(ToolManagerService);
    const feather = fixture.debugElement.injector.get(FeatherPenGeneratorService);
    toolManager._activeTool = Tools.Feather;

    const forcedFloorAngle = 0;
    const forcedCeilingAngle = 179;
    feather.angle = forcedFloorAngle;

    // A positive delta is suppose to reduce the angle,
    // but we'll expect the result to be bigger when we encounter the floor
    const wheelEvent1 = new WheelEvent('mousewheel', {
      deltaY: 1,
    });
    component.workZoneComponent.onMouseWheel(wheelEvent1);
    expect(feather.angle).toEqual(forcedCeilingAngle);

    // A negative delta is suppose to increase the angle,
    // but we'll expect the result to be smaller when we reach the ceiling
    const wheelEvent2 = new WheelEvent('mousewheel', {
      deltaY: -1,
    });
    component.workZoneComponent.onMouseWheel(wheelEvent2);
    expect(feather.angle).toEqual(forcedFloorAngle);
  });

  it(`should be able to change angle during a feather stroke`, () => {
    // Setting up the event
    const toolManager = fixture.debugElement.injector.get(ToolManagerService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const feather = fixture.debugElement.injector.get(FeatherPenGeneratorService);
    toolManager._activeTool = Tools.Feather;

    const initialAngle = feather.angle;

    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    feather.createElement(['black', 'black']);
    mouse.canvasMousePositionX = 200;
    mouse.canvasMousePositionY = 250;
    feather.updateElement();
    // Should reduce the angle
    const wheelEvent = new WheelEvent('mousewheel', {
      deltaY: 1,
    });
    component.workZoneComponent.onMouseWheel(wheelEvent);
    mouse.canvasMousePositionX = 400;
    mouse.canvasMousePositionY = 300;
    feather.updateElement();
    feather.finishElement();

    expect(feather.angle).toBeLessThan(initialAngle);
  });
});
