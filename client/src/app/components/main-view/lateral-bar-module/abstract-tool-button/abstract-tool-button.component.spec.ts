import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractToolButtonComponent } from './abstract-tool-button.component';

describe('GenericButtonComponent', () => {
  let component: AbstractToolButtonComponent;
  let fixture: ComponentFixture<AbstractToolButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractToolButtonComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractToolButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
