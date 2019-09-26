import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveUpChangesDialogComponent } from './give-up-changes-dialog.component';

describe('ConfirmGiveUpChangesDialogComponent', () => {
  let component: GiveUpChangesDialogComponent;
  let fixture: ComponentFixture<GiveUpChangesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GiveUpChangesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GiveUpChangesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
