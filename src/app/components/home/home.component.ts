import { Component, Input } from '@angular/core';
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
    await this.chatService.chat("Firstly, summarize what this text is about  (maximum size of the summary must not be more than a third of the number of words in the original text). Secondly, define key words. TEXT: " + this.searchResults[id].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[id].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async chat()
  {
    await this.chatService.chat(this.inputChatData).then((data) => {
      data.subscribe(result =>
        this.response = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
    
    return this.response;
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
