import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenListDrawingsServerComponent } from './open-list-drawings-server.component';

describe('OpenListDrawingsServerComponent', () => {
  let component: OpenListDrawingsServerComponent;
  let fixture: ComponentFixture<OpenListDrawingsServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenListDrawingsServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenListDrawingsServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
