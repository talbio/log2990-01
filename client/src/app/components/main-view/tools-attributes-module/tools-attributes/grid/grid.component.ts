import { Component } from '@angular/core';
import { PlotType } from '../../../../../data-structures/PlotType';
import { GridTogglerService } from './../../../../../services/tools/grid/grid-toggler.service';

@Component({
  selector: 'app-grid-tools',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {

  constructor(protected gridService: GridTogglerService) { }

  protected get PlotType() {
    return PlotType;
  }

}
