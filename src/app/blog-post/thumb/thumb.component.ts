import { Component } from '@angular/core';

@Component({
  selector: 'blog-post-thumb',
  templateUrl: './thumb.component.html',
  styleUrls: ['./thumb.component.css']
})
export class BlogPostThumbComponent {
    clicked:boolean = false;

    public click() {
        this.clicked = true;
    }
}
