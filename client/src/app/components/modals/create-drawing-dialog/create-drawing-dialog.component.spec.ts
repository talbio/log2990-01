import {Component, Renderer2, Type} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {CreateDrawingFormValues} from '../../../data-structures/CreateDrawingFormValues';
import {DemoMaterialModule} from '../../../material.module';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {CreateDrawingDialogComponent, DialogData} from './create-drawing-dialog.component';

/* tslint:disable:max-classes-per-file for mocking classes*/

/* -------------------------------- MOCK ENVIRONMENT ----------------------------------------- */

const spyDialog: jasmine.SpyObj<MatDialogRef<CreateDrawingDialogComponent>> =
  jasmine.createSpyObj('MatDialogRef', ['close']);
spyDialog.close.and.callThrough();

const spyToolManager: jasmine.SpyObj<ToolManagerService> =
  jasmine.createSpyObj('ToolManagerService', ['deleteAllDrawings']);
spyToolManager.deleteAllDrawings.and.callThrough();

const mockDialogData: DialogData = {drawingNonEmpty: true};

interface WidthAndHeight {
  width: number;
  height: number;
}

class MockMatDialog {
  open(component: Component) {
    return {
      afterClosed: () => of(false),
    };
  }
}

class MockRenderer {
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
const formBuilder: FormBuilder = new FormBuilder();
const mockMatDialog = new MockMatDialog();

/* ------------------------------------------------------------------------------------------ */

describe('CreateDrawingDialogComponent', () => {
  let component: CreateDrawingDialogComponent;
  let fixture: ComponentFixture<CreateDrawingDialogComponent>;
  const mockRenderer2 = new MockRenderer();
  let renderer2: Renderer2;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      providers: [
        Renderer2,
        { provide: MatDialogRef, useValue: spyDialog },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: ToolManagerService, useValue: spyToolManager},
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
      imports: [DemoMaterialModule],
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call renderer2', () => {
    expect(renderer2.selectRootElement).toHaveBeenCalled();
  });

  describe('clear', () => {
    it('should clear form value when called', () => {
      component.clear(component.height);
      expect(component.height.value).toBe('');
    });
  });

  describe('onResize', () => {
    it(' should be called on a window:resize Event and call updateWidthAndHeight', () => {
      const spyOnResize = spyOn(component, 'onResize');
      window.dispatchEvent(new Event('resize'));
      expect(component.width.value === 100).toBe(true);
      expect(component.height.value === 100).toBe(true);
      expect(spyOnResize).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should not call ToolManager.deleteAllDrawings if user refused deletion', async () => {
      const mockMatDialogToFalse = fixture.componentRef.injector.get<MatDialog>(MatDialog);
      spyOn(mockMatDialogToFalse as MockMatDialog, 'open').and.returnValue({
        afterClosed: () => of(false),
      });
      await component.submit();
      expect(spyToolManager.deleteAllDrawings).not.toHaveBeenCalled();
    });

    it('should call ToolManager.deleteAllDrawings if drawing is non empty and user confirmed deletion', async () => {
      const mockMatDialogToTrue = fixture.componentRef.injector.get<MatDialog>(MatDialog);
      spyOn(mockMatDialogToTrue as MockMatDialog, 'open').and.returnValue({
        afterClosed: () => of(true),
      });
      component.submit().then( () => {
        expect(spyToolManager.deleteAllDrawings).toHaveBeenCalled();
        expect(spyDialog.close).toHaveBeenCalled();
      });
    });

    it('should just close dialog if drawing is empty', async () => {
      const mockDialogDataToFalse = fixture.componentRef.injector.get<DialogData>(MAT_DIALOG_DATA);
      mockDialogDataToFalse.drawingNonEmpty = false;
      component.submit().then( () => expect(spyDialog.close).toHaveBeenCalled());
    });

    it('should send form values when dialog is closed', async () => {
      const mockDialogDataToFalse = fixture.componentRef.injector.get<DialogData>(MAT_DIALOG_DATA);
      mockDialogDataToFalse.drawingNonEmpty = false;
      const expectedFormValues: CreateDrawingFormValues = {
        height: component.height.value,
        width: component.width.value,
        color: component.color.value,
      };
      component.submit().then( () => expect(spyDialog.close).toHaveBeenCalledWith(expectedFormValues));
    });
  });

});
