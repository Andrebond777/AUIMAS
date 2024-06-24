import { EventEmitter, Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  @Output() showTopNavEvent = new EventEmitter<void>();

  emitShowTopNav(){
    this.showTopNavEvent.emit();
  }
}
