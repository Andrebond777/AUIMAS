import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SearchApiService } from '../../services/search-api.service';
import { searchResToDsiplay } from '../../../models/searchResToDisplay';
import { userData } from '../../../models/userData';
import storageKeys from '../../.././data/storageKeys.json'
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

  async chosenSummaryLngChange()
  {
    if(this.chosenSummaryLng == this.inEnglish)
      await this.summarizeInEnglish();
    else
      await this.summarizeInPreferredLanguage();
  }

  async handleSelectedElement(id : number) 
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

  getElementColor(id : number)
  {
    if(id == this.selectedID)
      return {'background-color': 'rgb(230, 230, 230)'};
    else
      return {'background-color': 'white'};
  }



  constructor(private searchApiService: SearchApiService, private chatService: ChatServiceService, private dictionaryService: DictionaryService){ 
    if(typeof window !== 'undefined'){
      let preferredLanguage = localStorage.getItem(this.prefLngKey);
      let englishProficiency = localStorage.getItem(this.engProfciencyKey);
      this.enableSupport = Boolean(localStorage.getItem(this.enableSupportKey));
      if(preferredLanguage && englishProficiency)
      {
        this.userDataS = new userData(preferredLanguage, Number(englishProficiency));
      }
      else
        this.userDataS = new userData("English", 90);
    }

    if(this.userDataS.englishProficiency > 50)
      this.chosenSummaryLng = this.inEnglish;
    else
      this.chosenSummaryLng = this.inPreferred;

    this.searchStr = "LLM";
    this.search();
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
    if(this.chosenSummaryLng == this.inPreferred)
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
    await this.chatService.chat("In " + this.userDataS.language + " summarize what this text is about  (maximum size of the summary must not be more than a third of the number of words in the original text). ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async summarizeInEnglish(){
    await this.chatService.chat("Summarize what this text is about  (maximum size of the summary must not be more than a third of the number of words in the original text). ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].summarized = result
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  async findKeyWords(){
    await this.chatService.chat("Return a text with key words surrounded by <strong> opening and </strong> closing tags. ORIGINAL TEXT: "
       + this.searchResults[this.selectedID].searchRes.abstract).then((data) => {
      data.subscribe(result =>
        this.searchResults[this.selectedID].searchRes.abstract = result
        
      );
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }

  // async defineWord(wordID : number){
  //   await this.chatService.chat("Provide a definition (preferably from dictionary, with examples and synonyms) for this word in " + this.userDataS.language + ": "
  //      + this.searchResults[this.selectedID].keyWords[wordID].title).then((data) => {
  //     data.subscribe(result =>
  //       this.searchResults[this.selectedID].keyWords[wordID].definitions = result
  //     );
  //   }).catch((error) => {
  //     console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
  //   });
  // }

  async defineDictionaryWord(wordID : number){
     this.dictionaryService.getDefinition(this.searchResults[this.selectedID].keyWords[wordID].title).then((data) => {
      this.searchResults[this.selectedID].keyWords[wordID].meanings = data;
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
      
    
  }

  async search()
  {
    this.selectedID = 0;
    this.searchResults = [];
    await this.searchApiService.getSearchResults(this.searchStr).then((data) => {
      this.searchResults = data;
      if(this.selectedID == 0)
      {
        setTimeout(()=>{this.handleSelectedElement(0);}, 1000);
      }
    }).catch((error) => {
      console.error(error);  // Will print "Error: Operation failed!" if the promise is rejected
    });
  }
}
