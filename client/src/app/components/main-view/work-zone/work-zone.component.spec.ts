import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import { WorkZoneComponent } from './work-zone.component';

describe('WorkZoneComponent', () => {
  let component: WorkZoneComponent;
  let fixture: ComponentFixture<WorkZoneComponent>;
  // tslint:disable-next-line:prefer-const
  let toolManagerServiceStub: Partial<ToolManagerService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkZoneComponent ],
      providers:    [
        {provide: ToolManagerService, useValue: toolManagerServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkZoneComponent);
    component = fixture.componentInstance;
    toolManagerServiceStub = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerServiceStub = TestBed.get(ToolManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
