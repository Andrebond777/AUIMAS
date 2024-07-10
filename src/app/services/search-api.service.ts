import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { searchResToDsiplay } from '../../models/searchResToDisplay';
import { query } from 'express';

@Injectable({
  providedIn: 'root'
})
export class SearchApiService {

  constructor(private http: HttpClient) {}


   getSearchResults(query : string) : any
  {
    return this.http.get(`https://api.crossref.org/works?query=${query}&filter=has-abstract:true`);
  }
}
