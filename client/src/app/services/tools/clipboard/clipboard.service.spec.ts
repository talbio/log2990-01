import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { PolygonGeneratorService } from './../polygon-generator/polygon-generator.service';
import { BrushGeneratorService } from './../brush-generator/brush-generator.service';
import { PencilGeneratorService } from './../pencil-generator/pencil-generator.service';
import { EmojiGeneratorService } from './../emoji-generator/emoji-generator.service';
import { LineGeneratorService } from './../line-generator/line-generator.service';
import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
import { ObjectSelectorService } from './../object-selector/object-selector.service';
import { RectangleGeneratorService } from './../rectangle-generator/rectangle-generator.service';
import { TestBed, inject } from '@angular/core/testing';
import { ClipboardService } from './clipboard.service';

const DRAWING_SERVICES = [
  RectangleGeneratorService,
  EllipseGeneratorService,
  EmojiGeneratorService,
  PencilGeneratorService,
  BrushGeneratorService,
  LineGeneratorService,
  ObjectSelectorService,
  PolygonGeneratorService,
  MousePositionService,
];
describe('Service: Clipboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClipboardService, ...DRAWING_SERVICES]
    });
    const mouse = new MousePositionService();
    const selector = new ObjectSelectorService(mouse);
    const rectGen = new RectangleGeneratorService(mouse);
    const ellGen = new EllipseGeneratorService(rectGen, mouse);
    const emoGen = new EmojiGeneratorService(mouse);
    const pencilGen = new PencilGeneratorService(mouse);
    const brushGen = new BrushGeneratorService(mouse);
    const lineGen = new LineGeneratorService(mouse);
    const polygonGen = new PolygonGeneratorService(rectGen, mouse);
    const service = new ClipboardService(selector, rectGen, ellGen, emoGen, pencilGen, brushGen, lineGen, polygonGen);
  });

  const setUpService = (selector: ObjectSelectorService,
                        rectGen: RectangleGeneratorService,
                        ellGen: EllipseGeneratorService,
                        emojiGen: EmojiGeneratorService,
                        pencilGen: PencilGeneratorService,
                        brushGen: BrushGeneratorService,
                        lineGen: LineGeneratorService,
                        polygonGen: PolygonGeneratorService) => {
    return new ClipboardService(selector, rectGen, ellGen, emojiGen, pencilGen, brushGen, lineGen, polygonGen);

    let widestLeftPoint = points[0];
    let widestRightPoint = points[0];
    let highestPoint = points[0];
    let lowestPoint = points[0];

    for (let i = 1 ; i < points.length ; i++) {
      if (parseFloat(points[i][0]) < parseFloat(widestLeftPoint[0])) { widestLeftPoint = points[i]; }
      if (parseFloat(points[i][0]) > parseFloat(widestLeftPoint[0])) { widestRightPoint = points[i]; }
      if (parseFloat(points[i][1]) > parseFloat(widestLeftPoint[1])) { lowestPoint = points[i]; }
      if (parseFloat(points[i][1]) < parseFloat(widestLeftPoint[1])) { highestPoint = points[i]; }
    }

    let outside = false;
    if (parseFloat(widestLeftPoint[0]) < x) { outside = true; }
    if (parseFloat(widestRightPoint[0]) > x + w) { outside = true; }
    if (parseFloat(highestPoint[1]) < y) { outside = true; }
    if (parseFloat(lowestPoint[1]) > y + h) { outside = true; }

    expect(outside).toBeFalsy();
  };

  it('should receive a perfect clone (ignoring the id) of the SVG passed in parameter', () => {


  }));
});
