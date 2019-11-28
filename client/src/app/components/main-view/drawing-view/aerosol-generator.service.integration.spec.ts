import {ChangeDetectorRef, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AerosolGeneratorService } from 'src/app/services/tools/aerosol-generator/aerosol-generator.service';
import { Tools } from '../../../data-structures/tools';
import { ModalManagerService } from '../../../services/modal-manager/modal-manager.service';
// import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
// import {ColorService} from '../../../services/tools/color/color.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
// import {UndoRedoService} from '../../../services/undo-redo/undo-redo.service';
import { ToolsAttributesBarComponent } from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { DrawingViewComponent } from './drawing-view.component';
import {STUB_COMPONENTS} from './drawing-view.component.spec';
import {
//   CanvasDrawer,
  COMPONENTS,
  DRAWING_SERVICES,
  IMPORTS,
  modalManagerSpy
} from './integration-tests-environment.spec';

/* tslint:disable:max-classes-per-file for mocking classes*/
/* tslint:disable:no-string-literal for testing purposes*/

// Waits asynchronously for ms milliseconds
const doNothing = ((ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, ms);
  });
});

describe('Aerosol integrations tests', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;
  // let canvasDrawer: CanvasDrawer;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [COMPONENTS, STUB_COMPONENTS],
      imports: [IMPORTS],
      providers: [
        Renderer2, ToolManagerService, ChangeDetectorRef, ...DRAWING_SERVICES,
        {provide: ModalManagerService, useValue: modalManagerSpy},
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).overrideModule(BrowserDynamicTestingModule, {
        set: {entryComponents: [ToolsAttributesBarComponent, DrawingViewComponent]},
      },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      // canvasDrawer = new CanvasDrawer(fixture, component);
      fixture.detectChanges();
    });
  }));

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should be possible to use the Aerosol', async () => {
    // Step 1. Select pen tool
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Aerosol;
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;
    // Setting up the event
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    component.workZoneComponent.onMouseDown();
    await doNothing(500);
    // Wait since this works on an interval
    component.workZoneComponent.onMouseUp();
    expect(spraySpy).toHaveBeenCalled();
    // Step 3. Expect un aerosol
    expect(workChilds.length).toBeGreaterThan(initialChildsLength);
    const child = workChilds[workChilds.length - 1];
    expect(child.id).toEqual('aerosolSpray0');
  });

  it('paint emissions should be done at a regular interval', async () => {
    // TODO
  });

  it('paint emission pattern should be random', async () => {
    // TODO
  });

  it('should be possible to determine spray diameter', async () => {
    // TODO
  });

  it('should be able to change color for every dot in spray', async () => {
    // TODO
  });

  it('should be able to erase', async () => {
    // TODO
  });

  it('should be able to select full spray from a single dot', async () => {
    // TODO
  });

});
