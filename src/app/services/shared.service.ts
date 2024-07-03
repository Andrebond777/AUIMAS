import { EventEmitter, Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  @Output() showTopNavEvent = new EventEmitter<void>();
  @Output() sendKeyWords = new EventEmitter<string[]>();

  emitShowTopNav(){
    this.showTopNavEvent.emit();
  }

  emitSendKeyWords(keyWords : string[])
  {
    this.sendKeyWords.emit(keyWords);
  }
}
