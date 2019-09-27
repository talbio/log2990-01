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
          // targetObject.setAttribute('stroke', newColor);
          //attribute stroke for brush paths are structed as follows: url(#brushPatternX), therefore the id is in substring 5 to 18
          let pattern = document.getElementById(('' + targetObject.getAttribute("stroke")).substring(5,18));
          if (pattern != null)
          {
            for(let i = 0; i < pattern.children.length; i++)
            {
              if(pattern.children[i].hasAttribute("fill"))
              {
                pattern.children[i].setAttribute("fill",newColor);
              }
            }
          }
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
        //Paths should only be able to change the primary color, unless they are a paintbrush texture
        if(('' + targetObject.getAttribute('id')).startsWith('brush'))
        {
          let pattern = document.getElementById(('' + targetObject.getAttribute("stroke")).substring(5,18));
          if (pattern != null)
          {
            for(let i = 0; i < pattern.children.length; i++)
            {
              if(pattern.children[i].hasAttribute("stroke"))
              {
                pattern.children[i].setAttribute("stroke",newColor);
              }
            }
          }
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

}

