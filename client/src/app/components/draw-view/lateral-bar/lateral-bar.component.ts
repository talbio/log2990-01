import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from '@angular/platform-browser';
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
export class LateralBarComponent implements OnInit, AfterViewInit {
  @ViewChild('workZoneComponent', {static: false}) workZoneComponent: WorkZoneComponent;

  appropriateClass = '';
  private backGroundColor = '#FFFFFF';

  // TODO: this boolean has to be moved to a service which will keep track of the drawings of the current drawing.
  // set to true for testing purposes
  private drawingNonEmpty = true;
  private workZoneHeight: number;
  private workZoneWidth: number;

  constructor(private dialog: MatDialog,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'rectangle',
      this.domSanitizer.bypassSecurityTrustResourceUrl(RECTANGLE_ICON_PATH),
    );

    this.getScreenHeight();
  }

  @HostListener('window:resize', ['$event'])
  getScreenHeight(event?: any) {

    if (window.innerHeight <= 412) {
      this.appropriateClass = 'bottomRelative';
    } else {
      this.appropriateClass = 'bottomStick';
    }
  }

  // tslint:disable-next-line:no-empty
  ngOnInit() {}

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

  protected setBackGroundColor() {
    return {
      'background-color': this.backGroundColor,
    };
  }
}
