import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ClipboardService } from 'src/app/services/tools/clipboard/clipboard.service';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { ObjectSelectorService } from 'src/app/services/tools/object-selector/object-selector.service';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
import { DemoMaterialModule } from '../../../material.module';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { BrushGeneratorService } from '../../../services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../../../services/tools/color-applicator/color-applicator.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { EyedropperService } from '../../../services/tools/eyedropper/eyedropper.service';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { LineGeneratorService } from '../../../services/tools/line-generator/line-generator.service';
import { PencilGeneratorService } from '../../../services/tools/pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../../../services/tools/polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ModalManagerSingleton } from '../../modals/modal-manager-singleton';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { EraserService } from './../../../services/tools/eraser/eraser.service';
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
  jasmine.createSpyObj('ModalManagerService', ['showCreateDrawingDialog', 'showSaveDrawingDialog', 'showOpenDrawingDialog']);
const httpClientSpy: jasmine.SpyObj<HttpClient> =
  jasmine.createSpyObj('HttpClient', ['get', 'post']);

const DRAWING_SERVICES = [
  RectangleGeneratorService,
  EllipseGeneratorService,
  EmojiGeneratorService,
  ClipboardService,
  PencilGeneratorService,
  BrushGeneratorService,
  ColorApplicatorService,
  LineGeneratorService,
  EyedropperService,
  ColorService,
  ClipboardService,
  MousePositionService,
  ObjectSelectorService,
  GridTogglerService,
  PolygonGeneratorService,
  EraserService,
  PenGeneratorService,
];
describe('DrawingViewComponent', () => {
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
      fixture.detectChanges();
    });
  }));
  it('should be unable to stack open other modals aside from the GiveUpChangesDialog while a modal is already active', () => {
    const instanceSpy = spyOn(ModalManagerSingleton, 'getInstance').and.callThrough();
    const saveShortCutEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });
    const modalManagerSingleton = ModalManagerSingleton.getInstance(); // This is the first call
    // This normally happens when the modal opens or closes but it won't in the test environment so we set it manually
    modalManagerSingleton._isModalActive = false;
    document.dispatchEvent(saveShortCutEvent);
    expect(instanceSpy).toHaveBeenCalledTimes(2);
    expect(modalManagerSpy.showSaveDrawingDialog).toHaveBeenCalled();
    modalManagerSingleton._isModalActive = true;
    // We try to open it a second time
    document.dispatchEvent(saveShortCutEvent);
    expect(instanceSpy).toHaveBeenCalledTimes(3);
    expect(modalManagerSpy.showSaveDrawingDialog).not.toHaveBeenCalledTimes(2);
    // We try with a different shortcut
    const createShortCutEvent = new KeyboardEvent('keydown', {
        key: 'o',
        ctrlKey: true,
        bubbles: true,
    });
    document.dispatchEvent(createShortCutEvent);
    expect(instanceSpy).toHaveBeenCalledTimes(4);
    expect(modalManagerSpy.showCreateDrawingDialog).not.toHaveBeenCalled();
    // We 'close' the modal and prove another one can open
    modalManagerSingleton._isModalActive = false;
    document.dispatchEvent(createShortCutEvent);
    expect(instanceSpy).toHaveBeenCalledTimes(5);
    expect(modalManagerSpy.showCreateDrawingDialog).toHaveBeenCalled();
  });
});
