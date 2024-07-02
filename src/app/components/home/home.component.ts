import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SearchApiService } from '../../services/search-api.service';
import { searchResToDsiplay } from '../../../models/searchResToDisplay';
import { userData } from '../../../models/userData';
import storageKeys from '../../.././data/storageKeys.json'
import { ChatServiceService } from '../../services/chat-service.service'; 

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




  text="blabla \*bold\* blabla"

  handleSelectedElement(id : number) 
  {
    this.selectedID = id;
    this.summarize(id);
    this.defineKeyWords(id);
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

  async summarize(id : number){
    await this.chatService.chat("In " + this.userDataS.language + " summarize what this text is about  (maximum size of the summary must not be more than a third of the number of words in the original text). ORIGINAL TEXT: "
       + this.searchResults[id].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[id].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async defineKeyWords(id : number){
    await this.chatService.chat("Return a text with key words surrounded by <strong> opening and </strong> closing tags. ORIGINAL TEXT: "
       + this.searchResults[id].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[id].searchRes.abstract = result
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
