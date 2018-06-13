import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Component({
    selector: 'post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css']
})
export class PostComponent {
    private title: string = "Oleaster testing";
    private github: string = "https://github.com";
    private headerCode: string = "https://raw.githubusercontent.com/munHunger/idp/master/src/main/java/se/munhunger/idp/Startup.java";
    constructor(private http: HttpClient) {
    }
}