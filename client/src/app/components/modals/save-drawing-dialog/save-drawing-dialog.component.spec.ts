import {Renderer2, Type} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import { MatDialogRef} from '@angular/material/dialog';
import {NotifierModule, NotifierService} from 'angular-notifier';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import {DemoMaterialModule} from '../../../material.module';
import {DrawingsService} from '../../../services/back-end/drawings/drawings.service';
import { SaveDrawingDialogComponent } from './save-drawing-dialog.component';

/* tslint:disable:max-classes-per-file for mocking classes*/

/* -------------------------------- MOCK ENVIRONMENT ----------------------------------------- */

const HTTP_POST_DRAWING_FAILED_MSG = 'La sauvegarde du dessin a échoué! Veuillez réessayer.';
const HTTP_POST_DRAWING_SUCCEEDED_MSG = 'Votre dessin a bien été sauvegardé!';

const spyDialog: jasmine.SpyObj<MatDialogRef<SaveDrawingDialogComponent>> =
  jasmine.createSpyObj('MatDialogRef', ['close']);
spyDialog.close.and.callThrough();

const drawingsServiceSpy: jasmine.SpyObj<DrawingsService> =
  jasmine.createSpyObj('SaveDrawingService', ['httpPostDrawing', 'localPostDrawing']);

const notifierServiceSpy: jasmine.SpyObj<NotifierService> =
  jasmine.createSpyObj('NotifierService', ['notify']);

const htmlElementSpy: jasmine.SpyObj<HTMLElement> =
  jasmine.createSpyObj('HTMLElement', ['getAttribute', 'innerHTML']);

htmlElementSpy.getAttribute.and.returnValue('100');
const fakeHTML = '';
htmlElementSpy.innerHTML = fakeHTML;

const formBuilder: FormBuilder = new FormBuilder();

/* ------------------------------------------------------------------------------------------ */

describe('SaveDrawingDialogComponent', () => {
  let component: SaveDrawingDialogComponent;
  let fixture: ComponentFixture<SaveDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaveDrawingDialogComponent],
      providers: [
        Renderer2,
        { provide: MatDialogRef, useValue: spyDialog },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: DrawingsService, useValue: drawingsServiceSpy },
        { provide: NotifierService, useValue: notifierServiceSpy },
        { provide: ToolManagerService },
      ],
      imports: [NotifierModule, DemoMaterialModule],
    })
    .compileComponents().then( () => {
      fixture = TestBed.createComponent(SaveDrawingDialogComponent);
      const renderer2 = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
      spyOn(renderer2, 'selectRootElement').and.returnValue(htmlElementSpy);
      spyOn(renderer2, 'setAttribute').and.returnValue();
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('addTag should addSelectedTag a tag form control to the tags form array', () => {
    component = fixture.componentInstance;
    expect(component.tags.controls.length).toBe(0);
    component.addTag();
    expect(component.tags.controls.length).toBe(1);
  });

  it('deleteTag at index i should delete tag form control at index i from tags form array', () => {
    component = fixture.componentInstance;
    component.addTag();
    component.deleteTag(0);
    expect(component.tags.controls.length).toBe(0);
  });

  it('close should close the dialog', () => {
    component = fixture.componentInstance;
    component.close();
    expect(spyDialog.close).toHaveBeenCalled();
  });

  it('submit should close the dialog and notify user that his drawing was saved if the http post was successful', async () => {
    component = fixture.componentInstance;
    drawingsServiceSpy.httpPostDrawing.and.returnValue(Promise.resolve(true));
    await component.submit();
    expect(notifierServiceSpy.notify).toHaveBeenCalledWith('success', HTTP_POST_DRAWING_SUCCEEDED_MSG);
    expect(spyDialog.close).toHaveBeenCalled();
  });

  it('submit should not close the dialog and notify user that his drawings has not been saved if the http post failed', async () => {
    component = fixture.componentInstance;
    spyDialog.close.calls.reset();
    drawingsServiceSpy.httpPostDrawing.and.returnValue(Promise.resolve(false));
    await component.submit().then( () => {
      expect(notifierServiceSpy.notify).toHaveBeenCalledWith('error', HTTP_POST_DRAWING_FAILED_MSG);
      expect(spyDialog.close).not.toHaveBeenCalled();
    });
  });

  it('submit should set httPosting variable to true while executing and set it back to false when done executing', async () => {
    component = fixture.componentInstance;
    // @ts-ignore changing return type of promise to void for testing purposes
    drawingsServiceSpy.httpPostDrawing.and.callFake( () => Promise.resolve(expect(component.isPostingToServer).toBe(true)));
    await component.submit();
    expect(component.isPostingToServer).toBe(false);
  });
  describe('submitLocal', () => {
    it('should set localPosting variable to true while executing and set it back to false when done executing ', async () => {
    // component = fixture.componentInstance;
    // @ts-ignore changing return type of promise to void for testing purposes
    drawingsServiceSpy.localPostDrawing.and.callFake( () => Promise.resolve(expect(component.isPostingLocally).toBe(true)));
    await component.submitLocal();
    expect(component.isPostingLocally).toBe(false);
    });
  });

});
