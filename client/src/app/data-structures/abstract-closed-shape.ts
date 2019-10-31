import {PlotType} from './plot-type';

export class AbstractClosedShape {

  protected plotType: PlotType;

  getStrokeAndFillProperties(primaryColor: string, secondaryColor: string): {stroke: string, fill: string} {
    let stroke = '';
    let fill = '';
    switch (this.plotType) {
      case PlotType.Contour:
        stroke = secondaryColor;
        fill = 'transparent';
        break;
      case PlotType.Full:
        stroke = 'transparent';
        fill = primaryColor;
        break;
      case PlotType.FullWithContour:
        stroke = secondaryColor;
        fill = primaryColor;
        break;
    }
    return {stroke, fill};
  }
}
