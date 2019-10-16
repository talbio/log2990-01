import { Component, OnInit } from '@angular/core';
import {LineGeneratorService} from '../../../../../services/tools/line-generator/line-generator.service';

@Component({
  selector: 'app-line-tools',
  templateUrl: './line-tools.component.html',
  styleUrls: ['./line-tools.component.scss'],
})
export class LineToolsComponent implements OnInit {

  constructor(protected lineGenerator: LineGeneratorService) { }

  ngOnInit() {
  }

}
