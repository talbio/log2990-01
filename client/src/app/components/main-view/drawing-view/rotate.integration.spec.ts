import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { ObjectSelectorService } from 'src/app/services/tools/object-selector/object-selector.service';
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
import { MousePositionService } from './../../../services/mouse-position/mouse-position.service';
import { TransformService, Transformation } from './../../../services/transformations/transform.service';
import { RotateService } from './../../../services/transformations/rotate.service';
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
    let transform: TransformService;
    let canvasDrawer: CanvasDrawer;
    let rotate: RotateService;
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
            rotate = fixture.debugElement.injector.get(RotateService);
            component = fixture.componentInstance;
            canvasDrawer = new CanvasDrawer(fixture, component);
            transform = fixture.debugElement.injector.get(TransformService);
            fixture.detectChanges();
        });
    }));

    it('should be able to rotate a selected element', () => {
      const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
      canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
      const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
      canvasDrawer.rotateElement(150, 150);
      const transformMatrix: string = rectangle.getAttribute('transform') as string;

      // from https://matrix.reshish.com/multCalculation.php
      const expectedMatrix = [0.9659258262890683, 0.25881904510252074, -0.25881904510252074,
          0.9659258262890683, 44.22551667794383, -33.935435167031244];
      const mat = transform.getTransformationFromMatrix(transformMatrix, Transformation.ROTATE);
      expect(mat[0]).toBeCloseTo(expectedMatrix[1]);
      expect(mat[1]).toBeCloseTo(expectedMatrix[2]);
    });

    it('should be able to rotate an element several times in a row', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        // from https://matrix.reshish.com/multCalculation.php
        const firstExpectedMat = [0.9659258262890683, 0.25881904510252074, -0.25881904510252074,
            0.9659258262890683, 44.22551667794383, -33.935435167031244];
        const secondExpectedMat = [0.8660254037844387, 0.49999999999999994, -0.49999999999999994,
            0.8660254037844387, 95.72722234321724, -55.26814242547397];

        canvasDrawer.rotateElement(150, 150);
        let transformMatrix: string;
        transformMatrix = rectangle.getAttribute('transform') as string;
        let rectMat = transform.getTransformationFromMatrix(transformMatrix, Transformation.ROTATE);
        expect(rectMat[0]).toBeCloseTo(firstExpectedMat[1]);
        expect(rectMat[1]).toBeCloseTo(firstExpectedMat[2]);
        canvasDrawer.rotateElement(150, 150);
        transformMatrix = rectangle.getAttribute('transform') as string;
        rectMat = transform.getTransformationFromMatrix(transformMatrix, Transformation.ROTATE);
        expect(rectMat[0]).toBeCloseTo(secondExpectedMat[1]);
        expect(rectMat[1]).toBeCloseTo(secondExpectedMat[2]);
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
      const expectedMatrix = [0.8693332436601615, 0.23293714059226867, -0.23293714059226867,
        0.8693332436601615, 57.83211865570736, -10.564264070790024];
      // matrix(0.8693332436601615,-0.2329371405922686,0.2329371405922686,0.8693332436601615,-12.564258484295205,59.83212294237558)
      // matrix(0.8693332436601615,0.23293714059226867,-0.23293714059226867,0.8693332436601615,57.83211865570736,-10.564264070790024)
      const mat = transform.getTransformationFromMatrix(newTransform, Transformation.ROTATE);
      expect(mat[0]).toBeCloseTo(expectedMatrix[1], 1);
      expect(mat[1]).toBeCloseTo(expectedMatrix[2], 1);
    });

});
