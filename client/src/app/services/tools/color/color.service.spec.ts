import { inject, TestBed } from '@angular/core/testing';
import { Colors } from 'src/app/data-structures/colors';
import { ColorService } from './color.service';

describe('Service: ColorApplicator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorService],
    });
  });

  it('#addToTopTenColors should remove the first color and add the new one', inject([ColorService], (service: ColorService) => {
    service.topTenColors = [Colors.BLUE, Colors.RED, Colors.GREEN, Colors.YELLOW,
    Colors.PINK, Colors.BLACK, Colors.GREY, Colors.BROWN, Colors.ORANGE, Colors.PURPLE];
    service.color = Colors.PINK;
    service.addToTopTenColors(service.color);
    expect(service.topTenColors[0]).toBe(Colors.PINK);
    expect(service.topTenColors[9]).toBe(Colors.BLUE);
  }));

  it('#switchMainColors should switch the primary and secondary colors', inject([ColorService], (service: ColorService) => {
    service.primaryColor = Colors.RED;
    service.secondaryColor = Colors.GREEN;
    service.switchMainColors();
    expect(service.primaryColor).toBe(Colors.GREEN);
    expect(service.secondaryColor).toBe(Colors.RED);

  }));
});
