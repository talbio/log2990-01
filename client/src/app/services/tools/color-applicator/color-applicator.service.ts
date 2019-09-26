import { Injectable } from '@angular/core';


@Injectable()
export class ColorApplicatorService {

  constructor() { }

  changePrimaryColor(targetObject: Element, newColor: string)
  {
    switch(targetObject.nodeName)
    {
      
      case 'rect':
        //Rectangle
        targetObject.setAttribute('fill', newColor);
        break;
      case 'path':
        //Check specific type of path
        if(('' + targetObject.getAttribute('id')).startsWith('pencil'))
        {
          //Pencil
          targetObject.setAttribute('stroke', newColor);
        }
        else if(('' + targetObject.getAttribute('id')).startsWith('brush'))
        {
          //PaintBrush
          targetObject.setAttribute('stroke', newColor);
        }
        else{
          alert('Object id is \'' + targetObject.getAttribute('id') + '\' and this case is not treated!');
          console.log(targetObject.getAttribute('id'))
        }
        break;
      case 'svg':
        //Canvas
        break;
      default:
        alert('Object is of type ' + targetObject.nodeName + ' and this case is not treated!')
        break;
    }
    
  }

  changeSecondaryColor(targetObject: Element, newColor: string)
  {
    switch(targetObject.nodeName)
    {
      case 'rect':
        //Rectangle
        targetObject.setAttribute('stroke', newColor);
        break;
      case 'path':
        //Paths should only be able to change the primary color
        break;
      case 'svg':
        //Canvas
        break;
      default:
        alert('Object is of type ' + targetObject.nodeName + ' and this case is not treated!')
        break;
    }
  }

}

