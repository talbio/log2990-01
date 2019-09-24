import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit {

  @Input() width: number;
  @Input() height: number;

  constructor() {
    this.width = 800;
    this.height = 400;
  }

  ngOnInit() {
  }

}
