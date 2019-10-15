import {Component} from '@angular/core';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';

@Component({
  selector: 'app-emoji-tools',
  templateUrl: './emoji-tools.component.html',
})
export class EmojiToolsComponent {

  constructor(protected emojiGenerator: EmojiGeneratorService) { }

}
