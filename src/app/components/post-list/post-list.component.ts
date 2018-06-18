import { Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    
    private email: string;
    private showSub: boolean = false;
    constructor(private http: HttpClient, private router: Router) {
        http.get("/assets/data/posts.json").subscribe(res => this.list = res as PostListElement[]);
    }

    private toJSON(elem: PostListElement): string {
        return "\n" + JSON.stringify(elem, null, 2);
    }

    private click(elem: PostListElement) {
        this.router.navigate([elem.title]);
    }
    
    private toggleSubDialog() {
        this.showSub = !this.showSub;
    }

    private subscribe() {
        let header = new HttpHeaders();
        header.append('Content-Type', 'application/x-www-form-urlencoded');
        header.append('Access-Control-Allow-Headers', '*');
        header.append('Access-Control-Allow-Origin', '*');
        this.http.post("https://ciqjklrrae.execute-api.eu-west-1.amazonaws.com/prod/subscribe", new subscriptionRequest(this.email), { headers: header }).subscribe();
        this.toggleSubDialog();
    }
}
class subscriptionRequest {
    constructor(private email:string){}
}