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
    
    constructor(private http: HttpClient) {
    }

    private characterRegex = /(\".*\")|([;() -+<>={}\/\*\.]?)(.*?)([;() -+<>={}\/\*\n\t]+)/g
    private keywordRegex = /import|package|public|private|protected|class|int|long|double|boolean|new|throws|static|return/
    private commentRegex = /\/\/.*|\/\*\*|^\s*\*.*/
    private litteralRegex = /\".*\"/
    private objectRegex = /[A-Z][a-z0-9]*/
    private code: string;
    
    public codeSplit(): WordInfo[]{
        let result = [];
        if(!this.code)
            return [];
        let lines = this.code.split("\n");
        for(var i = 0; i < lines.length; i++) {
            let line = lines[i] + "\n";
            
            if(this.commentRegex.exec(line) != null) {
                let word = new WordInfo();
                word.comment = true;
                word.word = line;
                result.push(word);
                word = new WordInfo();
                word.word = "\n";
                result.push(word);
                continue;
            }
            let match;
            while(match = this.characterRegex.exec(line)) {
                let word = new WordInfo();
                word.word = match[3];
                let keyword = this.keywordRegex.exec(match[3]);
                if(match[1] != null)
                    word.literal = true;
                else if(result.length > 1 && result[result.length-1].word === "\"")
                    word.literal = true;
                else if(this.objectRegex.exec(match[3]) != null)
                    word.object = true;
                else if(keyword != null && keyword[0] === match[3])
                    word.keyword = true;
                else if(result.length > 1) {
                    if(result[result.length-1].word === ".")
                        word.copyClass(result[result.length-2]);
                }
                result.push(word);
                
                for (var n = 0; n < match[4].length; n++) {
                    word = new WordInfo();
                    word.word = match[4].charAt(n);
                    result.push(word);
                }
            }
        }
        let word = new WordInfo();
        word.word = this.code;
        result.push(word);
        return result;
    }
}
class WordInfo{
    public word: string;
    public keyword: boolean;
    public literal: boolean;
    public object: boolean;
    public function: boolean;
    public comment: boolean;

    public copyClass(word: WordInfo) {
        this.keyword = word.keyword;
        this.literal = word.literal;
        this.object = word.object;
        this.function = word.function;
        this.comment = word.comment;
    }
}
