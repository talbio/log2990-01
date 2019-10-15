import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushToolsComponent } from './brush-tools.component';

describe('BrushToolsComponent', () => {
  let component: BrushToolsComponent;
  let fixture: ComponentFixture<BrushToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrushToolsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrushToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
