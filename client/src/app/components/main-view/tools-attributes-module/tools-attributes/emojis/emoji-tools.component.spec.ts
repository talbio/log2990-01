import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoMaterialModule } from 'src/app/material.module';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { EmojiToolsComponent } from './emoji-tools.component';

fdescribe('EmojiToolsComponent', () => {
  let component: EmojiToolsComponent;
  let fixture: ComponentFixture<EmojiToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmojiToolsComponent ],
      imports: [DemoMaterialModule],
      providers: [  EmojiGeneratorService ],
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(EmojiToolsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have atleast five emojis to choose from', () => {
    const emojiService = fixture.debugElement.injector.get(EmojiGeneratorService);
    expect(emojiService.getEmojis().length).toBe(6);
  });
});
