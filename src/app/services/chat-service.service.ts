import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { environment } from '../.././environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { env } from 'process';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService implements OnInit {

  constructor(private http: HttpClient) {}



  ngOnInit(): void {}
  
  private async getResponse(inputData: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + environment.apiKey,
    });
    const body = {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": inputData}],
      "temperature": 0.7
    };
    return this.http.post('https://api.openai.com/v1/chat/completions', body, { headers });
  }

  async chat(inputData: string){
    let subject = new BehaviorSubject("");
    let parsed = "";
     (await this.getResponse(inputData)).subscribe( async result => {
      parsed = await JSON.parse(JSON.stringify(result))["choices"][0]["message"]["content"];
      subject.next(parsed);
    });
    return subject;
  } 
}
