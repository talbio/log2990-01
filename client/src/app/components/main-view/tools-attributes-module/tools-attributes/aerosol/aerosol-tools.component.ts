import { Component } from '@angular/core';
import { AerosolGeneratorService } from './../../../../../services/tools/aerosol-generator/aerosol-generator.service';

@Component({
  selector: 'app-aerosol-tools',
  templateUrl: './aerosol-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class AerosolToolsComponent {

  constructor(protected aerosol: AerosolGeneratorService) { }

}
