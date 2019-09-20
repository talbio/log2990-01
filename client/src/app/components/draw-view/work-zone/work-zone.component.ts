import { Component, OnInit } from '@angular/core';
import { ShapeGeneratorService } from './../../shapeGenerator.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss']
})
export class WorkZoneComponent implements OnInit {

  constructor(private service: ShapeGeneratorService) { }

  ngOnInit() {}

  fctMouseDown(e: any){
    this.service.createRectangle(e);
  }

  fctMouseMove(e: any){
    this.service.updateRectangle(e);
  }
  fctMouseUp(e: any){
    this.service.finishRectangle(e);
  }
}
