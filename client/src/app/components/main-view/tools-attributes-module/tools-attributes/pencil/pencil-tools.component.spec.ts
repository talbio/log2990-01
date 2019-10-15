import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PencilToolsComponent } from './pencil-tools.component';

describe('PencilToolsComponent', () => {
  let component: PencilToolsComponent;
  let fixture: ComponentFixture<PencilToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PencilToolsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PencilToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
