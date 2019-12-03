import {Component} from '@angular/core';
import { EraserService } from 'src/app/services/tools/eraser/eraser.service';

@Component({
  selector: 'app-eraser-tools',
  templateUrl: './eraser-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class EraserToolsComponent {

  constructor(protected eraser: EraserService) { }

}
