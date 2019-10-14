import { Injectable } from '@angular/core';

@Injectable()
export class EmojiGeneratorService {
    private emoji: string;
protected emojis: string[] = [
    '../../../../assets/svg-icons/happy.svg',
    '../../../../assets/svg-icons/pawprint.svg',
    '../../../../assets/svg-icons/leaf.svg',
    '../../../../assets/svg-icons/turkey.svg',
    '../../../../assets/svg-icons/pumpkin.svg'];
private OFFSET_CANVAS_X: number;
private width = 20;
private height = 20;

get _emoji() {
    return this.emoji;
  }

  set _emoji(emoji: string) {
    this.emoji = emoji;
  }
constructor() {
    this.emoji = '../../../../assets/svg-icons/happy.svg';
  }

addEmoji(mouseEvent: MouseEvent, canvas: HTMLElement) {

     this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

     canvas.innerHTML +=
        `<image x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X - this.width / 2)}" y="${(mouseEvent.pageY) - this.height/2}"
        xlink:href="${this.emoji}"' width="${this.width}" width="${this.height}" />
        `;
  }
}
