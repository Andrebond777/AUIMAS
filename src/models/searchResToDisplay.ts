import { keyWord } from './keyWord';
import { searchRes } from './searchRes';

export class searchResToDsiplay{
    id?: number;
    searchRes: searchRes = new searchRes();
    summarized = "";
    abstractShortenedWithKeyWords = "";
    keyWords : keyWord[] = [];
}