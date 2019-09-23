import { Component, OnInit } from '@angular/core';
import { ButtonManagerService } from './../../../services/buttonManager.service';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss']
})
export class LateralBarComponent implements OnInit {

  constructor(private service: ButtonManagerService) {}

  ngOnInit() {}

  buttonPen(){
    this.service.activatePen();
  }

  buttonRectangle(){
    this.service.activateRectangle();
  }

  // no(){
  //   this.service.printRectangle();
  // }
}
