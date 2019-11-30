import { Component } from '@angular/core';
import { PlotType } from '../../../../../data-structures/plot-type';
import { GridTogglerService } from './../../../../../services/tools/grid/grid-toggler.service';

interface SelectionDot {
  x: number;
  y: number;
  color: string;
}

@Component({
  selector: 'app-grid-tools',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})

export class GridComponent {
protected selectionDots: SelectionDot[];
  constructor(protected gridService: GridTogglerService) {
    this.selectionDots = [{x: 10, y: 10, color: 'red'}, {x: 60, y: 10, color: 'white'}, {x: 110, y: 10, color: 'white'},
    {x: 10, y: 35, color: 'white'}, {x: 60, y: 35, color: 'white'}, {x: 110, y: 35, color: 'white'}, {x: 10, y: 60, color: 'white'},
    {x: 60, y: 60, color: 'white'}, {x: 110, y: 60, color: 'white'} ];
  }

  protected get PlotType() {
    return PlotType;
  }

  showSelectedMagneticDot(dotNumber: number): void {
    this.selectionDots.forEach((dot) => {
      dot.color = 'white';
    });
    this.selectionDots[dotNumber].color = 'red';
  }

}
