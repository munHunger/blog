import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response } from '@angular/http';
import { PostListElement } from '../../models/postListElement.model';
import { Router } from '@angular/router';

@Component({
    selector: 'post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent {
    private list: PostListElement[];
    constructor(private http: HttpClient, private router: Router) {
        http.get("/assets/data/posts.json").subscribe(res => this.list = res as PostListElement[]);
    }

    private toJSON(elem: PostListElement): string {
        return "\n" + JSON.stringify(elem, null, 2);
    }

    private click(elem: PostListElement) {
        this.router.navigate([elem.title]);
    }
}