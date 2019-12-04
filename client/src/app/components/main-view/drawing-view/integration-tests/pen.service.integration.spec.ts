import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { RendererSingleton } from 'src/app/services/renderer-singleton';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
import { DemoMaterialModule } from '../../../../material.module';
import { ModalManagerService } from '../../../../services/modal-manager/modal-manager.service';
import { ColorService } from '../../../../services/tools/color/color.service';
import { ToolManagerService } from '../../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../../work-zone/work-zone.component';
import { DrawingViewComponent } from '../drawing-view.component';
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

describe('PenGeneratorService', () => {
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

  it('should be possible to use the Pen', () => {
    // Step 1. Select pen tool
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Pen;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;
    // Setting up the event
    component.workZoneComponent.onMouseDown();
    // Step 3. Expect un penPath
    expect(workChilds.length).toBeGreaterThan(initialChildsLength);
    const child = workChilds[workChilds.length - 1];
    expect(child.id).toEqual('penPath0');
  });

  it('pen width should diminish with speed', () => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Pen;
    const penService = fixture.debugElement.injector.get(PenGeneratorService);
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;

    component.workZoneComponent.onMouseDown();
    const penPathBeginning = workChilds[workChilds.length - 1];
    const initialStrokeWidth = penPathBeginning.getAttribute('stroke-width');

    // suppose a sudden faster speed
    spyOn(penService, 'updateElement').and.callFake(() => {
      const currentSpeed = 20;
      penService.updateStrokeWidth(currentSpeed);
      penService.addPath(penService.strokeWidth);
    });
    const mouseMove = new MouseEvent('mousemove', {});
    component.workZoneComponent.onMouseMove(mouseMove);
    const penPath = workChilds[workChilds.length - 1];
    const finalStrokeWidth = penPath.getAttribute('stroke-width');
    expect(Number(finalStrokeWidth)).toBeLessThan(Number(initialStrokeWidth));
  });

  it('pen width should increase with diminishing speed', () => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Pen;
    const penService = fixture.debugElement.injector.get(PenGeneratorService);
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;

    component.workZoneComponent.onMouseDown();
    const penPathBeginning = workChilds[workChilds.length - 1];
    const initialStrokeWidth = penPathBeginning.getAttribute('stroke-width');

    // suppose a sudden slower speed
    spyOn(penService, 'updateElement').and.callFake(() => {
      const currentSpeed = 0.1;
      penService.updateStrokeWidth(currentSpeed);
      penService.addPath(penService.strokeWidth);
    });
    const mouseMove = new MouseEvent('mousemove', {});
    component.workZoneComponent.onMouseMove(mouseMove);
    const penPath = workChilds[workChilds.length - 1];
    const finalStrokeWidth = penPath.getAttribute('stroke-width');
    expect((Number(finalStrokeWidth)) > (Number(initialStrokeWidth))).toBeTruthy();
  });
});
