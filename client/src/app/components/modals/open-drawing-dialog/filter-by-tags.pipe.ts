import { Pipe, PipeTransform } from '@angular/core';
import {Drawing} from '../../../../../../common/communication/Drawing';

@Pipe({
  name: 'filterByTags',
  pure: false,
})
export class FilterByTags implements PipeTransform {

  private getCommonTags(tags: string[], otherTags: string[]): string[] {
    return tags.filter((tag: string) => otherTags.some((otherTag: string) => otherTag === tag));
  }

  transform(drawings: Drawing[], tags: string[]): Drawing[] {
    if (!drawings || !tags || tags.length === 0) {
      return drawings;
    }
    // filter the drawings by keeping the ones who have at least one tag which match the selected tags
    return drawings.filter((drawing: Drawing) => this.getCommonTags(drawing.tags, tags).length !== 0);
  }
}
