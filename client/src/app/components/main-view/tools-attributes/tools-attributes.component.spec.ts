import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsAttributesComponent } from './tools-attributes.component';

describe('ToolsAttributeComponent', () => {
  let component: ToolsAttributesComponent;
  let fixture: ComponentFixture<ToolsAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolsAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
