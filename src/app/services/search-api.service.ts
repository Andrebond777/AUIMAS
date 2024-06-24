import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { searchResToDsiplay } from '../../models/searchResToDisplay';
import { query } from 'express';

@Injectable({
  providedIn: 'root'
})
export class SearchApiService {

  constructor(private http: HttpClient) {}


  async getSearchResults(query : string)
  {
    let searchResults : searchResToDsiplay[] = [];
    await this.http.get(`https://api.crossref.org/works?query=${query}&filter=has-abstract:true`).subscribe(async result => 
      {
        let parsed = JSON.parse(JSON.stringify(result));
        console.log(parsed);
        let i = 0;
        let entry : any;
        while(entry = parsed["message"]["items"][i])
        {
          let toDisplay = new searchResToDsiplay;
          toDisplay.id = i;
          toDisplay.searchRes.title = entry["title"];
          toDisplay.searchRes.url = entry["URL"];
          toDisplay.searchRes.abstract = entry["abstract"];
          searchResults.push(toDisplay);
          i++;
        }
      }
    );
    return searchResults;
  }
}
