import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response } from '@angular/http';
import { Post } from '../../models/post.model';
import { PostPart } from '../../models/postPart.model';
import { ActivatedRoute, Router } from "@angular/router";
import { PostListElement } from '../../models/postListElement.model';

@Component({
    selector: 'post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css']
})
export class PostComponent {
    private post: Post;
    constructor(private http: HttpClient, private activeRoute: ActivatedRoute, private router: Router) {
        activeRoute.paramMap.subscribe(map => {
            let id = map.get("post");
            http.get("/assets/data/posts.json").subscribe(res => {
                let list: PostListElement[] = res as PostListElement[];
                for(let i = 0; i < list.length; i++)
                    if(list[i].title == id)
                        this.src = list[i].url;
            });
        });
    }
    
    @Input('src')
    set src(url: string) {
        this.http
            .get(url)
            .subscribe(res => this.post = res as Post);
    }

    private home() {
        this.router.navigate([]);
    }
}