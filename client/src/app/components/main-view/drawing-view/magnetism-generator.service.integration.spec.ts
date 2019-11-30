import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { RendererSingleton } from '../../../services/renderer-singleton';
import { ColorService } from '../../../services/tools/color/color.service';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { DrawingViewComponent } from './drawing-view.component';
import { DRAWING_SERVICES } from './integration-tests-environment.spec';

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

describe('MagnetismGeneratorService', () => {
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
            fixture.detectChanges();
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be possible to choose which dot to align with grid', () => {
        const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
        const grid = fixture.debugElement.injector.get(GridTogglerService);
        mousePositionService.canvasMousePositionX = 90;
        mousePositionService.canvasMousePositionY = 90;
        grid._gridSize = 100;
        grid.isMagnetic = true;
        // set dot as upper right corner of bounding box
        grid.setMagneticDot(2);
        const mockSelectionSize = {
            x: 90,
            y: 90,
            width: 70,
            height: 70,
        };
        grid.setSelectedDotPosition(mockSelectionSize as DOMRect);
        // suppose we're moving right
        const closestLine = grid.getClosestVerticalLine(false, true);
        expect(closestLine).toBe(200);

        // set dot as upper left corner of bounding box
        grid.setMagneticDot(0);
        grid.setSelectedDotPosition(mockSelectionSize as DOMRect);
        // suppose we're moving right
        const closestLine2 = grid.getClosestVerticalLine(false, true);
        expect(closestLine2).toBe(100);

    });

    it('magnetism should align selection on grid', () => {
      // TOUT DOUX
    });

});
