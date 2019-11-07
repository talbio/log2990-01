import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoMaterialModule } from 'src/app/material.module';
import { MousePositionService } from 'src/app/services/mouse-position/mouse-position.service';
import { EraserService } from 'src/app/services/tools/eraser/eraser.service';
import { EraserToolsComponent } from './eraser-tools.component';

describe('EraserToolsComponent', () => {
  let component: EraserToolsComponent;
  let fixture: ComponentFixture<EraserToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EraserToolsComponent ],
      imports: [DemoMaterialModule],
      providers: [  EraserService, MousePositionService ],
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(EraserToolsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
