import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { noop } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from '../services/shared.service';

@Pipe({
  name: 'boldText'
})
export class BoldTextPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer, private sharedService: SharedService) { }

  transform(value: string): any {
    const regex = /\<strong>([^,*]+)\<\/strong>/gmi;
    return this.sanitize(this.replace(value, regex));
  }

  replace(str: string, regex: RegExp) {

    let keyWords : string[] = [];

    let matched = str.match(regex);
    matched ? matched.forEach((foundString: string) => {

      var newString = foundString.substring(foundString.indexOf('<strong>') + 8, foundString.indexOf('</strong>'));
      console.log(newString);
      keyWords.push(newString);
    }) : noop;

    this.sharedService.emitSendKeyWords(keyWords);
    return str;
  }

  sanitize(str: string) {
    return this.sanitizer.sanitize(SecurityContext.HTML, str);
  }
}