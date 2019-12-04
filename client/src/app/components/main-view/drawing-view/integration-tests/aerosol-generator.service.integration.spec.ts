import {ChangeDetectorRef, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AerosolGeneratorService } from 'src/app/services/tools/aerosol-generator/aerosol-generator.service';
import { ObjectSelectorService } from 'src/app/services/tools/object-selector/object-selector.service';
import { Tools } from '../../../../data-structures/tools';
import { ModalManagerService } from '../../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../../services/mouse-position/mouse-position.service';
import { ColorService } from '../../../../services/tools/color/color.service';
import { ToolManagerService } from '../../../../services/tools/tool-manager/tool-manager.service';
import { ToolsAttributesBarComponent } from '../../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { DrawingViewComponent } from '../drawing-view.component';
import {STUB_COMPONENTS} from '../drawing-view.component.spec';
import {
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
      fixture.detectChanges();
    });
  }));

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  // Function to spray on the canvas for timeInMs milliseconds at mousePosition, must be called with await
  const sprayOnCanvas = async (timeInMs: number) => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Aerosol;
    component.workZoneComponent.onMouseDown();
    await doNothing(timeInMs);
    // Wait since this works on an interval
    component.workZoneComponent.onMouseUp();
  };

  it('should be possible to use the Aerosol', async () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;
    // Setting up the event
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    await sprayOnCanvas(500);
    expect(spraySpy).toHaveBeenCalled();
    // Step 3. Expect un aerosol
    expect(workChilds.length).toBeGreaterThan(initialChildsLength);
    const child = workChilds[workChilds.length - 1];
    expect(child.id).toEqual('aerosolSpray0');
  });

  it('paint emissions should be done at a regular interval', async () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    await sprayOnCanvas(500);
    expect(spraySpy).toHaveBeenCalled();
    spraySpy.calls.reset();
    const firstSprayChildren: number = workChilds.length - initialChildsLength;
    // now spray again and expect a similar amount of children
    await sprayOnCanvas(500);
    expect(spraySpy).toHaveBeenCalled();
    const secondSprayChildren: number = workChilds.length - (initialChildsLength + firstSprayChildren);
    // We allow for a difference of up to 2 on each side in case interval was stopped midway
    // This is a safety measure, first and second spray always had the same amount of children during test creation
    expect(secondSprayChildren).toBeGreaterThanOrEqual(firstSprayChildren - 2);
    expect(secondSprayChildren).toBeLessThanOrEqual(firstSprayChildren + 2);
  });

  it('paint emission pattern should be random', async () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Spray the canvas
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    await sprayOnCanvas(500);
    expect(spraySpy).toHaveBeenCalled();
    const firstSpray: SVGElement[] = [];
    const firstSprayChildrenLength: number = workChilds.length - initialChildsLength;
    for (let i = 0; i < firstSprayChildrenLength; i++) {
      firstSpray[i] = workChilds[i + initialChildsLength] as SVGElement;
    }
    spraySpy.calls.reset();

    // Spray a second time to compare patterns
    await sprayOnCanvas(500);
    expect(spraySpy).toHaveBeenCalled();
    const secondSpray: SVGElement[] = [];
    const secondSprayChildrenLength: number = workChilds.length - initialChildsLength;
    for (let i = 0; i < secondSprayChildrenLength; i++) {
      secondSpray[i] = workChilds[i + initialChildsLength + firstSprayChildrenLength] as SVGElement;
    }
    // Check that pattern isn't exactly the same.
    // Should practically never happen since we let the spray go for a long time, but still possible.
    // Running the test again should fix this issue.
    let isSamePattern = true;
    for (let i = 0; i < secondSpray.length; i++) {
      if (firstSpray[i].getAttribute('cx') !== secondSpray[i].getAttribute('cx')
      || firstSpray[i].getAttribute('cy') !== secondSpray[i].getAttribute('cy')) {
        isSamePattern = false;
        break;
      }
    }
    expect(isSamePattern).toEqual(false);
  });

  it('should be possible to determine spray diameter', async () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Spray
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    mouse.canvasMousePositionX = 100;
    mouse.canvasMousePositionY = 100;
    const sprayDiameter = aerosolService._sprayDiameter;
    await sprayOnCanvas(250);
    expect(spraySpy).toHaveBeenCalled();

    // Check that every dot is within the radius (diameter / 2)
    const dots: SVGElement[] = [];
    const sprayChildrenLength: number = workChilds.length - initialChildsLength;
    for (let i = 0; i < sprayChildrenLength; i++) {
      dots[i] = workChilds[i + initialChildsLength] as SVGElement;
      expect(dots[i].getAttribute('cx')).toBeLessThanOrEqual(mouse.canvasMousePositionX + (sprayDiameter / 2));
      expect(dots[i].getAttribute('cx')).toBeGreaterThanOrEqual(mouse.canvasMousePositionX - (sprayDiameter / 2));
      expect(dots[i].getAttribute('cy')).toBeLessThanOrEqual(mouse.canvasMousePositionY + (sprayDiameter / 2));
      expect(dots[i].getAttribute('cy')).toBeGreaterThanOrEqual(mouse.canvasMousePositionY - (sprayDiameter / 2));
    }
  });

  it('should be able to change color for every dot in spray', async () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Spray
    const colorService = fixture.debugElement.injector.get(ColorService);
    const initialColor = 'rgba(0,0,0,1)';
    colorService.setPrimaryColor(initialColor);
    colorService.assignPrimaryColor();
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    await sprayOnCanvas(250);
    expect(spraySpy).toHaveBeenCalled();

    // Change the color of the first dot
    const firstDot: SVGElement = workChilds[initialChildsLength] as SVGElement;
    expect(firstDot.getAttribute('fill')).toEqual(initialColor);
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.ColorApplicator;
    const newColor = 'rgba(10,10,10,1)';
    colorService.setPrimaryColor(newColor);
    colorService.assignPrimaryColor();
    const applyColor = new MouseEvent('click', {
      button: 0,
      clientX: parseFloat(firstDot.getAttribute('cx') as string),
      clientY: parseFloat(firstDot.getAttribute('cy') as string),
      bubbles: true,
    });
    firstDot.dispatchEvent(applyColor);
    expect(firstDot.getAttribute('fill')).toEqual(newColor);
    // Check that every dot had its color changed
    const dots: SVGElement[] = [];
    const sprayChildrenLength: number = workChilds.length - initialChildsLength;
    for (let i = 0; i < sprayChildrenLength; i++) {
      dots[i] = workChilds[i + initialChildsLength] as SVGElement;
      expect(dots[i].getAttribute('fill')).toEqual(newColor);
    }
  });

  it('should be able to select full spray from a single dot', async () => {
    // Create the work-zone
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const initialChildsLength = svgHandle.children.length;
    const workChilds = svgHandle.children;

    // Spray
    const aerosolService = fixture.debugElement.injector.get(AerosolGeneratorService);
    const spraySpy = spyOn(aerosolService, 'spray').and.callThrough();
    await sprayOnCanvas(250);
    expect(spraySpy).toHaveBeenCalled();

    const dots: SVGElement[] = [];
    const sprayChildrenLength: number = workChilds.length - initialChildsLength;
    for (let i = 0; i < sprayChildrenLength; i++) {
      dots[i] = workChilds[i + initialChildsLength] as SVGElement;
    }

    // Select the first dot
    const firstDot: SVGElement = dots[0];
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    const mouse = fixture.debugElement.injector.get(MousePositionService);
    const xPos: number = parseFloat(firstDot.getAttribute('cx') as string);
    const yPos: number = parseFloat(firstDot.getAttribute('cy') as string);
    mouse.canvasMousePositionX = xPos;
    mouse.canvasMousePositionY = yPos;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    selector.onMouseDown();
    selector.onMouseUp();

    // Check that the selector has every dot
    dots.forEach((dot: SVGElement) => {
      expect(selector.selectedElements.indexOf(dot)).not.toBe(-1);
    });
  });
});
