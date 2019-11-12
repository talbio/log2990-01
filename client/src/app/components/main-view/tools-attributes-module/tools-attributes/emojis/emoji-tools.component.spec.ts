/*import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoMaterialModule } from 'src/app/material.module';
import { MousePositionService } from 'src/app/services/mouse-position/mouse-position.service';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { EmojiToolsComponent } from './emoji-tools.component';

describe('EmojiToolsComponent', () => {
  let fixture: ComponentFixture<EmojiToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmojiToolsComponent ],
      imports: [DemoMaterialModule],
      providers: [  EmojiGeneratorService, MousePositionService ],
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(EmojiToolsComponent);
      fixture.detectChanges();
    });
  }));

  it('should have atleast five emojis to choose from', () => {
    const emojiService = fixture.debugElement.injector.get(EmojiGeneratorService);
    expect(emojiService.getEmojis().length).toBeGreaterThanOrEqual(5);
  });
});*/
