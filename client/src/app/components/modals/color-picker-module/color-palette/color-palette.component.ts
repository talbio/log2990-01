import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Colors} from 'src/app/data-structures/colors';
@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
})

export class ColorPaletteComponent implements AfterViewInit, OnChanges {

  @Input()
  hue: string;
  @Output()
  colorSelected: EventEmitter<string> = new EventEmitter(true);
  @ViewChild('colorPaletteCanvas', {static: false})
  canvas: ElementRef<HTMLCanvasElement>;

  protected readonly RED = 'R:';
  protected readonly GREEN = 'G:';
  protected readonly BLUE = 'B:';
  protected readonly OK: string = 'Ok';
  private readonly HEX_VALUES_REGEX = '^([A-Fa-f0-9]{2}|[A-Fa-f0-9]{1})$';

  protected rgbComponentsForm: FormGroup;

  private mousedown: boolean;
  private selectedPosition: { x: number; y: number };
  private ctx: CanvasRenderingContext2D;

  constructor(private formBuilder: FormBuilder) {
    this.mousedown = false;
    this.rgbComponentsForm = this.formBuilder.group({
      red: [0, [
        Validators.required,
        Validators.pattern(this.HEX_VALUES_REGEX),
      ]],
      green: [0, [
        Validators.required,
        Validators.pattern(this.HEX_VALUES_REGEX),
      ]],
      blue: [0, [
        Validators.required,
        Validators.pattern(this.HEX_VALUES_REGEX),
      ]],
    });
  }

  ngAfterViewInit() {
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hue && (changes.hue.currentValue !== changes.hue.previousValue)) {
      this.draw();
      const pos = this.selectedPosition;
      if (pos) {
        this.colorSelected.emit(this.getColorAtPosition(pos.x, pos.y));
      }
    }
  }

  get red(): string {
    // we are sure that this is non null, (see rgbComponentsForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.rgbComponentsForm.get('red')!.value;
  }

  set red(rgbComponent: string) {
    this.rgbComponentsForm.patchValue({red: rgbComponent});
  }

  get green(): string {
    // we are sure that this is non null, (see rgbComponentsForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.rgbComponentsForm.get('green')!.value;
  }

  set green(rgbComponent: string) {
    this.rgbComponentsForm.patchValue({green: rgbComponent});
  }

  get blue(): string {
    // we are sure that this is non null, (see rgbComponentsForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.rgbComponentsForm.get('blue')!.value;
  }

  set blue(rgbComponent: string) {
    this.rgbComponentsForm.patchValue({blue: rgbComponent});
  }

  enterColorManually(): void {
    if (this.rgbComponentsForm.valid) {
      this.colorSelected.emit(this.convertFormValuesToRgbaString());
    }
  }

  draw() {
    if (!this.ctx) {
      this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;

    this.ctx.fillStyle = this.hue || Colors.WHITE;
    this.ctx.fillRect(0, 0, width, height);

    const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, Colors.WHITE);
    whiteGrad.addColorStop(1, Colors.TRANSPARENT_WHITE);

    this.ctx.fillStyle = whiteGrad;
    this.ctx.fillRect(0, 0, width, height);

    const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, Colors.TRANSPARENT_BLACK);
    blackGrad.addColorStop(1, Colors.BLACK);

    this.ctx.fillStyle = blackGrad;
    this.ctx.fillRect(0, 0, width, height);

    if (this.selectedPosition) {
      this.ctx.strokeStyle = Colors.WHITE;
      this.ctx.fillStyle = Colors.WHITE;
      this.ctx.beginPath();
      this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, 10, 0, 2 * Math.PI);
      this.ctx.lineWidth = 5;
      this.ctx.stroke();
    }

  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp() {
    this.mousedown = false;
  }

  onMouseDown(evt: MouseEvent) {
    this.mousedown = true;
    this.selectedPosition = {x: evt.offsetX, y: evt.offsetY};
    this.draw();
    this.colorSelected.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY));
  }

  onMouseMove(evt: MouseEvent) {
    if (this.mousedown) {
      this.selectedPosition = {x: evt.offsetX, y: evt.offsetY};
      this.draw();
      this.emitColor(evt.offsetX, evt.offsetY);
    }
  }

  getColorAtPosition(x: number, y: number) {
    const imageData = this.ctx.getImageData(x, y, 1, 1).data;
    return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
  }

  emitColor(x: number, y: number) {
    const color = this.getColorAtPosition(x, y);
    this.colorSelected.emit(color);
  }

  private convertFormValuesToRgbaString(): string {
    return 'rgba(' + parseInt(this.red, 16) + ',' +
                     parseInt(this.green, 16) + ',' +
                     parseInt(this.blue, 16) + ',1)';
  }
}
