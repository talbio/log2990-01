import { Component, OnInit } from '@angular/core';
import { ShapeGeneratorService } from '../../shapeGenerator.service';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss']
})
export class LateralBarComponent implements OnInit {

  constructor(private service: ShapeGeneratorService) { }

  ngOnInit() {
  }

  no(){
    this.service.printRectangle();
  }
}
