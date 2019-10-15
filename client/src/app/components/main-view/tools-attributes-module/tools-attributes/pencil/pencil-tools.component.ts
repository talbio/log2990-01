import { Component, OnInit } from '@angular/core';
import {PencilGeneratorService} from '../../../../../services/tools/pencil-generator/pencil-generator.service';

@Component({
  selector: 'app-pencil-tools',
  templateUrl: './pencil-tools.component.html',
  styleUrls: ['./pencil-tools.component.scss'],
})
export class PencilToolsComponent implements OnInit {

  constructor(protected pencilGenerator: PencilGeneratorService) { }

  ngOnInit() {
  }

}
