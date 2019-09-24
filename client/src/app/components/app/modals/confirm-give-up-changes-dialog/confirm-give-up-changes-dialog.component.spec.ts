import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmGiveUpChangesDialogComponent } from './confirm-give-up-changes-dialog.component';

describe('ConfirmGiveUpChangesDialogComponent', () => {
  let component: ConfirmGiveUpChangesDialogComponent;
  let fixture: ComponentFixture<ConfirmGiveUpChangesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmGiveUpChangesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmGiveUpChangesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
