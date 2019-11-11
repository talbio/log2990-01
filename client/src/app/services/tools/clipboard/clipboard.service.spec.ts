// import { inject, TestBed } from '@angular/core/testing';
// import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
// import { MousePositionService } from './../../mouse-position/mouse-position.service';
// import { UndoRedoService } from './../../undo-redo/undo-redo.service';
// import { BrushGeneratorService } from './../brush-generator/brush-generator.service';
// import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
// import { EmojiGeneratorService } from './../emoji-generator/emoji-generator.service';
// import { LineGeneratorService } from './../line-generator/line-generator.service';
// import { ObjectSelectorService } from './../object-selector/object-selector.service';
// import { PencilGeneratorService } from './../pencil-generator/pencil-generator.service';
// import { PolygonGeneratorService } from './../polygon-generator/polygon-generator.service';
// import { RectangleGeneratorService } from './../rectangle-generator/rectangle-generator.service';
// import { ClipboardService } from './clipboard.service';

// const DRAWING_SERVICES = [
//   RectangleGeneratorService,
//   EllipseGeneratorService,
//   PenGeneratorService,
//   EmojiGeneratorService,
//   PencilGeneratorService,
//   BrushGeneratorService,
//   LineGeneratorService,
//   ObjectSelectorService,
//   PolygonGeneratorService,
//   MousePositionService,
// ];
// describe('Service: Clipboard', () => {
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [ClipboardService, ...DRAWING_SERVICES]
//     });
//     const mouse = new MousePositionService();
//     const command = new UndoRedoService();
//     const rectGen = new RectangleGeneratorService(mouse, command);
//     const penGen = new PenGeneratorService(mouse, command);
//     const selector = new ObjectSelectorService(mouse, rectGen);
//     const ellGen = new EllipseGeneratorService(rectGen, command, mouse);
//     const emoGen = new EmojiGeneratorService(mouse, command);
//     const pencilGen = new PencilGeneratorService(mouse, command);
//     const brushGen = new BrushGeneratorService(mouse, command);
//     const lineGen = new LineGeneratorService(mouse, command);
//     const polygonGen = new PolygonGeneratorService(rectGen, mouse, command);
//     const service = new ClipboardService(selector, ellGen, lineGen, pencilGen, penGen, polygonGen, brushGen, emoGen, rectGen);
//   });

//   const setUpTestSubject = (width: number, height: number, x: number, y: number): SVGElement => {
//     const testSubject = new SVGElement();
//     testSubject.id = 'expectedClone';
//     testSubject.setAttribute('height', height as unknown as string);
//     testSubject.setAttribute('width', width as unknown as string);
//     testSubject.setAttribute('stroke', 'transparent');
//     testSubject.setAttribute('fill', 'black');
//     testSubject.setAttribute('x', x as unknown as string);
//     testSubject.setAttribute('y', y as unknown as string);
//     return testSubject;
//   };

//   it('should receive a perfect clone (ignoring the id) of the SVG passed in parameter (clone())', () => {
//     const itemToClone = setUpTestSubject(100, 250, 100, 100);
//     const actualClone = this.clone(itemToClone);
//     itemToClone.id = 'expectedClone';

//     expect(actualClone).toEqual(itemToClone);
//   });

//   it('should slide further for each consecultive use of slide() a given element and not drive it out of the canvas', () => {
//     const itemToSlide = setUpTestSubject(100, 100, 800, 200);
//     itemToSlide.setAttribute('transform', 'translate(2 5) rotate(0 850 250');

//     this.slide(itemToSlide, 1);
//     expect(itemToSlide.getAttribute('transform')).toEqual('translate(7 10) rotate(0 850 250');

//     this.slide(itemToSlide, 3);
//     expect(itemToSlide.getAttribute('transform')).toEqual('translate(22 25) rotate(0 850 250');

//     this.slide(itemToSlide, 50);
//     const newTransform = itemToSlide.getAttribute('transform').split('(');
//     const newTranslate = newTransform[1].split(')');
//     const x = newTranslate[0].split[' '][0];
//     const y = newTranslate[0].split[' '][1];

//     let isOnCanvas = false;
//     if (x <= 100 && y <= 200) {
//       isOnCanvas = true;
//     }
//     expect(isOnCanvas).toBe(true);
//   });

//   it('should direct the direction of slide to not step out of the canvas (getSlideSide())', () => {
//     const itemToSlide = setUpTestSubject(100, 100, 800, 200);

//     const firstSlideSide = this.getSlideLength(itemToSlide, 1);

//     const secondSlideSide = this.getSlideLength(itemToSlide, 24);

//     expect(secondSlideSide[0]).toBe(true);

//     itemToSlide.setAttribute('transform', 'translate(2 5) rotate(0 850 250');
//   });


// });
