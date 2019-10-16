import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EmojiToolsComponent } from './emoji-tools.component';

describe('EmojiToolsComponent', () => {
  let component: EmojiToolsComponent;
  let fixture: ComponentFixture<EmojiToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmojiToolsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmojiToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
