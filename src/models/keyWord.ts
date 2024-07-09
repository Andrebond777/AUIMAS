import { wordMeaning } from "./wordMeaning";

export class keyWord{
    constructor(title : string)
    {
        this.title = title;
    }
    id?: number;
    title = "";
    meanings! : wordMeaning[];
    gptMeaning : string = "";
    translations: string = "";
}