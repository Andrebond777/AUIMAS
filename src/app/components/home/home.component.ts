import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SearchApiService } from '../../services/search-api.service';
import { searchResToDsiplay } from '../../../models/searchResToDisplay';
import { userData } from '../../../models/userData';
import storageKeys from '../../.././data/storageKeys.json'
import chatGPTQueries from '../../.././data/GPTqueries.json'
import { ChatServiceService } from '../../services/chat-service.service'; 
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';
import { keyWord } from '../../../models/keyWord';
import { DictionaryService } from '../../services/dictionary.service';
import { wordMeaning } from '../../../models/wordMeaning';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  prefLngKey = storageKeys.keys[0];
  engProfciencyKey = storageKeys.keys[1];
  enableSupportKey = storageKeys.keys[2];
  title = 'AUIMAS';
  @Input()
  searchStr : string = "";
  
  searchResults : searchResToDsiplay[] = [];
  summarized: string[] = [];

  userDataS : userData = new userData("", 0);

  selectedID = 0;

  inEnglish = "inEnglish";
  inPreferred = "inPreferred";

  chosenSummaryLng = this.inPreferred;

  enableSupport = false;

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }

  async translateSearchQuery()
  {
    await this.chatService.chat("Translate this text into English: " + this.searchStr).then((data) => {
     data.subscribe(result =>
      this.searchStr = result
     );
   }).catch((error) => {
     console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
   });
  }

  async chosenSummaryLngChange()
  {
    if(this.chosenSummaryLng == this.inEnglish)
      await this.summarizeInEnglish();
    else
      await this.summarizeInPreferredLanguage();
  }

  async handleSelectedElement(id : number) 
  {
    if(this.enableSupport)
    {
      //do not handle request if there is already another processing
      if(this.searchResults[this.selectedID].searchRes.abstract.length != 0)
        {
          this.selectedID = id;
          if(this.searchResults[this.selectedID].summarized.length == 0)
          {
            if(this.chosenSummaryLng == this.inEnglish)
              await this.summarizeInEnglish();
            else
              await this.summarizeInPreferredLanguage();
            await this.findKeyWords();
          }
        }
    }
  }

  getElementColor(id : number)
  {
    if(id == this.selectedID)
      return {'background-color': 'rgb(230, 230, 230)'};
    else
      return {'background-color': 'white'};
  }

  restyleSearchResults()
  {
    if(!this.enableSupport)
      return {'width': '100vw'};
    else
    return {'width': '50%'};
  }

  constructor(private searchApiService: SearchApiService, private chatService: ChatServiceService, private dictionaryService: DictionaryService){ 
    if(typeof window !== 'undefined'){
      let preferredLanguage = localStorage.getItem(this.prefLngKey);
      let englishProficiency = localStorage.getItem(this.engProfciencyKey);
      this.enableSupport = JSON.parse(localStorage.getItem(this.enableSupportKey)!);
      if(preferredLanguage && englishProficiency)
      {
        this.userDataS = new userData(preferredLanguage, Number(englishProficiency));
      }
      else
        this.userDataS = new userData("English", 90);
    }

    if(this.userDataS.englishProficiency >= 45)
      this.chosenSummaryLng = this.inEnglish;
    else
      this.chosenSummaryLng = this.inPreferred;
  }



  getKeyWordsFromText() : keyWord[]
  {
    if(this.searchResults[this.selectedID].keyWords.length > 0)
      return this.searchResults[this.selectedID].keyWords;
    let matches = this.searchResults[this.selectedID].searchRes.abstract.match(/\<strong>(.*?)\<\/strong>/gsm);
    let result : keyWord[] = [];
    if(matches)
    {
      for(let i = 0; i < matches!.length; i++)
        {
          let newKeyWord = new keyWord(matches![i].substring(matches![i].indexOf('<strong>') + 8, matches![i].indexOf('</strong>')).toUpperCase());
          if(result.findIndex(x => x.title == newKeyWord.title) == -1)
            result.push(newKeyWord);
        }
    }
    this.searchResults[this.selectedID].keyWords = result!;
    return result!;
  }

  async getWordTranslationAndDefinition(wordID : number)
  {
    if(this.chosenSummaryLng == this.inPreferred || this.userDataS.englishProficiency <= 30)
      this.translateWord(wordID);
    this.defineDictionaryWord(wordID);
  }

  async translateWord(wordID : number){
    await this.chatService.chat("Provide all possible translation of the text in " + this.userDataS.language + " language. ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].keyWords[wordID].title).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].keyWords[wordID].translations = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async summarizeInPreferredLanguage(){
    await this.chatService.chat("Briefly summarize what this text is about for a " + chatGPTQueries.proficiencyLevelQueries[0] + " In " + this.userDataS.language + " language. ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async summarizeInEnglish(){
    //higher proficiency English summary assigned to C1, C2
    let proficiencyLvlOutOfTwo = 1;
    //lower proficiency English summary assigned to A1, A2, B1, B2
    if(this.userDataS.englishProficiency <= 60)
      proficiencyLvlOutOfTwo = 0;
    let sumToProficiencyLevelQuery = chatGPTQueries.proficiencyLevelQueries[proficiencyLvlOutOfTwo];
    await this.chatService.chat("Briefly summarize what this text is about for a " + sumToProficiencyLevelQuery + " TEXT TO SUMMARISE: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async findKeyWords(){
    await this.chatService.chat("Return a text with key words surrounded by <strong> opening and </strong> closing tags. Do not highlight more than 10 key words. ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].searchRes.abstract = result
        
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async defineWordChatGPT(wordID : number){
    let query = "Provide a definition (preferably from dictionary, with examples and synonyms) for this word: ";
    if(this.chosenSummaryLng == this.inPreferred || this.userDataS.englishProficiency <= 30)
      query = "Provide a definition in " + this.userDataS.language + " language (preferably from dictionary, with examples and synonyms) for this word: ";
    await this.chatService.chat(query + this.searchResults[this.selectedID].keyWords[wordID].title).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].keyWords[wordID].gptMeaning = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async defineDictionaryWord(wordID : number){
     this.dictionaryService.getDefinition(this.searchResults[this.selectedID].keyWords[wordID].title).then((data) => {
      this.searchResults[this.selectedID].keyWords[wordID].meanings = data;
      setTimeout(()=>{
        if(this.searchResults[this.selectedID].keyWords[wordID].meanings.length == 0)
          this.defineWordChatGPT(wordID);
      }, 1000);
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

   search()
  {
    this.selectedID = 0;
    this.searchResults = [];
    this.searchApiService.getSearchResults(this.searchStr).subscribe( (result: any) => 
    {
      let parsed = JSON.parse(JSON.stringify(result));
      let i = 0;
      let entry : any;
      while(entry = parsed["message"]["items"][i])
      {
        let toDisplay = new searchResToDsiplay;
        toDisplay.id = i;
        toDisplay.searchRes.title = entry["title"];
        toDisplay.searchRes.url = entry["URL"];
        toDisplay.searchRes.abstract = entry["abstract"];
        this.searchResults.push(toDisplay);
        i++;
      }
      this.handleSelectedElement(0);
    }
    );
  }
}
