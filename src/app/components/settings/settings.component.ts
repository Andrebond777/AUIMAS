import { Component, EventEmitter, Output } from '@angular/core';
import GPTsupportedLanguages from '../../../data/GPTsupportedLanguages.json'
import storageKeys from '../../../data/storageKeys.json'
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  supportedLanguages : string[] = GPTsupportedLanguages.languages;
  prefLngKey = storageKeys.keys[0];
  engProfciencyKey = storageKeys.keys[1];
  selectedLanguage = "";
  proficiencyLvl = 0;
  isStorageEmpty = true;
  enableTranslations = false;
  enableDefinitions = true;

  constructor(private router: Router, private toast: NgToastService, private sharedService: SharedService)
  {

    if(typeof window !== 'undefined'){
      this.selectedLanguage = localStorage.getItem(this.prefLngKey) || "";
      this.proficiencyLvl = Number(localStorage.getItem(this.engProfciencyKey)) || 0;
      if(this.selectedLanguage != "")
        this.isStorageEmpty = false;
    }
  }

  save(){
    if(typeof window !== 'undefined'){
      localStorage.setItem(this.prefLngKey, this.selectedLanguage);
      localStorage.setItem(this.engProfciencyKey, this.proficiencyLvl.toString());
      this.toast.success("Your preferrences have been successfully saved.", "Saved!", 2000);
      this.router.navigate(['/home']);
      if(this.isStorageEmpty)
        this.sharedService.emitShowTopNav();
    }
  }
}
