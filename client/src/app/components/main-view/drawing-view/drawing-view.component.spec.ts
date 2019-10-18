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
    // console.log(svgHandle);
    // Step 3. Expect un <ellipse>
    // Vu qu'une ellipse et un rectangle sont créés, on s'attend à une ellipse comme avant-dernier élément.
    expect(workChilds.length).toEqual(initialChildsLength + 2);
    const ellipseChild = workChilds.item(workChilds.length - 2) as SVGElement;
    expect(ellipseChild.tagName).toEqual('ellipse');
  });

  // This returns the child at 'position' from the canvas's last position (1 for last)
  const getLastSvgElement = (svgHandle: SVGElement, position: number) => {
    return svgHandle.children.item(svgHandle.children.length - position) as SVGElement;
  };

  it('should be able to draw a polyline', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onLeftClick').and.callThrough();
    const xInitial = 100;
    const yInitial = 100;
    // Step 2. First click avec xInitial , yInitial
    // Step 2.1 Last click (release) -> save coordinates
    const mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    // Also change the positions on the mouse position service
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionX = xInitial;
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionY = yInitial;
    component.workZoneComponent.onLeftClick(mouseEvent);
    expect(spy).toHaveBeenCalled();
    // Step 3. Expect un <polyline>
    // Since line was just created it should be our last element
    expect(workChilds.length).toEqual(initialChildsLength + 1);
    const polyLineChild = getLastSvgElement(svgHandle, 1);
    expect(polyLineChild.tagName).toEqual('polyline');
  });

  // This function uses the code of the first test to draw a polyline on the canvas
  const drawPolylineOnCanvas = () => {

    const xInitial = 100;
    const yInitial = 100;

    const mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    // Also change the positions on the mouse position service
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionX = xInitial;
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionY = yInitial;
    component.workZoneComponent.onLeftClick(mouseEvent);
  };

  const addClickToCanvas = (mouseEvent: MouseEvent) => {
    // Change the positions on the mouse position service
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionX = mouseEvent.clientX;
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionY = mouseEvent.clientY;
    // Click the canvas
    component.workZoneComponent.onLeftClick(mouseEvent);
  };

  it('should be able to draw a line from one point to the next with a click after the initial click', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onLeftClick').and.callThrough();
    drawPolylineOnCanvas();
    expect(spy).toHaveBeenCalled();
    // Add new click
    const newX = 200;
    const newY = 200;
    const newMouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: newX,
      clientY: newY,
    });

    addClickToCanvas(newMouseEvent);
    expect(spy).toHaveBeenCalled();
    // Step 3. Expect a <polyline>
    // Since polyline was just created it should be the last element
    expect(workChilds.length).toEqual(initialChildsLength + 1);
    const polyLineChild = getLastSvgElement(svgHandle, 1);
    expect(polyLineChild.tagName).toEqual('polyline');
    // The 'points' attribute should contain the initial point and the new point
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 200,200');
  });

  it('should be able to show next line with mousemove', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onMouseMove').and.callThrough();
    drawPolylineOnCanvas();
    // Add new click
    const newX = 200;
    const newY = 200;
    const newMouseEvent = new MouseEvent('mousemove', {
      clientX: newX,
      clientY: newY,
    });
    // update mouse position on the service
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionX = newX;
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionY = newY;
    component.workZoneComponent.onMouseMove(newMouseEvent);
    expect(spy).toHaveBeenCalled();
    // Step 3. Expect a <polyline>
    // Since polyline was just created it should be the last element
    expect(workChilds.length).toEqual(initialChildsLength + 1);
    const polyLineChild = getLastSvgElement(svgHandle, 1);
    expect(polyLineChild.tagName).toEqual('polyline');
    // The 'points' attribute should contain the initial point and the current mouse position
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 200,200');
  });

  it('should be able to delete last line with backspace and immediately update', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onLeftClick').and.callThrough();
    drawPolylineOnCanvas();
    expect(spy).toHaveBeenCalled();
    // Add new click
    let newX = 200;
    let newY = 200;
    const newMouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: newX,
      clientY: newY,
    });

    addClickToCanvas(newMouseEvent);
    expect(spy).toHaveBeenCalled();
    // Expect a <polyline>
    // Since polyline was just created it should be the last element
    expect(workChilds.length).toEqual(initialChildsLength + 1);
    const polyLineChild = getLastSvgElement(svgHandle, 1);
    expect(polyLineChild.tagName).toEqual('polyline');
    // The 'points' attribute should contain the initial point and the new point
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 200,200');
    // Move mouse to verify line updates as soon as escape is pressed
    newX = 250;
    newY = 250;
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionX = newX;
    component.workZoneComponent._toolManager._mousePosition._canvasMousePositionY = newY;
    // Now delete the last point by simulating a backspace press
    component.workZoneComponent._toolManager.backSpacePress();
    // Step 3.
    // Since last point is deleted and mouse has moved, the points attribute should show initial point and current mouse position
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 250,250');
    // You should not be able to delete first point with a backspace, so subsequent calls should have the same value
    component.workZoneComponent._toolManager.backSpacePress();
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 250,250');
  });

  it('should be able to delete entire polyline with escape and immediately update', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onLeftClick').and.callThrough();
    drawPolylineOnCanvas();
    expect(spy).toHaveBeenCalled();

    // Expect a <polyline>
    // Since polyline was just created it should be the last element
    expect(workChilds.length).toEqual(initialChildsLength + 1);
    const polyLineChild = getLastSvgElement(svgHandle, 1);
    expect(polyLineChild.tagName).toEqual('polyline');
    // Verify that it is indeed a child of svgHandle to verify its deletion later
    expect(svgHandle.contains(polyLineChild)).toBeTruthy();
    // Now delete the whole polyline by simulating an escape press
    component.workZoneComponent._toolManager.escapePress();
    // Step 3.
    // The created polyline should have been removed, so we should have the same number of children as initial
    expect(workChilds.length).toEqual(initialChildsLength);
    // The deleted child should be removed, so the handler should contain it anymore
    expect(svgHandle.contains(polyLineChild)).toBeFalsy();
    // You should not be able to delete when a line isn't being made, so subsequent calls should have no effect
    component.workZoneComponent._toolManager.escapePress();
    expect(workChilds.length).toEqual(initialChildsLength);
  });
  // it('should be able to interact properly with the color applicator', () => {
  //   const colorService = fixture.debugElement.injector.get(ColorService);
  //   colorService.setPrimaryColor('red');
  //   // Draw an ellipse..
  //   drawEllipseOnCanvas(null, null)

  //   const lastChild = getLastSvgElement(null);
  //   expect(lastChild.getAttribute('fill')).toEqual('red');
  // });
});
