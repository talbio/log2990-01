import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDrawingDialogComponent } from './open-drawing-dialog.component';

describe('OpenListDrawingsServerComponent', () => {
  let component: OpenDrawingDialogComponent;
  let fixture: ComponentFixture<OpenDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenDrawingDialogComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDrawingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
