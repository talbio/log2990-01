import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { Tools } from '../../../data-structures/Tools';
import { DemoMaterialModule } from '../../../material.module';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { BrushGeneratorService } from '../../../services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../../../services/tools/color-applicator/color-applicator.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { LineGeneratorService } from '../../../services/tools/line-generator/line-generator.service';
import { PencilGeneratorService } from '../../../services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { ModalManagerService } from './../../../services/modal-manager/modal-manager.service';
import { EyedropperService } from './../../../services/tools/eyedropper/eyedropper.service';
import { DrawingViewComponent } from './drawing-view.component';
/* tslint:disable:max-classes-per-file for mocking classes*/
@Component({ selector: 'app-lateral-bar', template: '' })
class LateralBarStubComponent { }
@Component({ selector: 'app-welcome-modal', template: '' })
class WelcomeModalStubComponent { }

const rendererSpy: jasmine.SpyObj<Renderer2> =
  jasmine.createSpyObj('Renderer2', ['selectRootElement']);
const modalManagerSpy: jasmine.SpyObj<ModalManagerService> =
  jasmine.createSpyObj('ModalManagerService', ['showCreateDrawingDialog', 'loadRenderer']);
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
  // Step 1: Arrange
  // Step 1.5: Assert that everything is ok
  // Assert that there are no elements in the SVG
  // Step 2: Execute (do the work to be test)
  // Step 3: Assert that the work was correctly done
  it('should be able to draw an ellipse', () => {
    // Step 1. Select ellipse
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Ellipse;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
    const xInitial = 100;
    const yInitial = 100;
    // Step 2. First click avec xInitial , yInitial
    // Step 2.1 Last click (release) -> save coordinates
    const mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    component.workZoneComponent.onMouseDown(mouseEvent);
    expect(spy).toHaveBeenCalled();
    // Step 3. Expect un <ellipse>
    // Vu qu'une ellipse et un rectangle sont créés, on s'attend à une ellipse comme avant-dernier élément.
    expect(workChilds.length).toEqual(initialChildsLength + 2);
    const ellipseChild = workChilds.item(workChilds.length - 2) as SVGElement;
    expect(ellipseChild.tagName).toEqual('ellipse');
  });

  // const drawEllipseOnCanvas = (svgHandle?: SVGElement, mouseEvent?: MouseEvent) => {

  // };

  // const getLastSvgElement = (svgHandle: SVGElement) => {
  //   return svgHandle.children.item(svgHandle.children.length - 1) as SVGElement;
  // };

  // it('should be able to interacte properly with the color applicator', () => {
  //   const colorService = fixture.debugElement.injector.get(ColorService);
  //   colorService.setPrimaryColor('red');
  //   // Draw an ellipse..
  //   drawEllipseOnCanvas(null, null)

  //   const lastChild = getLastSvgElement(null);
  //   expect(lastChild.getAttribute('fill')).toEqual('red');
  // });

  it('should be able to add an emoji', () => {
  // Select Stamp Tool
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  // Create the work-zone
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const initialChildsLength = svgHandle.children.length;
  const workChilds = svgHandle.children;
  // Setting up the event
  const spy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
  const mouseEvent = new MouseEvent('mousedown', {});
  component.workZoneComponent.onMouseDown(mouseEvent);
  expect(spy).toHaveBeenCalled();
  // Expect an emoji
  expect(workChilds.length).toEqual(initialChildsLength + 1);
  const emoji = workChilds.item(workChilds.length - 1) as SVGElement;
  expect(emoji.tagName).toEqual('image');
});

  it('should be possible to modify an emoji angle with the wheel', () => {
  // Select Stamp Tool
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  // Create the work-zone
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const children = svgHandle.childNodes;
  const wheelSpy = spyOn(component.workZoneComponent, 'onMouseWheel').and.callThrough();
  const wheelEvent = new WheelEvent('mousewheel', {
    deltaY: -500,
  });
  const mouseSpy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
  const mouseEvent = new MouseEvent('mousedown', {});
  component.workZoneComponent.onMouseWheel(wheelEvent);
  component.workZoneComponent.onMouseDown(mouseEvent);
  expect(wheelSpy).toHaveBeenCalled();
  expect(mouseSpy).toHaveBeenCalled();
  const emoji = svgHandle.childNodes[children.length - 2] as Element;
  // tslint:disable-next-line: no-non-null-assertion
  const angle = emoji.getAttribute('transform')!.substr(7, 2) ;
  expect(angle).toEqual('15');
});

  it('shouldnt be possible to enter an angle under 0 or over 360 for the rotation', () => {
  // Select Stamp Tool
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  // Create the work-zone
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const children = svgHandle.childNodes;
  const wheelSpy = spyOn(component.workZoneComponent, 'onMouseWheel').and.callThrough();
  let wheelEvent = new WheelEvent('mousewheel', {
    deltaY: -500,
  });
  const mouseSpy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
  const mouseEvent = new MouseEvent('mousedown', {});
  component.workZoneComponent.onMouseWheel(wheelEvent);
  component.workZoneComponent.onMouseDown(mouseEvent);
  expect(wheelSpy).toHaveBeenCalled();
  expect(mouseSpy).toHaveBeenCalled();
  // It shouldn't be possible to increase the angle over 360
  for (let i = 0; i < 100; i++) {
  component.workZoneComponent.onMouseWheel(wheelEvent);
  }
  component.workZoneComponent.onMouseDown(mouseEvent);
  let emoji = svgHandle.childNodes[children.length - 2] as Element;
  // tslint:disable-next-line: no-non-null-assertion
  let angle = emoji.getAttribute('transform')!.substr(7, 3) ;
  expect(angle).toEqual('360');

  // It shouldn't be possible to lower the angle under 0
  wheelEvent = new WheelEvent('mousewheel', {
    deltaY: 500,
  });
  for (let i = 0; i < 100; i++) {
    component.workZoneComponent.onMouseWheel(wheelEvent);
    }
  component.workZoneComponent.onMouseDown(mouseEvent);
  emoji = svgHandle.childNodes[children.length - 2] as Element;
  // tslint:disable-next-line: no-non-null-assertion
  angle = emoji.getAttribute('transform')!.substr(7, 1) ;
  expect(angle).toEqual('0');
});

  it('should be possible to modify an emoji rotation step from 15 to 1 with the ALT button', () => {
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const children = svgHandle.childNodes;
  const altSpy = spyOn(component.workZoneComponent, 'keyDownEvent').and.callThrough();
  const altEvent = new KeyboardEvent('keydown', {
     key: 'Alt',
   });
  const wheelEvent = new WheelEvent('mousewheel', {
    deltaY: -500,
  });
  const wheelSpy = spyOn(component.workZoneComponent, 'onMouseWheel').and.callThrough();
  const mouseSpy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
  const mouseEvent = new MouseEvent('mousedown', {});
  component.workZoneComponent.keyDownEvent(altEvent);
  component.workZoneComponent.onMouseWheel(wheelEvent);
  component.workZoneComponent.onMouseDown(mouseEvent);
  expect(altSpy).toHaveBeenCalled();
  expect(wheelSpy).toHaveBeenCalled();
  expect(mouseSpy).toHaveBeenCalled();
  const emoji = svgHandle.childNodes[children.length - 2] as Element;
  // tslint:disable-next-line: no-non-null-assertion
  const angle = emoji.getAttribute('transform')!.substr(7, 2) ;
  expect(angle).toEqual('1 ');
});
  it('should be impossible to add an emoji if no emoji is selected', () => {
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  const emojiService = fixture.debugElement.injector.get(EmojiGeneratorService);
  emojiService._emoji = '';
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const children = svgHandle.childNodes;
  const initialChildsLength = svgHandle.children.length;
  const mouseEvent = new MouseEvent('mousedown', {});
  component.workZoneComponent.onMouseDown(mouseEvent);
  expect(children.length).toEqual(initialChildsLength);
});
});
