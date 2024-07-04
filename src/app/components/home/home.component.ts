import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SearchApiService } from '../../services/search-api.service';
import { searchResToDsiplay } from '../../../models/searchResToDisplay';
import { userData } from '../../../models/userData';
import storageKeys from '../../.././data/storageKeys.json'
import { ChatServiceService } from '../../services/chat-service.service'; 
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  prefLngKey = storageKeys.keys[0];
  engProfciencyKey = storageKeys.keys[1];
  title = 'AUIMAS';
  document = "";
  @Input()
  searchStr : string = "";
  @Input()
  inputChatData : string = "";

  response : string = "";
  
  searchResults : searchResToDsiplay[] = [];
  summarized: string[] = [];

  userDataS! : userData;

  selectedID = 0;

  async handleSelectedElement(id : number) 
  {
    //do not handle request if there is already another processing
    if(this.searchResults[this.selectedID].searchRes.abstract.length != 0)
    {
      this.selectedID = id;
      if(this.searchResults[this.selectedID].summarized.length == 0)
      {
        await this.summarize();
        await this.defineKeyWords();
      }
    }
  }

  getElementColor(id : number)
  {
    if(id == this.selectedID)
      return {'background-color': 'whitesmoke'};
    else
      return {'background-color': 'white'};
  }



  constructor(private searchApiService: SearchApiService, private chatService: ChatServiceService){ 
    if(typeof window !== 'undefined'){
      let preferredLanguage = localStorage.getItem(this.prefLngKey);
      let englishProficiency = localStorage.getItem(this.engProfciencyKey);
      if(preferredLanguage && englishProficiency)
      {
        this.userDataS = new userData(preferredLanguage, Number(englishProficiency));
      }
    }

  }


  getKeyWordsFromText() : string[]
  {
    if(this.searchResults[this.selectedID].keyWords.length > 0)
      return this.searchResults[this.selectedID].keyWords;
    let matches = this.searchResults[this.selectedID].searchRes.abstract.match(/\<strong>(.*?)\<\/strong>/gsm);
    let result : string[] = [];
    if(matches)
    {
      for(let i = 0; i < matches!.length; i++)
        {
          let newString = matches![i].substring(matches![i].indexOf('<strong>') + 8, matches![i].indexOf('</strong>')).toUpperCase();
          if(!result.includes(newString))
            result.push(newString);
        }
    }
    this.searchResults[this.selectedID].keyWords = result!;
    return result!;
  }

  async summarize(){
    await this.chatService.chat("In " + this.userDataS.language + " summarize what this text is about  (maximum size of the summary must not be more than a third of the number of words in the original text). ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async defineKeyWords(){
    await this.chatService.chat("Return a text with key words surrounded by <strong> opening and </strong> closing tags. ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].searchRes.abstract = result
        
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async search()
  {
    await this.searchApiService.getSearchResults(this.searchStr).then((data) => {
      this.searchResults = data;
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }
}
