import { Component } from '@angular/core';
import { PlotType } from '../../../../../data-structures/plot-type';
import { GridTogglerService } from './../../../../../services/tools/grid/grid-toggler.service';

@Component({
  selector: 'app-grid-tools',
  templateUrl: './grid.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})

export class GridComponent {

  constructor(protected gridService: GridTogglerService) {
  }

  protected get PlotType() {
    return PlotType;
  }

}
