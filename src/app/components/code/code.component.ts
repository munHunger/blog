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

    private code: string = "";

    public getCode(): string {
        return this.code;
    }
}
