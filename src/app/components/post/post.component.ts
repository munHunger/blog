import { Component, Input } from '@angular/core';
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
    constructor(private http: HttpClient) {
    }
    
    @Input('src')
    set src(url: string) {
        this.http
            .get(url)
            .subscribe(res => this.post = res as Post);
    }
}