import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EllipseToolsComponent } from './ellipse-tools.component';

describe('EllipseToolsComponent', () => {
  let component: EllipseToolsComponent;
  let fixture: ComponentFixture<EllipseToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EllipseToolsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EllipseToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
