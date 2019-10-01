import {Component, Renderer2, Type} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {DemoMaterialModule} from '../../../material.module';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import { CreateDrawingDialogComponent } from './create-drawing-dialog.component';

/* tslint:disable:max-classes-per-file for mocking classes*/

const mockDialogRef: {close: jasmine.Spy} = {
  close: jasmine.createSpy('close'),
};

/* const mockMatDialog: {open: jasmine.Spy} = {
  open: jasmine.createSpy('open'),
}; */

const mockToolManager: {deleteAllDrawings: jasmine.Spy} = {
  deleteAllDrawings: jasmine.createSpy('deleteAllDrawings'),
};

interface WidthAndHeight {
  width: number;
  height: number;
}

class MockMatDialog {

  open(component: Component): MockMatDialog {
    return this;
  }

  afterClosed(): Observable<boolean> {
    return new Observable<boolean>( () => {
      return {unsubscribe() {return true; }, next() { return true; }};
    });
  }
}

class MockRenderer {
  // @ts-ignore
  selectRootElement(selectOrNode: any, preserveContent?: boolean): any {
    return this;
  }

  getBoundingClientRect(): WidthAndHeight {
    return {
      width: 100,
      height: 100,
    };
  }
}

// const matDialogDataSpy: jasmine.Spy = jasmine.createSpy('MAT_DIALOG_DATA').;

const matDialogDataSpy: { readonly data: boolean} = {
  get data() {
    return true;
  },
};

const formBuilder: FormBuilder = new FormBuilder();
const mockMatDialog = new MockMatDialog();

const modules: (typeof MatDialogModule)[] = [
  DemoMaterialModule,
];

describe('CreateDrawingDialogComponent', () => {
  let component: CreateDrawingDialogComponent;
  let fixture: ComponentFixture<CreateDrawingDialogComponent>;
  const mockRenderer2 = new MockRenderer();
  let renderer2: Renderer2;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      providers: [
        Renderer2,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: ToolManagerService, useValue: mockToolManager},
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataSpy },
      ],
      imports: [modules],
      declarations: [CreateDrawingDialogComponent],
    })
    .compileComponents().then( () => {
      fixture = TestBed.createComponent(CreateDrawingDialogComponent);
      renderer2 = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
      spyOn(renderer2, 'selectRootElement').and.returnValue(mockRenderer2.selectRootElement(''));
      // @ts-ignore data exists
      // spyOnProperty(matDialogDataSpy, 'data', 'get');
      // spyOn(matDialogDataSpy, 'data').and.returnValue(true);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /* beforeEach(() => {
    // fixture = TestBed.createComponent(CreateDrawingDialogComponent);
    // component = fixture.componentInstance;
    // renderer2 =  fixture.debugElement.injector.get(Renderer2);
    fixture.detectChanges();
  }); */

  it('should call renderer', () => {
    expect(renderer2.selectRootElement).toHaveBeenCalled();
  });

  it('updateWidthAndHeight should update width and height', () => {
    // @ts-ignore
    const spyOnResize = spyOn(component, 'onResize');
    window.dispatchEvent(new Event('resize'));
    expect(component.width.value === 100).toBe(true);
    expect(component.height.value === 100).toBe(true);
    expect(spyOnResize).toHaveBeenCalled();
  });

  describe('confirm button', () => {

    it('should call ToolManager.deleteAllDrawings if drawing is non empty and user confirmed deletion', async () => {
      // @ts-ignore method exists in component
      // spyOn(component, 'onSubmit');
      spyOnProperty(matDialogDataSpy, 'data', 'get').and.returnValue(true);
      const matDialogActions = fixture.debugElement.nativeElement.querySelector('mat-dialog-actions');
      const button = matDialogActions.querySelector('.mat-raised-button.mat-primary');
      button.click();
      fixture.whenStable().then(() => {
        expect(mockToolManager.deleteAllDrawings).toHaveBeenCalled();
      });
    });
  });

});
