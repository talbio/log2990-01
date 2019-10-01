import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {DemoMaterialModule} from '../../../material.module';
import { GiveUpChangesDialogComponent } from './give-up-changes-dialog.component';

fdescribe('ConfirmGiveUpChangesDialogComponent', () => {
  let component: GiveUpChangesDialogComponent;
  let fixture: ComponentFixture<GiveUpChangesDialogComponent>;

  const mockDialogRef: {close: jasmine.Spy} = {
    close: jasmine.createSpy('close', (bool: boolean) => bool),
  };

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoMaterialModule],
      declarations: [ GiveUpChangesDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    })
    .compileComponents().then( () => {
      fixture = TestBed.createComponent(GiveUpChangesDialogComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog and return false when clicking cancel button', () => {
    const matDialogActions = fixture.debugElement.nativeElement.querySelector('mat-dialog-actions');
    const cancelButton = matDialogActions.querySelector('button[color=\'warn\']');
    cancelButton.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
