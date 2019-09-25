import { BrushGeneratorService } from './../../../services/tools/brush-generator/brush-generator.service';
import {AfterViewInit, Component, HostListener, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconRegistry} from '@angular/material/icon';
import {MatSidenav} from '@angular/material/sidenav';
import {DomSanitizer} from '@angular/platform-browser';
import {ToolSelectorService} from '../../../services/tools/tool-selector/tool-selector.service';
import {CreateDrawingDialogComponent} from '../../app/modals/create-drawing-dialog/create-drawing-dialog.component';
import {WorkZoneComponent} from '../work-zone/work-zone.component';

export interface FormValues {
  color: string;
  height: number;
  width: number;
}

const RECTANGLE_ICON_PATH = '../../../../assets/svg-icons/rectangle-icon.svg';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss'],
})
export class LateralBarComponent implements AfterViewInit {
  @ViewChild('workZoneComponent', {static: false}) workZoneComponent: WorkZoneComponent;
  @ViewChild('attributesSideNav', {static: false}) attributeSideNav: MatSidenav;

  protected appropriateClass = '';
  private backGroundColor = '#FFFFFF';

  // TODO: this boolean has to be moved to a service which will keep track of the drawings of the current drawing.
  // set to true for testing purposes
  private drawingNonEmpty = true;
  private workZoneHeight: number;
  private workZoneWidth: number;

  constructor(private dialog: MatDialog,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private toolSelector: ToolSelectorService,
              // TODO: verify if the service is the right one
              private brush: BrushGeneratorService) {
              // TODO: manage the attributes of each tools
              // toolManagerService
              // toolAttributeManager
    this.matIconRegistry.addSvgIcon(
      'rectangle',
      this.domSanitizer.bypassSecurityTrustResourceUrl(RECTANGLE_ICON_PATH),
    );

    this.getScreenHeight();
  }

  protected setPencilTool() {
    this.toolSelector.setPencilTool();
  }

  protected setRectangleTool() {
    this.toolSelector.setRectangleTool();
  }

  protected setBrushTool() {
    this.toolSelector.setBrushTool();
  }

  /**
   * @desc when the window gets to small,
   * this listener prevents the bottom buttons to mix with the top buttons
   * of the tools side nav.
   */
  @HostListener('window:resize', ['$event'])
  getScreenHeight(event?: any) {
    if (window.innerHeight <= 412) {
      this.appropriateClass = 'bottomRelative';
    } else {
      this.appropriateClass = 'bottomStick';
    }
  }

  ngAfterViewInit() {
    this.workZoneHeight =  400; // this.workZoneComponent.nativeElement.offsetHeight;
    this.workZoneWidth = 800; // this.workZoneComponent.nativeElement.offsetWidth;
    console.log(this.workZoneHeight);
    console.log(this.workZoneWidth);
  }

  protected openCreateDrawingDialog() {
    const dialogRef = this.dialog.open(CreateDrawingDialogComponent, {
      autoFocus: false,
      data: {
        drawingNonEmpty: this.drawingNonEmpty,
        height: this.workZoneHeight,
        width: this.workZoneWidth,
      },
    });
    dialogRef.afterClosed().subscribe((formResult: FormValues) => {
      this.backGroundColor = formResult.color;
      this.workZoneComponent.height = formResult.height;
      this.workZoneComponent.width = formResult.width;
    });
  }

  // TODO: use renderer to display the right attributes depending on the selected tool
  protected displayToolAttributes() {
  }

  /**
   * @desc: Sets the background color of the work zone
   */
  protected setBackGroundColor() {
    return {
      'background-color': this.backGroundColor,
    };
  }

  setbrushPattern(pattern: number){
    this.brush.setCurrentBrushPattern(pattern);
  }
}
