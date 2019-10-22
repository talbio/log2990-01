import {Drawing} from '../../../../../../common/communication/Drawing';
import { FilterByTags } from './filter-by-tags.pipe';

const pipe = new FilterByTags();
const tags = ['tag1', 'tag2'];
const drawing1: Drawing = {id: -1, name: 'drawing1', miniature: '', svgElements: '', tags: ['tag1']};
const drawing2: Drawing = {id: -1, name: 'drawing1', miniature: '', svgElements: '', tags: ['tag2']};
const drawing3: Drawing = {id: -1, name: 'drawing1', miniature: '', svgElements: '', tags: ['otherTag']};
const drawing4: Drawing = {id: -1, name: 'drawing1', miniature: '', svgElements: '', tags: ['tag1', 'tag2']};

fdescribe('FilterByTags', () => {
  it('create an instance', () => {

    expect(pipe).toBeTruthy();
  });

  it('should filter the drawings list with a given list of tags using OR logic', () => {
    const drawings: Drawing[] = [drawing1, drawing2, drawing3, drawing4];
    expect(pipe.transform(drawings, tags)).toContain(drawing1);
    expect(pipe.transform(drawings, tags)).toContain(drawing2);
    expect(pipe.transform(drawings, tags)).toContain(drawing4);
    expect(pipe.transform(drawings, tags).length).toBe(3);
  });

  it('should return a list of 0 elements if the tags did not match any drawing tags', () => {
    const drawings: Drawing[] = [drawing3];
    expect(pipe.transform(drawings, tags).length).toBe(0);
  });

  it('should return the original list if there is no tags to compare with', () => {
    const drawings: Drawing[] = [drawing1, drawing2, drawing3, drawing4];
    expect(pipe.transform(drawings, []).length).toBe(4);
  });
});
