import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveDrawingDialogComponent } from './save-drawing-dialog.component';

describe('SaveDrawingDialogComponent', () => {
  let component: SaveDrawingDialogComponent;
  let fixture: ComponentFixture<SaveDrawingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveDrawingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveDrawingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
