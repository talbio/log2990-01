import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {DemoMaterialModule} from '../../../material.module';
import {GiveUpChangesDialogComponent} from './give-up-changes-dialog.component';

fdescribe('GiveUpChangesDialogComponent', () => {
  let component: GiveUpChangesDialogComponent;
  let fixture: ComponentFixture<GiveUpChangesDialogComponent>;
  const spyDialog: jasmine.SpyObj<MatDialogRef<GiveUpChangesDialogComponent>> =
    jasmine.createSpyObj('MatDialogRef', ['close']);
  spyDialog.close.and.callThrough();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      imports: [DemoMaterialModule],
      declarations: [GiveUpChangesDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: spyDialog },
      ],
    })
    .compileComponents().then( () => {
      fixture = TestBed.createComponent(GiveUpChangesDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog and return false when clicking cancel button', () => {
    component.cancel();
    expect(spyDialog.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog and return true when clicking submit button', () => {
    component.submit();
    expect(spyDialog.close).toHaveBeenCalledWith(true);
  });
});
