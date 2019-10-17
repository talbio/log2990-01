import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RectangleToolsComponent } from './rectangle-tools.component';

describe('RectangleToolsComponent', () => {
  let component: RectangleToolsComponent;
  let fixture: ComponentFixture<RectangleToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RectangleToolsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RectangleToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
