import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractDialogButtonComponent } from './abstract-dialog-button.component';

describe('AbstractDialogButtonComponent', () => {
  let component: AbstractDialogButtonComponent;
  let fixture: ComponentFixture<AbstractDialogButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractDialogButtonComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractDialogButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
