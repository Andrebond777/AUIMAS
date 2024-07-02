import { Component, OnDestroy, OnInit } from '@angular/core';
import storageKeys from '.././data/storageKeys.json'
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { SharedService } from './services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  prefLngKey = storageKeys.keys[0];
  engProfciencyKey = storageKeys.keys[1];
  title = 'AUIMAS';

  isShowTopNav = false;

  showTopNav(isShow : boolean)
  {
   this.isShowTopNav = isShow; 
  }

  constructor(private router: Router, private toast: NgToastService, private sharedService: SharedService){ 
    //waiting for window to load

    if(typeof window !== 'undefined'){
      //checking whether proficiency and preferred language are selected
      let preferredLanguage = localStorage.getItem(this.prefLngKey);
      let englishProficiency = localStorage.getItem(this.engProfciencyKey);
      console.log(preferredLanguage);
      console.log(englishProficiency);
      if(preferredLanguage && englishProficiency)
        this.isShowTopNav = true;
      else
        this.router.navigate(['/settings']);
    }
  }
  ngOnDestroy(): void {
    this.showTopNavSubscription?.unsubscribe();
  }

  showTopNavSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.showTopNavSubscription = this.sharedService.showTopNavEvent.subscribe(() => this.isShowTopNav = true);
  }
}
