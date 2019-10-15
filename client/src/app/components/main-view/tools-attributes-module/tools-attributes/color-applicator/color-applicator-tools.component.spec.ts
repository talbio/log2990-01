import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorApplicatorToolsComponent } from './color-applicator-tools.component';

describe('ColorApplicatorToolsComponent', () => {
  let component: ColorApplicatorToolsComponent;
  let fixture: ComponentFixture<ColorApplicatorToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorApplicatorToolsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorApplicatorToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
