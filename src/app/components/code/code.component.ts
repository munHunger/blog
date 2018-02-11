import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Component({
    selector: 'code-block',
    templateUrl: './code.component.html',
    styleUrls: ['./code.component.css']
})
export class CodeComponent {
    @Input('inline') isInline: boolean = true;
    private codeSrc: string;

    @Input('src')
    set src(url: string) {
        this.codeSrc = url;
        this.http
            .get(this.codeSrc, {responseType: 'text'})
            .pipe()
            .subscribe(res => this.code = res);
    }

    private specialRegex = /(\n|\t)|(".*"|true|false|([0-9]+(\.[0-9]*)?(d|l|f)?))|([^a-zA-Z0-9_@]+?)|(package|import|if|else|for|while|switch|return|break|do|throws|throw|implements|extends|public|private|protected|class|new|extends|throws|void|boolean|int|float|long|double)|((?<= |\n|\()@?[A-Z][a-zA-Z]*)|((?<= |\n|\()[a-z][a-zA-Z]*\()|(.+?)/g;
    
    constructor(private http: HttpClient) {
    }

    private code: string;
    
    public codeSplit(): WordInfo[]{
        let result = [];
        let match;
        while(match = this.specialRegex.exec(this.code)){
            let word = new WordInfo();
            word.word = match[0];
            if(match[2])
                word.literal = true;
            if(match[7])
                word.keyword = true;
            if(match[8])
                word.object = true;
            if(match[9])
                word.function = true;
            result.push(word);
        }
        return result;
    }
}
class WordInfo{
    public word: string;
    public keyword: boolean;
    public literal: boolean;
    public object: boolean;
    public function: boolean;
}
