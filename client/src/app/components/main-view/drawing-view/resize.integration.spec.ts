import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { Transformation, TransformationService } from 'src/app/services/transformation/transformation.service';
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

describe('Resize', () => {
    let component: DrawingViewComponent;
    let fixture: ComponentFixture<DrawingViewComponent>;
    let canvasDrawer: CanvasDrawer;
    let transformationService: TransformationService;
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
            transformationService = fixture.debugElement.injector.get(TransformationService);
            fixture.detectChanges();
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    // For most of these tests, we will only check if the scale is as desired
    // A specific test will be made to ensure the translate is correct
    it('should be able to resize a selected element', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.scaleElement(100, 100);
        const matrix = rectangle.getAttribute('transform') as string;
        const scale: number[] = transformationService.getTransformationFromMatrix(matrix, Transformation.SCALE);
        expect(scale[0]).toEqual(0.9);
        expect(scale[1]).toEqual(0.9);
    });

    it('should be able to resize an element several times in a row', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.scaleElement(100, 100);
        canvasDrawer.scaleElement(111, 111);
        const matrix = rectangle.getAttribute('transform') as string;
        const scale: number[] = transformationService.getTransformationFromMatrix(matrix, Transformation.SCALE);
        expect(scale[0]).toBeCloseTo(0.8);
        expect(scale[1]).toBeCloseTo(0.8);
    });

    it('should be able to scale several elements of any type at once', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Pencil);
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const pencil: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 2);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.scaleElement(100, 100);
        const rectangleMatrix: string = rectangle.getAttribute('transform') as string;
        const rectangleScale: number[] = transformationService.getTransformationFromMatrix(rectangleMatrix, Transformation.SCALE);
        expect(rectangleScale[0]).toEqual(0.9);
        expect(rectangleScale[1]).toEqual(0.9);
        const pencilMatrix: string = pencil.getAttribute('transform') as string;
        const pencilScale: number[] = transformationService.getTransformationFromMatrix(pencilMatrix, Transformation.SCALE);
        expect(pencilScale[0]).toEqual(0.9);
        expect(pencilScale[1]).toEqual(0.9);
    });

    it('should be able to scale an element who recieved another type of transformation', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.translateElement(150, 150);
        let matrix = rectangle.getAttribute('transform') as string;
        const initialScale: number[] = transformationService.getTransformationFromMatrix(matrix, Transformation.SCALE);
        expect(initialScale[0]).toEqual(1);
        expect(initialScale[1]).toEqual(1);
        canvasDrawer.scaleElement(110, 110);
        matrix = rectangle.getAttribute('transform') as string;
        const secondScale: number[] = transformationService.getTransformationFromMatrix(matrix, Transformation.SCALE);
        expect(secondScale[0]).toEqual(0.9);
        expect(secondScale[1]).toEqual(0.9);
    });

    it('should have a translate that allows the object to stay in place regardless of scale change', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        const initialRight: number = rectangle.getBoundingClientRect().right;
        const initialBottom: number = rectangle.getBoundingClientRect().bottom;
        canvasDrawer.scaleElement(100, 100);
        const newRight: number = rectangle.getBoundingClientRect().right;
        const newBottom: number = rectangle.getBoundingClientRect().bottom;
        expect(initialRight).toBeCloseTo(newRight);
        expect(initialBottom).toBeCloseTo(newBottom);
    });
});
