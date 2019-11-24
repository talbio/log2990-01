import {Component, Renderer2, Type} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import {Observable, of} from 'rxjs';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import {Drawing} from '../../../../../../common/communication/Drawing';
import {DemoMaterialModule} from '../../../material.module';
import {DrawingsService} from '../../../services/back-end/drawings/drawings.service';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {DialogData} from '../create-drawing-dialog/create-drawing-dialog.component';
import { ClipboardService } from './../../../services/tools/clipboard/clipboard.service';
import { GridTogglerService } from './../../../services/tools/grid/grid-toggler.service';
import {FilterByTags} from './filter-by-tags.pipe';
import { LoaderComponent } from './loader/loader/loader.component';
import {OpenDrawingDialogComponent} from './open-drawing-dialog.component';

/* tslint:disable:max-classes-per-file for mocking classes*/
/* tslint:disable:no-string-literal for testing purposes*/

/* -------------------------------- MOCK ENVIRONMENT ----------------------------------------- */

const spyDialog: jasmine.SpyObj<MatDialogRef<OpenDrawingDialogComponent>> =
  jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
spyDialog.close.and.callThrough();
spyDialog.afterClosed.and.callFake(() => of(true));

const toolManagerServiceSpy: jasmine.SpyObj<ToolManagerService> =
  jasmine.createSpyObj('ToolManagerService', ['deleteAllDrawings', 'synchronizeAllCounters']);
toolManagerServiceSpy.deleteAllDrawings.and.callThrough();

const drawingsServiceSpy: jasmine.SpyObj<DrawingsService> =
  jasmine.createSpyObj('DrawingsService', ['httpPostDrawing', 'httpGetDrawings']);
drawingsServiceSpy.httpGetDrawings.and.returnValue(of());

const notifierServiceSpy: jasmine.SpyObj<NotifierService> =
  jasmine.createSpyObj('NotifierService', ['notify']);

const gridTogglerSpy: jasmine.SpyObj<GridTogglerService> =
  jasmine.createSpyObj('GridTogglerService', ['_grid', '_gridPattern']);

const clipboardSpy: jasmine.SpyObj<ClipboardService> =
  jasmine.createSpyObj('ClipboardService', ['reset']);

const undoRedoSpy: jasmine.SpyObj<UndoRedoService> =
  jasmine.createSpyObj('UndoRedoService', ['reset']);

const fakeCanvas = {innerHTML: ''};

class MockMatDialog {
  open(component: Component) {
    return {
      afterClosed: () => of(false),
    };
  }
}
const mockMatDialog = new MockMatDialog();
const mockDialogData: DialogData = {drawingNonEmpty: true};
const fakeWidth = 1;
const fakeHeight = 1;
const fakeDrawing: Drawing = {id: -1, name: '', tags: [], svgElements: '<svg></svg>', miniature: '',
  canvasWidth: fakeWidth, canvasHeight: fakeHeight};
/* ------------------------------------------------------------------------------------------ */

