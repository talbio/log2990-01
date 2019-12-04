import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderChange } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { LineDashStyle, LineJoinStyle } from 'src/app/data-structures/line-styles';
import { PlotType } from 'src/app/data-structures/plot-type';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { Tools } from '../../../data-structures/tools';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { EyedropperService } from '../../../services/tools/eyedropper/eyedropper.service';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { LineGeneratorService } from '../../../services/tools/line-generator/line-generator.service';
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
import { DRAWING_SERVICES } from './integration-tests/integration-tests-environment.spec';

/* tslint:disable:max-classes-per-file for mocking classes*/
/* tslint:disable:no-string-literal for testing purposes*/
@Component({ selector: 'app-lateral-bar', template: '' })
class LateralBarStubComponent { }
@Component({ selector: 'app-welcome-modal', template: '' })
class WelcomeModalStubComponent { }

export const STUB_COMPONENTS = [LateralBarStubComponent, WelcomeModalStubComponent];
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
  // This takes 2 x and y coordinates and draws a shape from point 1 to 2 on the canvas
  const drawShapeOnCanvas = (x1: number, y1: number, x2: number, y2: number, toolType: Tools) => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = toolType;
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = x1;
    mousePositionService.canvasMousePositionY = y1;
    component.workZoneComponent.onMouseDown();
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: x2,
      clientY: y2,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = x2;
    mousePositionService.canvasMousePositionY = y2;
    component.workZoneComponent.onMouseMove(mouseEvent);
    component.workZoneComponent.onMouseUp();
  };

  // This returns the child at 'position' from the canvas's last position (1 for last)
  const getLastSvgElement = (svgHandle: SVGElement, position: number) => {
    return svgHandle.children.item(svgHandle.children.length - position) as SVGElement;
  };

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
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    mouse.canvasMousePositionX = xInitial;
    mouse.canvasMousePositionY = yInitial;
    component.workZoneComponent.onMouseDown();
    expect(spy).toHaveBeenCalled();
    // Step 3. Expect un <ellipse>
    // Vu qu'une ellipse et un rectangle sont créés, on s'attend à une ellipse comme avant-dernier élément.
    expect(workChilds.length).toEqual(initialChildsLength + 2);
    const ellipseChild = getLastSvgElement(svgHandle, 2) as SVGElement;
    expect(ellipseChild.tagName).toEqual('ellipse');
  });

  it('should have the ellipse take the maximal space inside the rectangle created by the mouse drag and be updated in real time', () => {
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
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    mouse.canvasMousePositionX = xInitial;
    mouse.canvasMousePositionY = yInitial;
    component.workZoneComponent.onMouseDown();
    expect(spy).toHaveBeenCalled();
    const newX = 200;
    const newY = 200;
    const mouseEvent = new MouseEvent('mousemove', {
    clientX: newX,
    clientY: newY,
    });
    // update mouse position on the service
    mouse.canvasMousePositionX = newX;
    mouse.canvasMousePositionY = newY;
    component.workZoneComponent.onMouseMove(mouseEvent);
    // Step 3. Expect a <rect> and a <ellipse>
    // ellipse and rectangle should be created as the last children
    expect(workChilds.length).toEqual(initialChildsLength + 2);
    const ellipseChild = getLastSvgElement(svgHandle, 2) as SVGElement;
    const rectangleChild = getLastSvgElement(svgHandle, 1) as SVGElement;
    expect(ellipseChild.tagName).toEqual('ellipse');
    expect(rectangleChild.tagName).toEqual('rect');
    // expect the top and bottom of the ellipse to match the top and bottom of the rectangle
    const rectangleTop = parseFloat(rectangleChild.getAttribute('y') as string);
    const rectangleBottom = rectangleTop + parseFloat(rectangleChild.getAttribute('height') as string);
    const ellipseTop = parseFloat(ellipseChild.getAttribute('cy') as string) - parseFloat(ellipseChild.getAttribute('ry') as string);
    const ellipseBottom = parseFloat(ellipseChild.getAttribute('cy') as string) + parseFloat(ellipseChild.getAttribute('ry') as string);
    expect(ellipseTop).toEqual(rectangleTop);
    expect(ellipseBottom).toEqual(rectangleBottom);
    // expect the left and right side of the ellipse to match those of the rectangle
    const rectangleLeft = parseFloat(rectangleChild.getAttribute('x') as string);
    const rectangleRight = rectangleLeft + parseFloat(rectangleChild.getAttribute('width') as string);
    const ellipseLeft = parseFloat(ellipseChild.getAttribute('cx') as string) - parseFloat(ellipseChild.getAttribute('rx') as string);
    const ellipseRight = parseFloat(ellipseChild.getAttribute('cx') as string) + parseFloat(ellipseChild.getAttribute('rx') as string);
    expect(ellipseLeft).toEqual(rectangleLeft);
    expect(ellipseRight).toEqual(rectangleRight);
    // The shapes should be updated in real time, therefore the right and bottom side should match the mouse position of 200,200
    expect(ellipseRight).toEqual(200);
    expect(ellipseBottom).toEqual(200);
    // call a mouseup event to finish the ellipse and remove the rectangle
    component.workZoneComponent.onMouseUp();
    expect(svgHandle.contains(rectangleChild)).toBeFalsy();
  });

  it('should have the ellipse be drawn using the primary and secondary colors', () => {
    // Step 1. Select ellipse
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Ellipse;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    // Set an initial color and change it
    const colorService = fixture.debugElement.injector.get(ColorService);
    const firstColor = 'rgba(100,100,100,1)';
    colorService.setPrimaryColor(firstColor);
    colorService.assignPrimaryColor();
    colorService.setSecondaryColor(firstColor);
    colorService.assignSecondaryColor();
    const initialPrimaryColor = colorService.getPrimaryColor();
    const initialSecondaryColor = colorService.getSecondaryColor();
    const newColor = 'rgba(200,200,200,1)';
    colorService.setPrimaryColor(newColor);
    colorService.assignPrimaryColor();
    colorService.setSecondaryColor(newColor);
    colorService.assignSecondaryColor();
    const newPrimaryColor = colorService.getPrimaryColor();
    const newSecondaryColor = colorService.getSecondaryColor();
    expect(initialPrimaryColor).not.toBe(newPrimaryColor);
    expect(initialSecondaryColor).not.toBe(newSecondaryColor);
    // create the ellipse and make sure it has a plot type that allows both colors to be shown
    const ellipseGeneratorService = fixture.debugElement.injector.get(EllipseGeneratorService);
    ellipseGeneratorService.plotType = PlotType.FullWithContour;
    drawShapeOnCanvas(100, 100, 200, 200, Tools.Ellipse);
    // ellipse  should be created as the last child
    const ellipseChild = getLastSvgElement(svgHandle, 1) as SVGElement;
    // expect the ellipse to have fill as the primary color and stroke as the secondary color
    expect(ellipseChild.getAttribute('fill')).toEqual(newPrimaryColor);
    expect(ellipseChild.getAttribute('stroke')).toEqual(newSecondaryColor);
  });

  it('should have the ellipse plot type and stroke width be changeable', () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    // Create a first ellipse with plot type only contour and a stroke width
    const ellipseGeneratorService = fixture.debugElement.injector.get(EllipseGeneratorService);
    ellipseGeneratorService.plotType = PlotType.Contour;
    ellipseGeneratorService.strokeWidth = 10;
    drawShapeOnCanvas(100, 100, 200, 200, Tools.Ellipse);
    // ellipse  should be created as the last child
    const firstEllipseChild = getLastSvgElement(svgHandle, 1) as SVGElement;
    // expect the ellipse to the right stroke-width as well as the stroke visible but not the fill
    expect(firstEllipseChild.getAttribute('stroke-width')).toEqual('10');
    expect(firstEllipseChild.getAttribute('fill')).toEqual('transparent');
    expect(firstEllipseChild.getAttribute('stroke')).not.toEqual('transparent');
    // Create a second ellipse with plot type only fill and a different stroke width
    ellipseGeneratorService.plotType = PlotType.Full;
    ellipseGeneratorService.strokeWidth = 15;
    drawShapeOnCanvas(100, 100, 200, 200, Tools.Ellipse);
    // ellipse  should be created as the last child
    const secondEllipseChild = getLastSvgElement(svgHandle, 1) as SVGElement;
    // expect the ellipse to the right stroke-width as well as the stroke visible but not the fill
    expect(secondEllipseChild.getAttribute('stroke-width')).toEqual('15');
    expect(secondEllipseChild.getAttribute('fill')).not.toEqual('transparent');
    expect(secondEllipseChild.getAttribute('stroke')).toEqual('transparent');
    // Create a first ellipse with plot type fill and contour and a different stroke width
    ellipseGeneratorService.plotType = PlotType.FullWithContour;
    ellipseGeneratorService.strokeWidth = 20;
    drawShapeOnCanvas(100, 100, 200, 200, Tools.Ellipse);
    // ellipse  should be created as the last child
    const thirdEllipseChild = getLastSvgElement(svgHandle, 1) as SVGElement;
    // expect the ellipse to the right stroke-width as well as the stroke visible but not the fill
    expect(thirdEllipseChild.getAttribute('stroke-width')).toEqual('20');
    expect(thirdEllipseChild.getAttribute('fill')).not.toEqual('transparent');
    expect(thirdEllipseChild.getAttribute('stroke')).not.toEqual('transparent');
  });

  it('should be able to make ellipse a circle on shift press and return to ellipse on shift up', () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    // Start to create an ellipse
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Ellipse;
    const initialX = 100;
    const initialY = 100;
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = initialX;
    mousePositionService.canvasMousePositionY = initialY;
    component.workZoneComponent.onMouseDown();
    // make the mouseMove position unequal so we can test whether the ellipse changes into a circle
    const newX = 200;
    const newY = 150;
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: newX,
      clientY: newY,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = newX;
    mousePositionService.canvasMousePositionY = newY;
    component.workZoneComponent.onMouseMove(mouseEvent);

    // ellipse  should be created as the last child
    const ellipseChild = getLastSvgElement(svgHandle, 2) as SVGElement;
    // verify that height and width are unequal
    let ellipseLeft = parseFloat(ellipseChild.getAttribute('cx') as string) - parseFloat(ellipseChild.getAttribute('rx') as string);
    let ellipseRight = parseFloat(ellipseChild.getAttribute('cx') as string) + parseFloat(ellipseChild.getAttribute('rx') as string);

    let ellipseWidth = ellipseRight - ellipseLeft;
    let ellipseTop = parseFloat(ellipseChild.getAttribute('cy') as string) - parseFloat(ellipseChild.getAttribute('ry') as string);
    let ellipseBottom = parseFloat(ellipseChild.getAttribute('cy') as string) + parseFloat(ellipseChild.getAttribute('ry') as string);
    let ellipseHeight = ellipseBottom - ellipseTop;
    expect(ellipseHeight).not.toEqual(ellipseWidth);

    // press shift to make it a circle
    toolManagerService.changeElementShiftDown();
    ellipseLeft = parseFloat(ellipseChild.getAttribute('cx') as string) - parseFloat(ellipseChild.getAttribute('rx') as string);
    ellipseRight = parseFloat(ellipseChild.getAttribute('cx') as string) + parseFloat(ellipseChild.getAttribute('rx') as string);
    ellipseWidth = ellipseRight - ellipseLeft;
    ellipseTop = parseFloat(ellipseChild.getAttribute('cy') as string) - parseFloat(ellipseChild.getAttribute('ry') as string);
    ellipseBottom = parseFloat(ellipseChild.getAttribute('cy') as string) + parseFloat(ellipseChild.getAttribute('ry') as string);
    ellipseHeight = ellipseBottom - ellipseTop;
    expect(ellipseHeight).toEqual(ellipseWidth);

    // change it back to an ellipse by releasing shift
    toolManagerService.changeElementShiftUp();
    ellipseLeft = parseFloat(ellipseChild.getAttribute('cx') as string) - parseFloat(ellipseChild.getAttribute('rx') as string);
    ellipseRight = parseFloat(ellipseChild.getAttribute('cx') as string) + parseFloat(ellipseChild.getAttribute('rx') as string);
    ellipseWidth = ellipseRight - ellipseLeft;
    ellipseTop = parseFloat(ellipseChild.getAttribute('cy') as string) - parseFloat(ellipseChild.getAttribute('ry') as string);
    ellipseBottom = parseFloat(ellipseChild.getAttribute('cy') as string) + parseFloat(ellipseChild.getAttribute('ry') as string);
    ellipseHeight = ellipseBottom - ellipseTop;
    expect(ellipseHeight).not.toEqual(ellipseWidth);
  });

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
    const mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    // Also change the positions on the mouse position service
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = xInitial;
    mousePositionService.canvasMousePositionY = yInitial;
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
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    const xInitial = 100;
    const yInitial = 100;

    const mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    // Also change the positions on the mouse position service
    mousePositionService.canvasMousePositionX = xInitial;
    mousePositionService.canvasMousePositionY = yInitial;
    component.workZoneComponent.onLeftClick(mouseEvent);
  };

  const addClickToCanvas = (mouseEvent: MouseEvent) => {
    // Change the positions on the mouse position service
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = mouseEvent.clientX;
    mousePositionService.canvasMousePositionY = mouseEvent.clientY;
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
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = newX;
    mousePositionService.canvasMousePositionY = newY;
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
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    newX = 250;
    newY = 250;
    mousePositionService.canvasMousePositionX = newX;
    mousePositionService.canvasMousePositionY = newY;
    // Now delete the last point by simulating a backspace press
    toolManagerService.backSpacePress();
    // Step 3.
    // Since last point is deleted and mouse has moved, the points attribute should show initial point and current mouse position
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 250,250');
    // You should not be able to delete first point with a backspace, so subsequent calls should have the same value
    toolManagerService.backSpacePress();
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
    toolManagerService.escapePress();
    // Step 3.
    // The created polyline should have been removed, so we should have the same number of children as initial
    expect(workChilds.length).toEqual(initialChildsLength);
    // The deleted child should be removed, so the handler should contain it anymore
    expect(svgHandle.contains(polyLineChild)).toBeFalsy();
    // You should not be able to delete when a line isn't being made, so subsequent calls should have no effect
    toolManagerService.escapePress();
    expect(workChilds.length).toEqual(initialChildsLength);
  });

  it('should be finish line with doubleclick', () => {
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
    let newMouseEvent = new MouseEvent('click', {
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

    // Since double click also triggers the click function twice, we add a click call at the same location
    // We also add a buffer click since we usually have an extra current line being shown.
    // The function that finishes the line will get rid of those two points
    addClickToCanvas(newMouseEvent);
    addClickToCanvas(newMouseEvent);
    // Now end the line creation by simulating a doubleclick done right after the click of the second line
    newMouseEvent = new MouseEvent('dblclick', {
      button: 0,
      clientX: newX,
      clientY: newY,
      shiftKey: false,
    });
    component.workZoneComponent.onDoubleClick(newMouseEvent);
    // Step 3.
    // The created polyline should be finished, so we can attempt to remove it with escape as proven in previous test
    toolManagerService.escapePress();
    // Since the line creation was over, the escape press should not have removed the polyline
    expect(svgHandle.contains(polyLineChild)).toBeTruthy();
    // The final points attribute should be the same as after the click
    expect(polyLineChild.getAttribute('points')).toEqual('100,100 200,200');
  });

  it('should be finish line and complete the shape with doubleclick and shift key pressed', () => {
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
    let newMouseEvent = new MouseEvent('click', {
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

    // Since double click also triggers the click function twice, we add a click call at the same location
    // We also add a buffer click since we usually have an extra current line being shown.
    // The function that finishes the line will get rid of those two points
    addClickToCanvas(newMouseEvent);
    addClickToCanvas(newMouseEvent);
    // Now end the line creation by simulating a doubleclick done right after the click of the second line
    // The event has shiftKey set to true to simulate a shift key press
    newMouseEvent = new MouseEvent('dblclick', {
      button: 0,
      clientX: newX,
      clientY: newY,
      shiftKey: true,
    });
    component.workZoneComponent.onDoubleClick(newMouseEvent);
    // Step 3.
    // The created polyline should be finished, so we can attempt to remove it with escape as proven in previous test
    toolManagerService.escapePress();
    // Since the line creation was over, the escape press should not have removed the polyline
    expect(svgHandle.contains(polyLineChild)).toBeTruthy();
    // The polyline should have a point added to the end equal to its first point, which is 100,100
    expect(polyLineChild.getAttribute('points')).toBe('100,100 200,200 100,100');
  });

  it('should be able to change strokewidth', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    // Setting up the event
    const lineGeneratorService = fixture.debugElement.injector.get(LineGeneratorService);
    const initialStrokeWidth = lineGeneratorService._strokeWidth;
    lineGeneratorService._strokeWidth = 20;
    drawPolylineOnCanvas();

    const polyLineChild = getLastSvgElement(svgHandle, 1);
    // the stroke-width should be equal to 20, which should be different from the initial stroke-width
    expect(polyLineChild.getAttribute('stroke-width')).toEqual('20');
    expect(polyLineChild.getAttribute('stroke-width')).not.toEqual(initialStrokeWidth as unknown as string);
  });

  it('should be able to change junction point diameter', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    // Setting up the event
    const lineGeneratorService = fixture.debugElement.injector.get(LineGeneratorService);
    lineGeneratorService._markerDiameter = 20;
    drawPolylineOnCanvas();
    const polyLineChild = getLastSvgElement(svgHandle, 1);
    // Find the marker created in relation to the polyLineChild
    const markers = fixture.debugElement.nativeElement.querySelector(`#${polyLineChild.id}marker`);
    // the radius of the circle within the marker should be equal to the new marker diameter, which is 20
    expect(markers.children[0].getAttribute('r')).toEqual('20');
  });

  it('should be able to change line type', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    const lineGeneratorService = fixture.debugElement.injector.get(LineGeneratorService);

    // Set it as default (continuous)
    lineGeneratorService._lineDashStyle = LineDashStyle.Continuous;
    drawPolylineOnCanvas();

    let polyLineChild = getLastSvgElement(svgHandle, 1);
    // the stroke-linecap should be equal to butt and dasharray should be equal to none
    expect(polyLineChild.getAttribute('stroke-linecap')).toEqual('butt');
    expect(polyLineChild.getAttribute('stroke-dasharray')).toEqual('none');

    // End line
    const newX = 200;
    const newY = 200;
    const doubleClick = new MouseEvent('dblclick', {
      button: 0,
      clientX: newX,
      clientY: newY,
      shiftKey: false,
    });
    component.workZoneComponent.onDoubleClick(doubleClick);

    // Set it as dashed
    lineGeneratorService._lineDashStyle = LineDashStyle.Dashed;
    drawPolylineOnCanvas();

    polyLineChild = getLastSvgElement(svgHandle, 1);
    // the stroke-linecap should be equal to butt and dasharray should be equal to `${strokeWidth * 2}, ${strokeWidth}`
    expect(polyLineChild.getAttribute('stroke-linecap')).toEqual('butt');
    expect(polyLineChild.getAttribute('stroke-dasharray'))
    .toEqual(`${lineGeneratorService._strokeWidth * 2}, ${lineGeneratorService._strokeWidth}`);

    // End line
    component.workZoneComponent.onDoubleClick(doubleClick);

    // Set it as dotted
    lineGeneratorService._lineDashStyle = LineDashStyle.Dotted;
    drawPolylineOnCanvas();

    polyLineChild = getLastSvgElement(svgHandle, 1);
    // the stroke-linecap should be equal to round and dasharray should be equal to `1, ${strokeWidth  * 2}`
    expect(polyLineChild.getAttribute('stroke-linecap')).toEqual('round');
    expect(polyLineChild.getAttribute('stroke-dasharray'))
    .toEqual(`1, ${lineGeneratorService._strokeWidth * 2}`);

    // End line

  });

  it('should be able to change join type', () => {
    // Step 1. Select line
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    const lineGeneratorService = fixture.debugElement.injector.get(LineGeneratorService);

    // Set it as default (arrondi)
    lineGeneratorService._lineJoinStyle = LineJoinStyle.Round;
    drawPolylineOnCanvas();

    let polyLineChild = getLastSvgElement(svgHandle, 1);
    // the stroke-linejoin should be equal to round and marker-start, marker-mid and marker-end should be equal to none
    expect(polyLineChild.getAttribute('stroke-linejoin')).toEqual('round');
    expect(polyLineChild.getAttribute('marker-start')).toBeNull();
    expect(polyLineChild.getAttribute('marker-mid')).toBeNull();
    expect(polyLineChild.getAttribute('marker-end')).toBeNull();

    // End line
    const newX = 200;
    const newY = 200;
    const doubleClick = new MouseEvent('dblclick', {
      button: 0,
      clientX: newX,
      clientY: newY,
      shiftKey: false,
    });
    component.workZoneComponent.onDoubleClick(doubleClick);

    // Set it as angled
    lineGeneratorService._lineJoinStyle = LineJoinStyle.Angled;
    drawPolylineOnCanvas();

    polyLineChild = getLastSvgElement(svgHandle, 1);
    // the stroke-linejoin should be equal to miter and marker-start, marker-mid and marker-end should be null
    expect(polyLineChild.getAttribute('stroke-linejoin')).toEqual('miter');
    expect(polyLineChild.getAttribute('marker-start')).toBeNull();
    expect(polyLineChild.getAttribute('marker-mid')).toBeNull();
    expect(polyLineChild.getAttribute('marker-end')).toBeNull();

    // End line
    component.workZoneComponent.onDoubleClick(doubleClick);

    // Set it as with points
    lineGeneratorService._lineJoinStyle = LineJoinStyle.WithPoints;
    drawPolylineOnCanvas();

    polyLineChild = getLastSvgElement(svgHandle, 1);
    expect(polyLineChild.getAttribute('stroke-linejoin')).toEqual('round');
    const markerId = `url(#${polyLineChild.id}marker)`;
    expect(polyLineChild.getAttribute('marker-start')).toEqual(markerId);
    expect(polyLineChild.getAttribute('marker-mid')).toEqual(markerId);
    expect(polyLineChild.getAttribute('marker-end')).toEqual(markerId);

    // End line

  });

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
    component.workZoneComponent.onMouseDown();
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
    component.workZoneComponent.onMouseWheel(wheelEvent);
    component.workZoneComponent.onMouseDown();
    expect(wheelSpy).toHaveBeenCalled();
    expect(mouseSpy).toHaveBeenCalled();
    const emoji = svgHandle.childNodes[children.length - 1] as Element;
    const matrix: string = emoji.getAttribute('transform') as string;
    expect(matrix).not.toEqual('matrix(1,0,0,1,0,0)');
  });

  it('shouldnt be possible to enter an angle under 0 or over 360 for the rotation', () => {
  // Select Stamp Tool
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  // Create the work-zone
  const wheelSpy = spyOn(component.workZoneComponent, 'onMouseWheel').and.callThrough();
  let wheelEvent = new WheelEvent('mousewheel', {
    deltaY: -500,
  });
  const mouseSpy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
  component.workZoneComponent.onMouseWheel(wheelEvent);
  component.workZoneComponent.onMouseDown();
  expect(wheelSpy).toHaveBeenCalled();
  expect(mouseSpy).toHaveBeenCalled();
  // It shouldn't be possible to increase the angle over 360
  for (let i = 0; i < 100; i++) {
  component.workZoneComponent.onMouseWheel(wheelEvent);
  }
  component.workZoneComponent.onMouseDown();
  const emojiGenerator = fixture.debugElement.injector.get(EmojiGeneratorService);
  let angle = emojiGenerator.rotationAngle;
  expect(angle).toBeLessThanOrEqual(360);

  // It shouldn't be possible to lower the angle under 0
  wheelEvent = new WheelEvent('mousewheel', {
    deltaY: 500,
  });
  for (let i = 0; i < 100; i++) {
    component.workZoneComponent.onMouseWheel(wheelEvent);
    }
  component.workZoneComponent.onMouseDown();
  angle = emojiGenerator.rotationAngle;
  expect(angle).toBeGreaterThanOrEqual(0);
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
  component.workZoneComponent.keyDownEvent(altEvent);
  component.workZoneComponent.onMouseWheel(wheelEvent);
  component.workZoneComponent.onMouseDown();
  expect(altSpy).toHaveBeenCalled();
  expect(wheelSpy).toHaveBeenCalled();
  expect(mouseSpy).toHaveBeenCalled();
  const emoji = svgHandle.childNodes[children.length - 1] as Element;
  expect(emoji.getAttribute('transform')).not.toBeNull();
  const emojiGenerator = fixture.debugElement.injector.get(EmojiGeneratorService);
  expect(emojiGenerator.rotationAngle).toEqual(1);
});
  it('should be impossible to add an emoji if no emoji is selected', () => {
  const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
  toolManagerService._activeTool = Tools.Stamp;
  const emojiService = fixture.debugElement.injector.get(EmojiGeneratorService);
  emojiService._emoji = '';
  const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
  const children = svgHandle.childNodes;
  const initialChildsLength = svgHandle.children.length;
  component.workZoneComponent.onMouseDown();
  expect(children.length).toEqual(initialChildsLength);
});

  // Tests for Eyedropper
  it('should be able to assign a color to primary color with left click as eyedropper', () => {
    // Step 1. Place a rectangle with a specific fill color
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Rectangle;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    // Set the first color
    let newColor = 'rgba(200,200,200,1)';
    const colorService = fixture.debugElement.injector.get(ColorService);
    colorService.setPrimaryColor(newColor);
    colorService.assignPrimaryColor();
    const initialPrimaryColor = colorService.getPrimaryColor();

    // Create the rectangle with the initial color and make sure it has a fill
    const rectangleGeneratorService = fixture.debugElement.injector.get(RectangleGeneratorService);
    rectangleGeneratorService.plotType = PlotType.FullWithContour;
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    const xInitial = 100;
    const yInitial = 100;

    // Also change the positions on the mouse position service
    mousePositionService.canvasMousePositionX = xInitial;
    mousePositionService.canvasMousePositionY = yInitial;
    component.workZoneComponent.onMouseDown();

    // Make the rectangle cover a space so we can click it
    let newX = 200;
    let newY = 200;
    let mouseEvent = new MouseEvent('mousemove', {
      clientX: newX,
      clientY: newY,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = newX;
    mousePositionService.canvasMousePositionY = newY;
    component.workZoneComponent.onMouseMove(mouseEvent);
    component.workZoneComponent.onMouseUp();
    // Expect a <rectangle>
    // Since the rectangle was just created it should be the last element
    const rectangle = getLastSvgElement(svgHandle, 1);
    expect(rectangle.tagName).toEqual('rect');

    // Now change the color, the pipette should bring it back to the initial value, since the rectangle was made with it
    newColor = 'rgba(100,0,0,1)';
    colorService.setPrimaryColor(newColor);
    colorService.assignPrimaryColor();
    const secondPrimaryColor = colorService.getPrimaryColor();
    expect(initialPrimaryColor).not.toBe(secondPrimaryColor);

    // Select the eyedropper (pipette)
    toolManagerService._activeTool = Tools.Eyedropper;

    // Click inside the rectangle (between 100,100 and 200,200)
    newX = 150;
    newY = 150;
    mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: newX,
      clientY: newY,
      bubbles: true,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = newX;
    mousePositionService.canvasMousePositionY = newY;
    // click the rectangle
    const spy = spyOn(component.workZoneComponent, 'onLeftClick').and.callThrough();
    const eyedropperService = fixture.debugElement.injector.get(EyedropperService);
    const deepSpy = spyOn(eyedropperService, 'changePrimaryColor').and.callThrough();
    rectangle.dispatchEvent(mouseEvent);
    expect(spy).toHaveBeenCalled();
    expect(deepSpy).toHaveBeenCalled();
    // Look at the new primary color
    const lastPrimaryColor = colorService.getPrimaryColor();

    // Step 3. compare values
    // The color should be equal to the initial value and different from the modified one
    expect(lastPrimaryColor).toBe(initialPrimaryColor);
    expect(lastPrimaryColor).not.toBe(secondPrimaryColor);
  });

  it('should be able to assign a color to secondary color with right click as eyedropper', () => {
    // Step 1. Place a rectangle with a specific stroke color
    // We use a rectangle since it uses the secondary color as its stroke
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Rectangle;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    // Set the first color
    let newColor = 'rgba(200,200,200,1)';
    const colorService = fixture.debugElement.injector.get(ColorService);
    colorService.setSecondaryColor(newColor);
    colorService.assignSecondaryColor();
    const initialSecondaryColor = colorService.getSecondaryColor();

    // Set the primary color to be different
    newColor = 'rgba(100,100,100,1)';
    colorService.setPrimaryColor(newColor);
    colorService.assignPrimaryColor();
    const initialPrimaryColor = colorService.getPrimaryColor();

    expect(initialPrimaryColor).not.toEqual(initialSecondaryColor);
    // Create the rectangle with the initial color and make sure it has a fill of a different color from the secondary color
    const rectangleGeneratorService = fixture.debugElement.injector.get(RectangleGeneratorService);
    rectangleGeneratorService.plotType = PlotType.FullWithContour;
    drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);

    // Expect a <rect>
    // Since the rectangle was just created it should be the last element
    const rectangle = getLastSvgElement(svgHandle, 1);
    expect(rectangle.tagName).toEqual('rect');
    expect(rectangle.getAttribute('stroke')).toBe(initialSecondaryColor);
    expect(rectangle.getAttribute('fill')).toBe(initialPrimaryColor);

    // Select the eyedropper (pipette)
    toolManagerService._activeTool = Tools.Eyedropper;

    // Click on the rectangle's fill (between 100,100 and 200,200)
    const clickX = 150;
    const clickY = 150;
    const mouseEvent = new MouseEvent('contextmenu', {
      button: 2,
      clientX: clickX,
      clientY: clickY,
      bubbles: true,
    });
    // update mouse position on the service
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = clickX;
    mousePositionService.canvasMousePositionY = clickY;
    // click the rectangle
    const spy = spyOn(component.workZoneComponent, 'onRightClick').and.callThrough();
    const eyedropperService = fixture.debugElement.injector.get(EyedropperService);
    const deepSpy = spyOn(eyedropperService, 'changeSecondaryColor').and.callThrough();
    rectangle.dispatchEvent(mouseEvent);
    expect(spy).toHaveBeenCalled();
    expect(deepSpy).toHaveBeenCalled();
    // Look at the new secondary color
    const lastSecondaryColor = colorService.getSecondaryColor();

    // Step 3. compare values
    // The color should be equal to the primaryColor and different from the intial color
    expect(lastSecondaryColor).toBe(initialPrimaryColor);
    expect(lastSecondaryColor).not.toBe(initialSecondaryColor);
  });

  ////////////////////////////
  // Test regarding the grid
  ////////////////////////////
  it('should be alternating between hidden and visible when toggled', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const gridRect = svgHandle.children[1];
    expect(gridRect.id).toBe('backgroundGrid');
    let currentState = gridRect.getAttribute('visibility');
    expect(currentState).toBe('hidden');

    const gridToggler = fixture.debugElement.injector.get(GridTogglerService);
    gridToggler.toggleGrid();
    currentState = gridRect.getAttribute('visibility');
    expect(currentState).toBe('visible');
    gridToggler.toggleGrid();
    currentState = gridRect.getAttribute('visibility');
    expect(currentState).toBe('hidden');
  });

  it('should change its opacity and size with setters', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const gridRect = svgHandle.children[1];
    const gridToggler = fixture.debugElement.injector.get(GridTogglerService);
    const gridPattern = fixture.debugElement.nativeElement.querySelector('#backgroundGridPattern');

    const initialHTMLSize = parseFloat(gridPattern.getAttribute('width'));
    expect(initialHTMLSize).toBe(gridToggler._gridSize);
    const initialHTMLOpacity = parseFloat(gridRect.getAttribute('fill-opacity') as string);
    const gridSize = gridToggler._gridOpacity as unknown as number;
    expect(initialHTMLOpacity).toBe(gridSize);

    const sizeSlider = new MatSliderChange();
    sizeSlider.value = 75;
    gridToggler.adjustGridSize(sizeSlider);
    const htmlGridSize = gridPattern.getAttribute('width');
    expect(htmlGridSize).toBe('75');

    const opacitySlider = new MatSliderChange();
    opacitySlider.value = 0.2;
    gridToggler.adjustGridOpacity(opacitySlider);
    fixture.detectChanges();
    const currentHTMLOpacity = gridRect.getAttribute('fill-opacity');
    expect(currentHTMLOpacity).toEqual('0.2');
  });

  it('should have the upper right corner of canvas as its origin', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const gridRect = svgHandle.children[1];

    // the grid rectangle is a child of the canvas, with x=y=0, so anchored at origin
    expect(gridRect.getAttribute('y')).toEqual('0');
    expect(gridRect.getAttribute('x')).toEqual('0');
  });

  ////////////////////////////
  // Test regarding the polygon
  ////////////////////////////
  it('should produce a temporary rectangular perimeter and a permanent polygon', () => {
    // Step 1. Select polygon
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Polygon;

    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Setting up the event
    const spy = spyOn(component.workZoneComponent, 'onMouseDown').and.callThrough();
    const xInitial = 100;
    const yInitial = 100;
    // Step 2. First click avec xInitial , yInitial
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    mouse.canvasMousePositionX = xInitial;
    mouse.canvasMousePositionY = yInitial;
    component.workZoneComponent.onMouseDown();
    const currentNumberOfChildren = svgHandle.children.length;
    expect(spy).toHaveBeenCalled();
    // Step 3. Expect a <polygon>
    // +2 since tempRect exists
    expect(workChilds.length).toEqual(initialChildsLength + 2);
    const tempRect = workChilds.item(workChilds.length - 1) as SVGElement;
    expect(tempRect.tagName).toEqual('rect');
    const expectedPolygon = getLastSvgElement(svgHandle, 2);
    expect(expectedPolygon.tagName).toEqual('polygon');

    component.workZoneComponent.onMouseUp();

    // Verify if tempRect disapeared
    expect(workChilds.length).toEqual(currentNumberOfChildren - 1);
  });

  it('should let the user choose plotType, strokeWidth and number of apex', () => {
    // Step 1. Select polygon
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Polygon;
    const polygonGenerator = fixture.debugElement.injector.get(PolygonGeneratorService);
    const mousePosition = fixture.debugElement.injector.get(MousePositionService);
    const colorService = fixture.debugElement.injector.get(ColorService);

    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;

    const spy = spyOn(component.workZoneComponent, 'onMouseMove').and.callThrough();
    const xInitial = 100;
    const yInitial = 100;
    // Step 2. First click avec xInitial , yInitial

    const movedX = 200;
    const movedY = 200;

    const mouseMoveEvent = new MouseEvent('mousemove', {
      button: 0,
      clientX: movedX,
      clientY: movedY,
    });

    mousePosition.canvasMousePositionX = xInitial;
    mousePosition.canvasMousePositionY = yInitial;

    // Setting up the event
    polygonGenerator.plotType = PlotType.Contour;
    polygonGenerator._nbOfApex = 3;
    polygonGenerator.strokeWidth = 1;
    component.workZoneComponent.onMouseDown();
    const defaultPolygon = workChilds.item(workChilds.length - 2) as SVGElement;

    mousePosition.canvasMousePositionX = movedX;
    mousePosition.canvasMousePositionY = movedY;
    component.workZoneComponent.onMouseMove(mouseMoveEvent);
    expect(spy).toHaveBeenCalled();

    // Getting the number of vertex
    const pointsHTML = defaultPolygon.getAttribute('points') as string;
    const points = pointsHTML.split(' ', 12);

    // If next 2 pass, plotType is really Contour
    expect(defaultPolygon.getAttribute('fill')).toEqual('transparent');
    expect(defaultPolygon.getAttribute('stroke')).toEqual(colorService.secondaryColor);
    expect(points.length).toEqual(3);
    expect(defaultPolygon.getAttribute('stroke-width')).toEqual('1');

    component.workZoneComponent.onMouseUp();

    polygonGenerator.plotType = PlotType.Full;
    polygonGenerator._nbOfApex = 11;
    polygonGenerator.strokeWidth = 5;

    mousePosition.canvasMousePositionX = xInitial;
    mousePosition.canvasMousePositionY = yInitial;
    component.workZoneComponent.onMouseDown();
    const changedPolygon = workChilds.item(workChilds.length - 2) as SVGElement;

    mousePosition.canvasMousePositionX = movedX;
    mousePosition.canvasMousePositionY = movedY;
    component.workZoneComponent.onMouseMove(mouseMoveEvent);

    // Getting number of apex
    const changedPointsHTML = changedPolygon.getAttribute('points') as string;
    const changedPoints = changedPointsHTML.split(' ', 11);

    expect(changedPolygon.getAttribute('fill')).toEqual(colorService.primaryColor);
    expect(changedPolygon.getAttribute('stroke')).toEqual('transparent');
    expect(changedPoints.length).toEqual(11);
    expect(changedPolygon.getAttribute('stroke-width')).toEqual('5');
  });

  const verifiePolygonIsRegular = (polygon: SVGElement, apex: number ) => {
    const pointsHTML = polygon.getAttribute('points') as string;
    const points = pointsHTML.split(' ', 12);

    // Finding length of a side
    const pointsXY: string[][] = [['']];
    for (let i = 0 ; i < apex ; i++) {
      pointsXY[i] = points[i].split(',', 2);
    }

    const sideLengths: number[] = [0];
    for (let j = 0 ; j < apex - 1 ; j++) {
      sideLengths[j] = Math.sqrt(Math.pow(parseFloat(pointsXY[j][0]) - parseFloat(pointsXY[j + 1][0]), 2)
        + Math.pow(parseFloat(pointsXY[j][1]) - parseFloat(pointsXY[j + 1][1]), 2));
    }
    sideLengths[apex - 1] = Math.sqrt(Math.pow(
      parseFloat(pointsXY[apex - 1][0]) - parseFloat(pointsXY[0][0]), 2)
      + Math.pow(parseFloat(pointsXY[apex - 1][1]) - parseFloat(pointsXY[0][1]), 2));

    // Expect all sides to be of equal length
    for (let j = 0 ; j < apex - 1; j++) {
      // The multiplications/divisions are to round the number to 4 decimals
      expect(Math.round(sideLengths[j] * 10000) / 10000).toEqual(Math.round(sideLengths[j + 1] * 10000) / 10000);
    }
    expect(Math.round(sideLengths[apex - 1] * 10000) / 10000).toEqual(Math.round(sideLengths[0] * 10000) / 10000);
    return pointsXY;
  };

  const verifiePolygonIsBiggest = (points: string[][], tempRect: SVGElement, aspectRatio: number) => {

    const h: number = parseFloat(tempRect.getAttribute('height') as string);
    const w: number = parseFloat(tempRect.getAttribute('width') as string);
    const x: number = parseFloat(tempRect.getAttribute('x') as string);
    const y: number = parseFloat(tempRect.getAttribute('y') as string);

    let widestLeftPoint = points[0];
    let widestRightPoint = points[0];
    let highestPoint = points[0];
    let lowestPoint = points[0];

    for (let i = 1 ; i < points.length ; i++) {
      if (parseFloat(points[i][0]) < parseFloat(widestLeftPoint[0])) { widestLeftPoint = points[i]; }
      if (parseFloat(points[i][0]) > parseFloat(widestRightPoint[0])) { widestRightPoint = points[i]; }
      if (parseFloat(points[i][1]) > parseFloat(lowestPoint[1])) { lowestPoint = points[i]; }
      if (parseFloat(points[i][1]) < parseFloat(highestPoint[1])) { highestPoint = points[i]; }
    }

    const touchCounter: boolean[] = [false, false, false, false];
    if (Math.round(parseFloat(widestLeftPoint[0])) === x) { touchCounter[0] = true; }
    if (Math.round(parseFloat(widestRightPoint[0])) === (x + w)) { touchCounter[1] = true; }
    if (Math.round(parseFloat(highestPoint[1])) === y) { touchCounter[2] = true; }
    if (Math.round(parseFloat(lowestPoint[1])) === (y + h)) { touchCounter[3] = true; }

    if (points.length % 2 === 0) {
      if (w / h < aspectRatio) {
        expect(touchCounter[0]).toBeTruthy();
        expect(touchCounter[1]).toBeTruthy();
      } else {
        expect(touchCounter[2]).toBeTruthy();
        expect(touchCounter[3]).toBeTruthy();
      }
    } else if (points.length % 2 === 1) {
      if (w / h < aspectRatio) {
        expect(touchCounter[0]).toBeTruthy();
        expect(touchCounter[1]).toBeTruthy();
      } else {
        expect(touchCounter[2]).toBeTruthy();
        expect(touchCounter[3]).toBeTruthy();
      }
    }
  };

  const verifiePointsInRectangle = (points: string[][], tempRect: SVGElement, aspectRatio: number) => {
    const h: number = parseFloat(tempRect.getAttribute('height') as string);
    const w: number = parseFloat(tempRect.getAttribute('width') as string);
    const x: number = parseFloat(tempRect.getAttribute('x') as string);
    const y: number = parseFloat(tempRect.getAttribute('y') as string);

    let widestLeftPoint = points[0];
    let widestRightPoint = points[0];
    let highestPoint = points[0];
    let lowestPoint = points[0];

    for (let i = 1 ; i < points.length ; i++) {
      if (parseFloat(points[i][0]) < parseFloat(widestLeftPoint[0])) { widestLeftPoint = points[i]; }
      if (parseFloat(points[i][0]) > parseFloat(widestLeftPoint[0])) { widestRightPoint = points[i]; }
      if (parseFloat(points[i][1]) > parseFloat(widestLeftPoint[1])) { lowestPoint = points[i]; }
      if (parseFloat(points[i][1]) < parseFloat(widestLeftPoint[1])) { highestPoint = points[i]; }
    }

    let outside = false;
    if (parseFloat(widestLeftPoint[0]) < x) { outside = true; }
    if (parseFloat(widestRightPoint[0]) > x + w) { outside = true; }
    if (parseFloat(highestPoint[1]) < y) { outside = true; }
    if (parseFloat(lowestPoint[1]) > y + h) { outside = true; }

    expect(outside).toBeFalsy();
  };

  it('should draw the biggest possible regular polygon inside the perimeter', () => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Polygon;
    const polygonGenerator = fixture.debugElement.injector.get(PolygonGeneratorService);
    const mousePosition = fixture.debugElement.injector.get(MousePositionService);

    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;

    // Step 2. First click avec xInitial , yInitial
    // Step 2.1 Last click (release) -> save coordinates
    const xInitial = 100;
    const yInitial = 100;

    const mouseDownEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });

    const movedX = 200;
    const movedY = 200;

    const mouseMoveEvent = new MouseEvent('mousemove', {
      button: 0,
      clientX: movedX,
      clientY: movedY,
    });

    mousePosition.canvasMousePositionX = movedX;
    mousePosition.canvasMousePositionY = movedY;

    // Setting up the event
    // Case 1 => (NbOfApex) % 2 === 1
    polygonGenerator._nbOfApex = 3;
    const canvas = fixture.debugElement.nativeElement.querySelector(`#canvas`);
    canvas.dispatchEvent(mouseDownEvent);
    const triangle = workChilds.item(workChilds.length - 2) as SVGElement;
    const tempRect1 = workChilds.item(workChilds.length - 1) as SVGElement;
    canvas.dispatchEvent(mouseMoveEvent);

    const pointsTriangle = verifiePolygonIsRegular(triangle, polygonGenerator._nbOfApex);
    verifiePolygonIsBiggest(pointsTriangle, tempRect1, polygonGenerator._aspectRatio);
    verifiePointsInRectangle(pointsTriangle, tempRect1, polygonGenerator._aspectRatio);

    component.workZoneComponent.onMouseUp();

    // Case 2 => (NbOfApex) % 4 === 0
    polygonGenerator._nbOfApex = 8;
    canvas.dispatchEvent(mouseDownEvent);
    const octogon = workChilds.item(workChilds.length - 2) as SVGElement;
    const tempRect2 = workChilds.item(workChilds.length - 1) as SVGElement;
    canvas.dispatchEvent(mouseMoveEvent);

    const pointsOctogon = verifiePolygonIsRegular(octogon, polygonGenerator._nbOfApex);
    verifiePolygonIsBiggest(pointsOctogon, tempRect2, polygonGenerator._aspectRatio);
    verifiePointsInRectangle(pointsOctogon, tempRect2, polygonGenerator._aspectRatio);

    component.workZoneComponent.onMouseUp();

    // Case 3 => (NbOfApex) % 2 === 0 && (NbOfApex) % 4 !== 0
    polygonGenerator._nbOfApex = 6;
    canvas.dispatchEvent(mouseDownEvent);
    const hexagon = workChilds.item(workChilds.length - 2) as SVGElement;
    const tempRect3 = workChilds.item(workChilds.length - 1) as SVGElement;
    canvas.dispatchEvent(mouseMoveEvent);

    const pointsHexagon = verifiePolygonIsRegular(hexagon, polygonGenerator._nbOfApex);
    verifiePolygonIsBiggest(pointsHexagon, tempRect3, polygonGenerator._aspectRatio);
    verifiePointsInRectangle(pointsHexagon, tempRect3, polygonGenerator._aspectRatio);

    component.workZoneComponent.onMouseUp();
  });

  it('should have the polygon be drawn using the primary and secondary colors', () => {
    // Step 1. Select polygon
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Polygon;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    // Set an initial color and change it
    const colorService = fixture.debugElement.injector.get(ColorService);
    const firstColor = 'rgba(100,100,100,1)';
    colorService.setPrimaryColor(firstColor);
    colorService.assignPrimaryColor();
    colorService.setSecondaryColor(firstColor);
    colorService.assignSecondaryColor();
    const initialPrimaryColor = colorService.getPrimaryColor();
    const initialSecondaryColor = colorService.getSecondaryColor();
    const newColor = 'rgba(200,200,200,1)';
    colorService.setPrimaryColor(newColor);
    colorService.assignPrimaryColor();
    colorService.setSecondaryColor(newColor);
    colorService.assignSecondaryColor();
    const newPrimaryColor = colorService.getPrimaryColor();
    const newSecondaryColor = colorService.getSecondaryColor();
    expect(initialPrimaryColor).not.toBe(newPrimaryColor);
    expect(initialSecondaryColor).not.toBe(newSecondaryColor);
    // create the polygon and make sure it has a plot type that allows both colors to be shown
    const polygonGeneratorService = fixture.debugElement.injector.get(PolygonGeneratorService);
    polygonGeneratorService.plotType = PlotType.FullWithContour;
    drawShapeOnCanvas(100, 100, 200, 200, Tools.Polygon);
    // polygon should be created as the last child
    const polygonChild = getLastSvgElement(svgHandle, 1) as SVGElement;
    // expect the ellipse to have fill as the primary color and stroke as the secondary color
    expect(polygonChild.getAttribute('fill')).toEqual(newPrimaryColor);
    expect(polygonChild.getAttribute('stroke')).toEqual(newSecondaryColor);
  });
});
