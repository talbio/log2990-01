import {ComponentPortal} from '@angular/cdk/portal';
import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatCardContent} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {MatIconRegistry} from '@angular/material/icon';
import {MatSidenav} from '@angular/material/sidenav';
import {DomSanitizer} from '@angular/platform-browser';
import {Tools} from '../../../data-structures/Tools';
import {ToolSelectorService} from '../../../services/tools/tool-selector/tool-selector.service';
import {CreateDrawingDialogComponent} from '../../modals/create-drawing-dialog/create-drawing-dialog.component';
import {ToolsAttributesComponent} from '../tools-attributes/tools-attributes.component';
import {WorkZoneComponent} from '../work-zone/work-zone.component';

export interface FormValues {
  color: string;
  height: number;
  width: number;
}

const RECTANGLE_ICON_PATH = '../../../../assets/svg-icons/rectangle-icon.svg';

@Component({
  selector: 'app-drawing-view',
  templateUrl: './drawing-view.component.html',
  styleUrls: ['./drawing-view.component.scss'],
})
export class DrawingViewComponent implements AfterViewInit, OnInit {
  @ViewChild('workZoneComponent', {static: false}) workZoneComponent: WorkZoneComponent;
  @ViewChild('attributesSideNav', {static: false}) attributeSideNav: MatSidenav;
  @ViewChild('toolsAttributes', {static: false}) toolsAttributes: MatCardContent;

  protected appropriateClass = '';
  protected toolAttributesComponent: ComponentPortal<any>;
  // TODO: this boolean has to be moved to a service which will keep track of the drawings of the current drawing.
  private drawingNonEmpty = true;
  private workZoneHeight: number;
  private workZoneWidth: number;
  private backGroundColor = '#FFFFFF';

  constructor(protected toolSelector: ToolSelectorService,
              private dialog: MatDialog,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {

    this.loadSVGIcons();
    this.setAppropriateIconsClass();
    this.toolAttributesComponent = new ComponentPortal(ToolsAttributesComponent);
  }

  protected get Tools() {
    return Tools;
  }

  /**
   * @desc when the window gets to small,
   * this listener prevents the bottom buttons to mix with the top buttons
   * of the tools side nav.
   */
  @HostListener('window:resize', ['$event'])
  setAppropriateIconsClass(event?: any) {
    if (window.innerHeight <= 412) {
      this.appropriateClass = 'bottomRelative';
    } else {
      this.appropriateClass = 'bottomStick';
    }
  }

  ngOnInit(): void {
    this.toolAttributesComponent = new ComponentPortal(ToolsAttributesComponent);
  }

  ngAfterViewInit() {
    this.workZoneHeight =  400; // this.workZoneComponent.nativeElement.offsetHeight;
    this.workZoneWidth = 800; // this.workZoneComponent.nativeElement.offsetWidth;
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

  /**
   * @desc: Sets the background color of the work zone
   */
  protected setBackGroundColor() {
    return {
      'background-color': this.backGroundColor,
    };
  }

  private loadSVGIcons(): void {
  this.matIconRegistry.addSvgIcon('rectangle',
    this.domSanitizer.bypassSecurityTrustResourceUrl(RECTANGLE_ICON_PATH), );
  }
}
