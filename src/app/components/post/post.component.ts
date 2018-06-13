import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Post } from '../../models/post.model';
import { PostPart } from '../../models/postPart.model';

@Component({
    selector: 'post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css']
})
export class PostComponent {
    private post: Post;
    private title: string = "Oleaster testing";
    private github: string = "https://github.com";
    private headerCode: string = "https://raw.githubusercontent.com/munHunger/idp/master/src/main/java/se/munhunger/idp/Startup.java";
    constructor(private http: HttpClient) {
        this.post = new Post();
        this.post.title = "Oleaster testing";
        this.post.github = "https://github.com";
        this.post.headerCode = "https://raw.githubusercontent.com/munHunger/idp/master/src/main/java/se/munhunger/idp/Startup.java";
        this.post.parts = [];
        let part = new PostPart();
        part.text = "Some fancy introduction. Lorem Ipsum dolor sit amet";
        this.post.parts.push(part);
        part = new PostPart();
        part.text = "https://raw.githubusercontent.com/munHunger/cosmos/develop/folderScraper/src/test/java/se/mulander/cosmos/folderscraper/test/ScraperTest.java";
        part.isCode = true;
        this.post.parts.push(part);
        part = new PostPart();
        part.text = "Some fancy outro";
        this.post.parts.push(part);
    }
}