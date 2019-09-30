import {
    AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';
import { ColorService } from 'src/app/services/tools/color/color.service';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})

export class ColorPaletteComponent implements AfterViewInit, OnChanges {
private red: number;
private green: number;
private blue: number;

    @Input()
    hue: string;

    @Output()
    colorSelected: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas', { static: false })
    canvas: ElementRef<HTMLCanvasElement>;

    selectedPosition: { x: number; y: number };

    private ctx: CanvasRenderingContext2D;

    private mousedown = false;

    constructor(protected colorService: ColorService) {}

    protected readonly RED = 'R:';
    protected readonly GREEN = 'G:';
    protected readonly BLUE = 'B:';
    protected readonly ok: string = 'Ok';
    set _red(red: number) {
        if (0 <= red && red <= 255) {
          this.red = red;
        }
      }

    get _red(): number {
        return this.red;
      }

    set _green(green: number) {
        if (0 <= green && green <= 255) {
          this.green = green;
        }
      }

    get _green(): number {
        return this.green;
      }

    set _blue(blue: number) {
        if (0 <= blue && blue <= 255) {
          this.blue = blue;
        }
      }

    get _blue(): number {
        return this.blue;
      }

    ngAfterViewInit() {
        this.draw();
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

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.hue]) {
            this.draw();
            const pos = this.selectedPosition;
            if (pos) {
                this.colorSelected.emit(this.getColorAtPosition(pos.x, pos.y));
            }
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp() {
        this.mousedown = false;
    }

    onMouseDown(evt: MouseEvent) {
        this.mousedown = true;
        this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
        this.draw();
        this.colorSelected.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY));

    }

    onMouseMove(evt: MouseEvent) {
        if (this.mousedown) {
            this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
            this.draw();
            this.emitColor(evt.offsetX, evt.offsetY);
        }
    }
    enterColorManually(): void {
        const color = 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',1)';
        this.selectColor(color);
    }

    getColorAtPosition(x: number, y: number) {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
    }

    emitColor(x: number, y: number) {
        const color = this.getColorAtPosition(x, y);
        this.colorSelected.emit(color);
    }

    selectColor(color: string): void {
        this.colorSelected.emit(color);
      }
}
