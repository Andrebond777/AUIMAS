export class userData{
    constructor(lang : string, engProficiency : number)
    {
        this.language = lang;
        this.englishProficiency = engProficiency;
    }
    id?: number;
    language = "";
    englishProficiency = -1;
}