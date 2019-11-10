/*import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Tools } from 'src/app/data-structures/Tools';
import { MousePositionService } from '../../../services/mouse-position/mouse-position.service';
import { BrushGeneratorService } from '../../../services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../../../services/tools/color-applicator/color-applicator.service';
import { ColorService } from '../../../services/tools/color/color.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { EmojiGeneratorService } from '../../../services/tools/emoji-generator/emoji-generator.service';
import { EyedropperService } from '../../../services/tools/eyedropper/eyedropper.service';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { LineGeneratorService } from '../../../services/tools/line-generator/line-generator.service';
import { ObjectSelectorService } from '../../../services/tools/object-selector/object-selector.service';
import { PencilGeneratorService } from '../../../services/tools/pencil-generator/pencil-generator.service';
import { PolygonGeneratorService } from '../../../services/tools/polygon-generator/polygon-generator.service';
import { RectangleGeneratorService } from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';
import { ClipboardService } from './../../../services/tools/clipboard/clipboard.service';
import { WorkZoneComponent } from './work-zone.component';

const DRAWING_SERVICES = [
  BrushGeneratorService,
  ClipboardService,
  ColorApplicatorService,
  ColorService,
  EllipseGeneratorService,
  EmojiGeneratorService,
  EyedropperService,
  GridTogglerService,
  LineGeneratorService,
  MousePositionService,
  ObjectSelectorService,
  PencilGeneratorService,
  PolygonGeneratorService,
  RectangleGeneratorService,
];

fdescribe('WorkZoneComponent', () => {
  let component: WorkZoneComponent;
  let fixture: ComponentFixture<WorkZoneComponent>;
  let toolManagerServiceStub: Partial<ToolManagerService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkZoneComponent ],
      providers:    [ ...DRAWING_SERVICES, {provide: ToolManagerService, useValue: toolManagerServiceStub }],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(WorkZoneComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });
}));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkZoneComponent);
    component = fixture.componentInstance;
    toolManagerServiceStub = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerServiceStub = TestBed.get(ToolManagerService);
    fixture.detectChanges();
  });

  it('should react properly to cut, copy and delete', () => {
    const svgHandle = component.canvasElement as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    selector.SVGArray.push(workChilds[2] as SVGElement);

    const itemToBeCut = workChilds[2] as SVGElement;

    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    // The clipboard contains the cut element and the canvas does not
    expect(workChilds.length).toEqual(2);
    expect(clipboardService.memorizedAction).toContain(itemToBeCut);

    svgHandle.innerHTML +=
    `<rect id="rect1"
        x="200" data-start-x="200"
        y="200" data-start-y="200"
        width="100" height="250" stroke="red" stroke-width="1"
        fill="pink"></rect>`;
    const itemToBeCopied = workChilds[3] as SVGElement;
    selector.SVGArray.push(workChilds[3] as SVGElement);
    clipboardService.copy();
    // The clipboard contains the item copied
    expect(clipboardService.memorizedAction).toContain(itemToBeCopied);

    svgHandle.innerHTML +=
    `<rect id="rect2"
        x="400" data-start-x="400"
        y="100" data-start-y="100"
        width="100" height="50" stroke="yellow" stroke-width="1"
        fill="pink"></rect>`;
    selector.SVGArray.push(workChilds[4] as SVGElement);
    clipboardService.delete();
    // The clipboard contains only one element and it is not the one that was deleted
    expect(clipboardService.memorizedAction).toContain(itemToBeCopied);
    expect(clipboardService.memorizedAction.length).toEqual(1);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (paste)', () => {
    const svgHandle = component.canvasElement as SVGElement;
    const workChilds = svgHandle.children;
    // const polygonGen = fixture.debugElement.injector.get(PolygonGeneratorService);
    // const mouse = fixture.debugElement.injector.get(MousePositionService);
    // const mouseDownEvent = new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 });
    // const movedX = 200;
    // const movedY = 200;
    // const mouseMoveEvent = new MouseEvent('mousemove', { button: 0, clientX: 200, clientY: 200 });
    // mouse.canvasMousePositionX = movedX;
    // mouse.canvasMousePositionY = movedY;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    // component.onMouseDown(mouseDownEvent);
    // component.onMouseMove(mouseMoveEvent);
    // component.onMouseUp();
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    clipboardService.paste();
    clipboardService.paste();

    expect(workChilds.length).toEqual(4);
    expect(workChilds[2]).toEqual(itemToBeCut);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas and not affect the clipboard (paste)', () => {
    const svgHandle = component.canvasElement as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.cut();
    const nbChildrenBeforePaste = workChilds.length;
    clipboardService.paste();

    // The paste added a child on the canvas, which is the one selected and the clipboard contains still the element selected
    expect(workChilds.length).toBeGreaterThan(nbChildrenBeforePaste);
    expect(workChilds[2]).toEqual(itemToBeCut);
    expect(clipboardService.memorizedAction[0]).toEqual(itemToBeCut);
    expect(clipboardService.memorizedAction.length).toEqual(1);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (duplicate)', () => {
    const svgHandle = component.canvasElement as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeDuplicated = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeDuplicated);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.duplicate();

    const clone = workChilds[3];
    let isAClone = true;
    if (parseFloat(clone.getAttribute('height')) !== parseFloat(itemToBeDuplicated.getAttribute('height'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('width')) !== parseFloat(itemToBeDuplicated.getAttribute('width'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('fill')) !== parseFloat(itemToBeDuplicated.getAttribute('fill'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('stroke-width')) !== parseFloat(itemToBeDuplicated.getAttribute('stroke-width'))) {
      isAClone = false;
    }
    if (parseFloat(clone.getAttribute('stroke')) !== parseFloat(itemToBeDuplicated.getAttribute('stroke'))) {
      isAClone = false;
    }
    expect(isAClone).toBe(true);
    // The clipboard is still empty and a slightely displaced clone of the selected element was added
    expect(workChilds.length).toEqual(4);
    expect(workChilds[3]).toEqual(workChilds[2]);
    expect(clipboardService.memorizedAction.length).toEqual(0);
  });

  it('should ', () => {
    const svgHandle = component.canvasElement as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.duplicate();

    expect(workChilds.length).toEqual(4);
    expect(workChilds[3]).toEqual(workChilds[2]);
  });

  it('should add slightely displaced copies of the clipboarded elements on canvas (duplicate)', () => {
    const svgHandle = component.canvasElement as SVGElement;
    const workChilds = svgHandle.children;

    // Setting up the event
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Selector;
    svgHandle.innerHTML +=
        `<rect id="rect0"
        x="100" data-start-x="100"
        y="100" data-start-y="100"
        width="100" height="150" stroke="black" stroke-width="1"
        fill="pink"></rect>`;
    const selector = fixture.debugElement.injector.get(ObjectSelectorService);
    const itemToBeCut = workChilds[2] as SVGElement;
    selector.SVGArray.push(itemToBeCut);
    const clipboardService = fixture.debugElement.injector.get(ClipboardService);
    clipboardService.duplicate();

    expect(workChilds.length).toEqual(4);
    expect(workChilds[3]).toEqual(workChilds[2]);
  });
});*/
