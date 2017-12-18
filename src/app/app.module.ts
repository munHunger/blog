import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app/app.component';

import { BlogPostThumbComponent } from './blog-post/thumb/thumb.component';
import { BlogPostDetailComponent } from './blog-post/detail/detail.component';

@NgModule({
  declarations: [
    AppComponent,
    BlogPostThumbComponent,
    BlogPostDetailComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
