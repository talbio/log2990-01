import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import { ChangeDetectorRef,  Component, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { WorkZoneComponent } from '../work-zone/work-zone.component';
import { SaveDrawingService } from './../../../services/back-end/save-drawing/save-drawing.service';
import { EyedropperService } from './../../../services/tools/eyedropper/eyedropper.service';
import { ColorToolButtonsComponent } from './../lateral-bar-module/color-tool-buttons/color-tool-buttons.component';
// import { ToolsAttributesBarComponent } from './../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { DrawingViewComponent } from './drawing-view.component';
/* tslint:disable:max-classes-per-file for mocking classes*/
@Component({ selector: 'app-lateral-bar', template: '' })
class LateralBarStubComponent { }
@Component({ selector: 'app-welcome-modal', template: '' })
class WelcomeModalStubComponent { }
@Component({ selector: 'app-tools-attributes', template: '' })
class ToolAttributesBarStubComponent { }

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
        ToolAttributesBarStubComponent,
        ColorToolButtonsComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        ColorPickerDialogComponent,
        LastTenColorsComponent,
      ],
      imports: [
        DemoMaterialModule,
        CommonModule,
        FormsModule,
        PortalModule,
      ],
      providers: [ToolManagerService, ...DRAWING_SERVICES, ColorService, SaveDrawingService, ChangeDetectorRef,
        HttpClient, ],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [DrawingViewComponent] } },
    ).compileComponents().then(() => {
      console.log(TestBed.createComponent(DrawingViewComponent));
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));
  it('should create an ellipse in work-zone', () => {
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
    console.log(svgHandle);
    // Step 3. Expect un <ellipse>
    expect(workChilds.length).toEqual(initialChildsLength + 1);
    const lastChild = workChilds.item(workChilds.length - 1) as SVGElement;
    expect(lastChild.tagName).toEqual('ellipse');
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
});
