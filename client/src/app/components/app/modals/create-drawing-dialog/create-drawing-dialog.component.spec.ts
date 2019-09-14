import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDrawingDialogComponent } from './create-drawing-dialog.component';

describe('CreateDrawingDialogComponent', () => {
  let component: CreateDrawingDialogComponent;
  let fixture: ComponentFixture<CreateDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDrawingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDrawingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
