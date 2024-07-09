import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { wordMeaning } from '../../models/wordMeaning';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {

  constructor(private http: HttpClient) { }

   async getDefinition(query : string)
  {
    let definitions : wordMeaning[] = [];
    await this.http.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`).subscribe(async result => 
      {
        let parsed = JSON.parse(JSON.stringify(result));
        console.log(result);
        let i = 0;
        let entry : any;
        while(entry = parsed[0]["meanings"][i])
        {
          console.log(entry);
          let meaning = new wordMeaning;
          meaning.id = i;
          meaning.partOfSpeech= entry["partOfSpeech"];
          let j = 0;
          let subEntry : any;
          while(subEntry = entry["definitions"][j])
          {
            meaning.definitions.push(subEntry["definition"]);
            j++;
            if(j > 2)
              break;
          }
          j = 0;
          while(subEntry = entry["synonyms"][j])
          {
            meaning.synonyms.push(subEntry);
            j++;
            if(j > 5)
              break;
          }

          definitions.push(meaning);
          i++;
        }
      }
    );
    return definitions;
  }
}
