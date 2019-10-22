import {Renderer2} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {NotifierModule, NotifierService} from 'angular-notifier';
import {DemoMaterialModule} from '../../../material.module';
import {DrawingsService} from '../../../services/back-end/drawings/drawings.service';
import {RendererLoaderService} from '../../../services/renderer-loader/renderer-loader.service';
import { SaveDrawingDialogComponent } from './save-drawing-dialog.component';

/* tslint:disable:max-classes-per-file for mocking classes*/

/* -------------------------------- MOCK ENVIRONMENT ----------------------------------------- */

const HTTP_POST_DRAWING_FAILED_MSG = 'La sauvegarde du dessin a échoué! Veuillez réessayer.';
const HTTP_POST_DRAWING_SUCCEEDED_MSG = 'Votre dessin a bien été sauvegardé!';

const spyDialog: jasmine.SpyObj<MatDialogRef<SaveDrawingDialogComponent>> =
  jasmine.createSpyObj('MatDialogRef', ['close']);
spyDialog.close.and.callThrough();

const drawingsServiceSpy: jasmine.SpyObj<DrawingsService> =
  jasmine.createSpyObj('SaveDrawingService', ['httpPostDrawing']);

const notifierServiceSpy: jasmine.SpyObj<NotifierService> =
  jasmine.createSpyObj('NotifierService', ['notify']);

const rendererSpy: jasmine.SpyObj<Renderer2> =
  jasmine.createSpyObj('Renderer2', ['selectRootElement', 'setAttribute']);
const rendererLoaderServiceSpy: jasmine.SpyObj<RendererLoaderService> =
  jasmine.createSpyObj('RendererLoaderService', ['_renderer']);
rendererLoaderServiceSpy._renderer = rendererSpy;
const htmlElementSpy: jasmine.SpyObj<HTMLElement> =
  jasmine.createSpyObj('HTMLElement', ['getAttribute', 'innerHTML']);
rendererSpy.selectRootElement.and.returnValue(htmlElementSpy);
htmlElementSpy.getAttribute.and.returnValue('100');
const fakeHTML = '';
htmlElementSpy.innerHTML = fakeHTML;

const formBuilder: FormBuilder = new FormBuilder();

/* ------------------------------------------------------------------------------------------ */

fdescribe('SaveDrawingDialogComponent', () => {
  let component: SaveDrawingDialogComponent;
  let fixture: ComponentFixture<SaveDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaveDrawingDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: spyDialog },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: DrawingsService, useValue: drawingsServiceSpy },
        { provide: NotifierService, useValue: notifierServiceSpy },
        { provide: RendererLoaderService, useValue: rendererLoaderServiceSpy},
      ],
      imports: [NotifierModule, DemoMaterialModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveDrawingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

});
