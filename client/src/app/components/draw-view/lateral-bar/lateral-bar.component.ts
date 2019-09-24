import { Component, OnInit } from '@angular/core';
import { ToolSelectorService } from '../../../services/tools/tool-selector/tool-selector.service';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss'],
})
export class LateralBarComponent implements OnInit {

  constructor(private toolSelector: ToolSelectorService) {}

  ngOnInit() {}

  buttonPen() {
    this.toolSelector.setPenTool();
  }

  buttonRectangle() {
    this.toolSelector.setRectangleTool();
  }

  // no(){
  //   this.service.printRectangle();
  // }
}
