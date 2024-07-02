import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { noop } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'boldText'
})
export class BoldTextPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string): any {
    const regex = /\*([^,*]+)\*/gmi;
    return this.sanitize(this.replace(value, regex));
  }

  replace(str: string, regex: RegExp) {
    let matched = str.match(regex);
    matched ? matched.forEach((foundString: string) => {
      var newString = foundString.substring(1, foundString.length - 1);
      str = str.replace(foundString, `<b>${newString}</b>`);
    }) : noop;
    return str;
  }

  sanitize(str: string) {
    return this.sanitizer.sanitize(SecurityContext.HTML, str);
  }
}