describe('OpenDrawingDialogComponent', () => {
  let component: OpenDrawingDialogComponent;
  let fixture: ComponentFixture<OpenDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OpenDrawingDialogComponent, FilterByTags, LoaderComponent, ],
      imports: [DemoMaterialModule],
      providers: [
        Renderer2,
        {provide: MatDialogRef, useValue: spyDialog},
        {provide: ToolManagerService, useValue: toolManagerServiceSpy},
        {provide: DrawingsService, useValue: drawingsServiceSpy},
        {provide: MatDialog, useValue: mockMatDialog},
        {provide: MAT_DIALOG_DATA, useValue: mockDialogData},
        { provide: NotifierService, useValue: notifierServiceSpy },
        { provide: GridTogglerService, useValue: gridTogglerSpy },
        { provide: UndoRedoService, useValue: undoRedoSpy },
        { provide: ClipboardService, useValue: clipboardSpy },
      ],
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(OpenDrawingDialogComponent);
        const renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
        spyOn(renderer, 'selectRootElement').and.returnValue(fakeCanvas);
        spyOn(renderer, 'setAttribute').and.callFake(() => {
          // Do nothing
         });
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openDrawing', () => {
    it('should not open a drawing if there is drawings on the canvas and user refused deletion', async () => {
      toolManagerServiceSpy.deleteAllDrawings.calls.reset();
      const mockMatDialogToFalse = fixture.componentRef.injector.get<MatDialog>(MatDialog);
      fixture.componentRef.injector.get<DialogData>(MAT_DIALOG_DATA).drawingNonEmpty = true;
      spyOn(mockMatDialogToFalse as MockMatDialog, 'open').and.returnValue({
        afterClosed: () => of(false),
      });
      await component.openDrawing(fakeDrawing);
      expect(toolManagerServiceSpy.deleteAllDrawings).not.toHaveBeenCalled();
    });

    it('should open drawing and delete canvas if there is drawings on the canvas and user confirmed deletion', async () => {
      toolManagerServiceSpy.deleteAllDrawings.calls.reset();
      spyDialog.close.calls.reset();
      fixture.componentRef.injector.get<DialogData>(MAT_DIALOG_DATA).drawingNonEmpty = true;
      const mockMatDialogToTrue = fixture.componentRef.injector.get<MatDialog>(MatDialog);
      spyOn(mockMatDialogToTrue as MockMatDialog, 'open').and.returnValue({
        afterClosed: () => of(true),
      });
      await component.openDrawing(fakeDrawing).then(() => {
        expect(toolManagerServiceSpy.deleteAllDrawings).toHaveBeenCalled();
        expect(spyDialog.close).toHaveBeenCalled();
      });
    });

    it('should put the svg elements of the drawing into the canvas when loading drawing', async () => {
      mockDialogData.drawingNonEmpty = false;
      fakeCanvas.innerHTML = '';
      fixture.componentRef.injector.get<DialogData>(MAT_DIALOG_DATA).drawingNonEmpty = false;
      component.openDrawing(fakeDrawing).then(() => {
        expect(fakeCanvas.innerHTML).toBe(fakeDrawing.svgElements);
      });
    });
  });

  describe('addSelectedTag', () => {
    it('should add tag to selectedTags list after user input and empty the htmlInputElement', () => {
      const fakeHtmlInputElement: jasmine.SpyObj<HTMLInputElement> =
        jasmine.createSpyObj('HTMLInputElement', ['value']);
      const fakeTag = 'fakeTag';
      fakeHtmlInputElement.value = fakeTag;
      const fakeInput = {input: fakeHtmlInputElement, value: fakeTag};
      component.addSelectedTag(fakeInput);
      expect(component['selectedTags']).toContain(fakeTag);
      expect(fakeHtmlInputElement.value).toBe('');
    });
  });

  describe('removeSelectedTag', () => {
    it('should delete tag from selectedTags list',  () => {
      const fakeTag = 'fakeTag';
      component['selectedTags'].push(fakeTag);
      component.removeSelectedTag('fakeTag');
      expect(component['selectedTags']).not.toContain(fakeTag);
    });
  });
  describe('openLocalDrawing', () => {
    it('should be able to open a file of correct format', () => {
      const passFileValidationSpy = spyOn(component, 'validateFileType').and.callFake(() => {
        // Do not throw an error, do nothing
      });
      const fakeDrawingString =
      `{
        "id": -1,
        "name": "abc",
        "svgElements":"<defs></defs><rect><rect>",
        "tags": [],
        "miniature": "",
        "canvasWidth": 1080,
        "canvasHeight": 500
      }`;
      const fakeObserver = new Observable((subscriber) => {
        subscriber.next(fakeDrawingString);
        subscriber.complete();
      });
      const loadFileCorrectly = spyOn(component, 'loadFile').and.returnValue(fakeObserver);
      const fakeHtmlInputElement: jasmine.SpyObj<HTMLInputElement> =
        jasmine.createSpyObj('HTMLInputElement', ['files']);
      component.openLocalDrawing(fakeHtmlInputElement);
      expect(passFileValidationSpy).toHaveBeenCalled();
      expect(loadFileCorrectly).toHaveBeenCalled();
    });
  });

  describe('validateFileType', () => {
    it('should throw an error on incorrect file type', () => {
      const incorrectFile = new File([''], 'fake.jpg');
      const failingFunction = () => {component.validateFileType(incorrectFile, 'application/json'); };
      expect(failingFunction).toThrow();
      // correct file should however not throw error
      const correctFile = new File([''], 'fake.json', {type: 'application/json'});
      expect(() => {component.validateFileType(correctFile, 'application/json'); }).not.toThrow();
    });
  });
  describe('validateJSONDrawing', () => {
    it('should throw an error on empty file', () => {
      const emptyFile = new File([''], 'fake.json', {type: 'application/json'});
      const fileReader = new FileReader();
      fileReader.readAsText(emptyFile);
      const failingFunction = () => {component.validateJSONDrawing(fileReader.result as string); };
      expect(failingFunction).toThrow();
    });
    it('should throw an error on object of format different from Drawing', () => {
      // We create a Drawing string but with the canvasHeight missing
      const incorrectDrawingString =
      `{
        "id": -1,
        "name": "abc",
        "svgElements":"<defs></defs><rect><rect>",
        "tags": [],
        "miniature": "",
        "canvasWidth": 1080
      }`;
      let failingFunction = () => {component.validateJSONDrawing(incorrectDrawingString); };
      expect(failingFunction).toThrow();
      // We also confirm that an object with the correct argument but with additional ones fails
      const extraArgumentsDrawing =
      `{
        "id": -1,
        "name": "abc",
        "svgElements":"<defs></defs><rect><rect>",
        "tags": [],
        "miniature": "",
        "canvasWidth": 1080,
        "canvasHeight": 500,
        "extraArgument": "de trop"
      }`;
      failingFunction = () => {component.validateJSONDrawing(extraArgumentsDrawing); };
      expect(failingFunction).toThrow();
      // Now we confirm it does not throw if the format is correct
      const correctDrawingString =
      `{
        "id": -1,
        "name": "abc",
        "svgElements":"<defs></defs><rect><rect>",
        "tags": [],
        "miniature": "",
        "canvasWidth": 1080,
        "canvasHeight": 500
      }`;
      const succeedingFunction = () => {component.validateJSONDrawing(correctDrawingString); };
      expect(succeedingFunction).not.toThrow();
    });
  });
  describe('makeDrawingFromJSONString', () => {
    it('should return a Drawing if given a valid json string', () => {
      const validJSONString =
      `{
        "id": -1,
        "name": "abc",
        "svgElements":"<defs></defs><rect><rect>",
        "tags": [],
        "miniature": "",
        "canvasWidth": 1080,
        "canvasHeight": 500
      }`;
      const drawing: Drawing = component.makeDrawingFromJSONString(validJSONString);
      expect(drawing.name).toBe('abc');
      expect(drawing.id).toBe(-1);
      const successfulFunction = () => {component.makeDrawingFromJSONString(validJSONString); };
      expect(successfulFunction).not.toThrow();
    });
  });
});
