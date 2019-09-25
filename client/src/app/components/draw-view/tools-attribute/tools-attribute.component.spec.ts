import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsAttributeComponent } from './tools-attribute.component';

describe('ToolsAttributeComponent', () => {
  let component: ToolsAttributeComponent;
  let fixture: ComponentFixture<ToolsAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolsAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
