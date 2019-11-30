import { Component, EventEmitter, Output } from '@angular/core';
import { ColorService } from 'src/app/services/tools/color/color.service';

@Component({
    selector: 'app-last-ten-colors',
    templateUrl: './last-ten-colors.component.html',
    styleUrls: ['./last-ten-colors.component.scss'],
  })

  export class LastTenColorsComponent {

    @Output()
    colorSelected: EventEmitter<string> = new EventEmitter(true);

    constructor(protected colorService: ColorService) {}

    selectColor(color: string): void {
      this.colorSelected.emit(color);
    }
  }
