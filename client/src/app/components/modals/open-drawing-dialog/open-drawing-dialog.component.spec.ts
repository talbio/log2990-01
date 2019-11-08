import {Component, Renderer2, Type} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {Drawing} from '../../../../../../common/communication/Drawing';
import {DemoMaterialModule} from '../../../material.module';
import {DrawingsService} from '../../../services/back-end/drawings/drawings.service';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {DialogData} from '../create-drawing-dialog/create-drawing-dialog.component';
import {FilterByTags} from './filter-by-tags.pipe';
import {OpenDrawingDialogComponent} from './open-drawing-dialog.component';

/* tslint:disable:max-classes-per-file for mocking classes*/
/* tslint:disable:no-string-literal for testing purposes*/

/* -------------------------------- MOCK ENVIRONMENT ----------------------------------------- */

const spyDialog: jasmine.SpyObj<MatDialogRef<OpenDrawingDialogComponent>> =
  jasmine.createSpyObj('MatDialogRef', ['close']);
spyDialog.close.and.callThrough();

const toolManagerServiceSpy: jasmine.SpyObj<ToolManagerService> =
  jasmine.createSpyObj('ToolManagerService', ['deleteAllDrawings', 'synchronizeAllCounters']);
toolManagerServiceSpy.deleteAllDrawings.and.callThrough();

const drawingsServiceSpy: jasmine.SpyObj<DrawingsService> =
  jasmine.createSpyObj('DrawingsService', ['httpPostDrawing', 'httpGetDrawings']);
drawingsServiceSpy.httpGetDrawings.and.returnValue(of());

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
const fakeDrawing: Drawing = {id: -1, name: '', tags: [], svgElements: '<svg></svg>', miniature: ''};
/* ------------------------------------------------------------------------------------------ */

describe('OpenDrawingDialogComponent', () => {
  let component: OpenDrawingDialogComponent;
  let fixture: ComponentFixture<OpenDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OpenDrawingDialogComponent, FilterByTags],
      imports: [DemoMaterialModule],
      providers: [
        Renderer2,
        {provide: MatDialogRef, useValue: spyDialog},
        {provide: ToolManagerService, useValue: toolManagerServiceSpy},
        {provide: DrawingsService, useValue: drawingsServiceSpy},
        {provide: MatDialog, useValue: mockMatDialog},
        {provide: MAT_DIALOG_DATA, useValue: mockDialogData},
      ],
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(OpenDrawingDialogComponent);
        const renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
        spyOn(renderer, 'selectRootElement').and.returnValue(fakeCanvas);
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
});
