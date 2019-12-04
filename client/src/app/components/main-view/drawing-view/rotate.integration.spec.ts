import { MousePositionService } from './../../../services/mouse-position/mouse-position.service';
import { ObjectSelectorService } from 'src/app/services/tools/object-selector/object-selector.service';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { RendererSingleton } from '../../../services/renderer-singleton';
import { ColorService } from '../../../services/tools/color/color.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { DrawingViewComponent } from './drawing-view.component';
import { CanvasDrawer, DRAWING_SERVICES } from './integration-tests-environment.spec';

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

fdescribe('Rotation', () => {
    let component: DrawingViewComponent;
    let fixture: ComponentFixture<DrawingViewComponent>;
    let canvasDrawer: CanvasDrawer;
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
            providers: [ToolManagerService, ...DRAWING_SERVICES, ColorService, ChangeDetectorRef, RendererSingleton,
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
            canvasDrawer = new CanvasDrawer(fixture, component);
            fixture.detectChanges();
        });
    }));

    const extractMatrix = (matrix: string): number[] => {
      const matrixBeginIndex = matrix.lastIndexOf('matrix(') + 7;
      const matrixInner = matrix.substring(matrixBeginIndex, matrix.length - 1);
      const eachSlots = matrixInner.split(',');
      const param: number[] = [];
      eachSlots.forEach((slot: string) => {
        param.push(parseFloat(slot));
      });
      return param;
    };

    it('should be able to rotate a selected element', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
      canvasDrawer.rotateElement(150, 150);
      const transformMatrix: string = rectangle.getAttribute('transform') as string;

      // from https://matrix.reshish.com/multCalculation.php
      const expectedMatrix = [0.9659258262890683, 0.25881904510252074, -0.25881904510252074,
          0.9659258262890683, 44.22551667794383, -33.935435167031244];

      const mat = extractMatrix(transformMatrix);
      for (let i = 0 ; i < 6 ; i++) {
        expect(mat[i]).toBeCloseTo(expectedMatrix[i]);
      }
    });

    it('should be able to rotate an element several times in a row', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.rotateElement(150, 150);
        let transformMatrix: string;
        transformMatrix = rectangle.getAttribute('transform') as string;
        const firstExpectedMat = [0.9659258262890683, 0.25881904510252074, -0.25881904510252074,
            0.9659258262890683, 44.22551667794383, -33.935435167031244];
        const secondExpectedMat =
          'matrix(0.8660254037844387,0.49999999999999994,-0.49999999999999994,0.8660254037844387,95.72722234321724,-55.26814242547397)';
        expect(transformMatrix).toBeCloseTo(firstExpectedMat);
        canvasDrawer.rotateElement(150, 150);
        transformMatrix = rectangle.getAttribute('transform') as string;
        expect(transformMatrix).toBeCloseTo(secondExpectedMat);
    });

    it('should be able to rotate several elements of any type at once', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
      const selector = fixture.debugElement.injector.get(ObjectSelectorService);
      const mouse = fixture.debugElement.injector.get(MousePositionService);

      // Set up the canvas
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Polygon);
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const polygon: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 2);
      const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
      toolManagerService._activeTool = Tools.Selector;
      const previousRectTransform = rectangle.getAttribute('transform') as string;
      const previousPolygonTransform = polygon.getAttribute('transform') as string;
      const mouseEvent = new MouseEvent('mousedown', {
        button: 0,
        clientX: 150,
        clientY: 150,
      });
      mouse.canvasMousePositionX = 100;
      mouse.canvasMousePositionY = 100;
      selector.onMouseDown();
      mouse.canvasMousePositionX = 200;
      mouse.canvasMousePositionY = 250;
      // last child is bounding box
      selector.onMouseMove(svgCanvas.children.length - 1, mouseEvent);
      selector.onMouseUp();

      // 15 degrees
      canvasDrawer.rotateElement(150, 150);

      const expectedMatrix = [-1.0606601717798212, -1.0606601717798214, 0.848528137423857, -0.8485281374238569,
        322.74296456276625, 582.7423133572969];
      const matRect = extractMatrix(previousRectTransform);
      for (let i = 0 ; i < 6 ; i++) {
        expect(matRect[i]).toBeCloseTo(expectedMatrix[i]);
      }
      const matPolygon = extractMatrix(previousPolygonTransform);
      for (let i = 0 ; i < 6 ; i++) {
        expect(matPolygon[i]).toBeCloseTo(expectedMatrix[i]);
      }
    });

    it('should be able to rotate an element who recieved another type of transformation', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
      const selector = fixture.debugElement.injector.get(ObjectSelectorService);
      const mouse = fixture.debugElement.injector.get(MousePositionService);
      toolManagerService._activeTool = Tools.Selector;

      const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
      const mouseEvent = new MouseEvent('mousedown', {
        button: 0,
        clientX: 150,
        clientY: 150,
      });

      mouse.canvasMousePositionX = 100;
      mouse.canvasMousePositionY = 100;
      selector.onMouseDown();
      mouse.canvasMousePositionX = 200;
      mouse.canvasMousePositionY = 250;
      // last child is bounding box
      selector.onMouseMove(svgCanvas.children.length - 1, mouseEvent);
      selector.onMouseUp();
      canvasDrawer.scaleElement(150, 150);

      // 15 degrees
      canvasDrawer.rotateElement(150, 150);
      const newTransform = rectangle.getAttribute('transform') as string;

      // from https://matrix.reshish.com/multCalculation.php
      const expectedMatrix = [1.4488887394336025, 0.3882285676537811, -0.3105828541230249,
        1.159110991546882, 99.0816909256643, 96.95602268543558];
      // matrix(0.8693332436601615,-0.2329371405922686,0.2329371405922686,0.8693332436601615,-12.564258484295205,59.83212294237558)
      // matrix(0.8693332436601615,0.23293714059226867,-0.23293714059226867,0.8693332436601615,57.83211865570736,-10.564264070790024)
      const mat = extractMatrix(newTransform);
      for (let i = 0 ; i < 6 ; i++) {
        expect(mat[i]).toBeCloseTo(expectedMatrix[i]);
      }
    });

    it(`should change the angle of the selection with a mouse's wheel mouvement`, () => {
      // Setting up the event
      const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
      const selector = fixture.debugElement.injector.get(ObjectSelectorService);
      toolManagerService._activeTool = Tools.Selector;

      selector.angle = 153;
      const initialAngle = selector.angle;

      const wheelEvent = new WheelEvent('mousewheel', {
        deltaY: -1,
      });

      component.workZoneComponent.onMouseWheel(wheelEvent);

      // Verify that the angle really changed and that the initial step is of 15
      expect(selector.angle).toEqual(initialAngle + 15);
    });

    it(`should change the step of changes to the angle with the wheel when alt is used`, () => {
      // Setting up the event
      const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
      const selector = fixture.debugElement.injector.get(ObjectSelectorService);
      toolManagerService._activeTool = Tools.Selector;

      const initialAngle = selector.angle;

      const wheelEvent = new WheelEvent('mousewheel', {
        deltaY: -1,
      });
      toolManagerService.changeElementAltDown();
      component.workZoneComponent.onMouseWheel(wheelEvent);
      // When alt is used
      expect(selector.angle).toEqual(initialAngle + 1);
      const newAngle = selector.angle;

      toolManagerService.changeElementAltUp();
      component.workZoneComponent.onMouseWheel(wheelEvent);
      // When alt is unused
      expect(selector.angle).toEqual(newAngle + 15);
    });

    it(`should infinitely increase or decrease the angle (go full circle)`, () => {
      // Setting up the event
      const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
      const selector = fixture.debugElement.injector.get(ObjectSelectorService);
      toolManagerService._activeTool = Tools.Selector;

      const floorAngle = 0;
      const ceilingAngle = 360;
      selector.angle = floorAngle;

      // A positive delta is suppose to reduce the angle,
      // but we'll expect the result to be bigger when we encounter the floor
      const wheelEvent1 = new WheelEvent('mousewheel', {
        deltaY: 1,
      });
      component.workZoneComponent.onMouseWheel(wheelEvent1);
      expect(selector.angle).toEqual(ceilingAngle - 15);

      // A negative delta is suppose to increase the angle,
      // but we'll expect the result to be smaller when we reach the ceiling
      const wheelEvent2 = new WheelEvent('mousewheel', {
        deltaY: -1,
      });
      component.workZoneComponent.onMouseWheel(wheelEvent2);
      expect(selector.angle).toEqual(floorAngle);
    });
});
