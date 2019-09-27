
import { Component } from '@angular/core';
import { ColorService } from 'src/app/services/tools/color/color.service';


@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss'],
})
export class ColorToolComponent {

  
  constructor(protected colorModifier: ColorService) { }

}
