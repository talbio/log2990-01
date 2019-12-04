import { Component} from '@angular/core';
import { GridTogglerService } from 'src/app/services/tools/grid/grid-toggler.service';

interface SelectionDot {
  x: number;
  y: number;
  color: string;
}

@Component({
  selector: 'app-selector-tools',
  templateUrl: './selector-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class SelectorToolsComponent {
  protected selectionDots: SelectionDot[];
  constructor(protected gridService: GridTogglerService) {
    this.selectionDots = [{x: 10, y: 10, color: 'red'}, {x: 60, y: 10, color: 'white'}, {x: 110, y: 10, color: 'white'},
    {x: 10, y: 35, color: 'white'}, {x: 60, y: 35, color: 'white'}, {x: 110, y: 35, color: 'white'}, {x: 10, y: 60, color: 'white'},
    {x: 60, y: 60, color: 'white'}, {x: 110, y: 60, color: 'white'} ];
    this.showSelectedMagneticDot(this.gridService.selectedDot);
  }

  showSelectedMagneticDot(dotNumber: number): void {
    this.selectionDots.forEach((dot) => {
      dot.color = 'white';
    });
    this.selectionDots[dotNumber].color = 'red';
  }
}
