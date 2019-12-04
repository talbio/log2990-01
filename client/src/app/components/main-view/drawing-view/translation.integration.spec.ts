import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { Transformation, TransformService } from 'src/app/services/transformations/transform.service';
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

describe('Translation', () => {
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be able to translate a selected element', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.translateElement(150, 150);
        const transformMatrix: string = rectangle.getAttribute('transform') as string;
        expect(transformMatrix).toEqual('matrix(1,0,0,1,10,10)');
    });

    it('should be able to translate an element several times in a row', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.translateElement(150, 150);
        let transformMatrix: string;
        transformMatrix = rectangle.getAttribute('transform') as string;
        expect(transformMatrix).toEqual('matrix(1,0,0,1,10,10)');
        canvasDrawer.translateElement(160, 160);
        transformMatrix = rectangle.getAttribute('transform') as string;
        expect(transformMatrix).toEqual('matrix(1,0,0,1,20,20)');
    });

    it('should be able to translate several elements of any type at once', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Polygon);
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const polygon: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 2);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.translateElement(150, 150);
        const rectTransformMatrix: string = rectangle.getAttribute('transform') as string;
        const polygonTransformMatrix: string = polygon.getAttribute('transform') as string;
        expect(rectTransformMatrix).toEqual('matrix(1,0,0,1,10,10)');
        expect(polygonTransformMatrix).toEqual('matrix(1,0,0,1,10,10)');
    });

    it('should be able to translate an element who recieved another type of transformation', () => {
        const svgCanvas = component.workZoneComponent.canvasElement as SVGElement;
        canvasDrawer.drawShapeOnCanvas(100, 100, 200, 200, Tools.Rectangle);
        const rectangle: SVGElement = canvasDrawer.getLastSvgElement(svgCanvas, 1);
        canvasDrawer.scaleElement(100, 100);
        const transformationService = fixture.debugElement.injector.get(TransformService);
        let matrix = rectangle.getAttribute('transform') as string;
        const firstTranslate: number[] = transformationService.getTransformationFromMatrix(matrix, Transformation.TRANSLATE);
        canvasDrawer.translateElement(150, 150);
        matrix = rectangle.getAttribute('transform') as string;
        const secondTranslate: number[] = transformationService.getTransformationFromMatrix(matrix, Transformation.TRANSLATE);
        expect(secondTranslate[0]).toEqual(firstTranslate[0] + 10);
        expect(secondTranslate[1]).toEqual(firstTranslate[1] + 10);
    });
});
