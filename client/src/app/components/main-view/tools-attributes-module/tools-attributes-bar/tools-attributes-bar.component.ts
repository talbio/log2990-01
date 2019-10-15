import { Component } from '@angular/core';
import { Tools } from '../../../../data-structures/Tools';
import { ToolManagerService } from '../../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-tools-attributes',
  templateUrl: './tools-attributes-bar.component.html',
  styleUrls: ['./tools-attributes-bar.component.scss'],
})
export class ToolsAttributesBarComponent {

  constructor(protected toolManager: ToolManagerService) {
  }

  protected get Tools() {
    return Tools;
  }

}
