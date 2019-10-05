import { ComponentPortal } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatCardContent } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CreateDrawingFormValues } from '../../../data-structures/CreateDrawingFormValues';
import { ToolsAttributesComponent } from '../tools-attributes/tools-attributes.component';
import { WorkZoneComponent } from '../work-zone/work-zone.component';

@Component({
  selector: 'app-drawing-view',
  templateUrl: './drawing-view.component.html',
  styleUrls: ['./drawing-view.component.scss'],
})
export class DrawingViewComponent implements AfterViewInit {
  @ViewChild('workZoneComponent', { static: false }) workZoneComponent: WorkZoneComponent;
  @ViewChild('attributesSideNav', { static: false }) attributesSideNav: MatSidenavModule;
  @ViewChild('toolsAttributes', { static: false }) toolsAttributes: MatCardContent;

  protected toolAttributesComponent: ComponentPortal<ToolsAttributesComponent>;
  constructor(private cd: ChangeDetectorRef) {
    this.toolAttributesComponent = new ComponentPortal(ToolsAttributesComponent);
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  protected onCreateDrawing(formValues: CreateDrawingFormValues) {
    this.workZoneComponent.color = formValues.color;
    this.workZoneComponent.height = formValues.height;
    this.workZoneComponent.width = formValues.width;
  }

}
