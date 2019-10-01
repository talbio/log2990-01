import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {Renderer2, Type} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
// import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {DemoMaterialModule} from '../../../material.module';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import { CreateDrawingDialogComponent } from './create-drawing-dialog.component';

const mockDialogRef: {close: jasmine.Spy} = {
  close: jasmine.createSpy('close'),
};

const mockMatDialog: {open: jasmine.Spy} = {
  open: jasmine.createSpy('open'),
};

const mockToolManager: {deleteAllDrawings: jasmine.Spy} = {
  deleteAllDrawings: jasmine.createSpy('deleteAllDrawings'),
};

interface WidthAndHeight {
  width: number;
  height: number;
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

const matDialogDataSpy: jasmine.Spy = jasmine.createSpy('MAT_DIALOG_DATA');

const formBuilder: FormBuilder = new FormBuilder();

const modules: (typeof MatDialogModule)[] = [
  DemoMaterialModule,
];

fdescribe('CreateDrawingDialogComponent', () => {
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

});
