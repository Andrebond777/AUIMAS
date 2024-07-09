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
  enableSupportKey = storageKeys.keys[2];
  selectedLanguage = "";
  selectedProficiency = "";
  enableSupport = false;
  proficiencyLevels = ["A1 (Elementary)", "A2(Pre Intermediate)", "B1(Intermediate)",
                       "B2(Upper Intermediate)", "C1(Advanced)", "C2(Proficient)"];
  proficiencyLvl = 15;
  isStorageEmpty = true;


  constructor(private router: Router, private toast: NgToastService, private sharedService: SharedService)
  {

    if(typeof window !== 'undefined'){
      this.selectedLanguage = localStorage.getItem(this.prefLngKey) || "";
      this.proficiencyLvl = Number(localStorage.getItem(this.engProfciencyKey)) || 15;
      this.enableSupport = Boolean(localStorage.getItem(this.enableSupportKey)) || false;
      this.selectedProficiency = this.proficiencyLevels[(this.proficiencyLvl / 15) - 1];
      if(this.selectedLanguage != "")
        this.isStorageEmpty = false;
    }
  }

  save(){
    if(typeof window !== 'undefined'){
      if(this.selectedLanguage.length == 0)
        this.toast.danger("Please select your preferred language.", "Error!", 2000);
      else if(this.selectedProficiency.length == 0)
        this.toast.danger("Please select your proficiency in English.", "Error!", 2000);
      else
      {
        this.proficiencyLvl = (this.proficiencyLevels.findIndex(x => x == this.selectedProficiency) + 1) * 15;
        localStorage.setItem(this.prefLngKey, this.selectedLanguage);
        localStorage.setItem(this.engProfciencyKey, this.proficiencyLvl.toString());
        this.toast.success("Your preferrences have been successfully saved.", "Saved!", 2000);
        this.router.navigate(['/home']);
        if(this.isStorageEmpty)
          this.sharedService.emitShowTopNav();
      }
    }
  }
}
