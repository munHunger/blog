import { Ng2HandySyntaxHighlighterModule } from 'ng2-handy-syntax-highlighter';
import { MarkdownModule } from 'ngx-markdown';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';

import { CodeComponent } from './components/code/code.component';
import { PostComponent } from './components/post/post.component';
import { PostListComponent } from './components/post-list/post-list.component';

const appRoutes: Routes = [
  { path: '', component: PostListComponent },
  { path: ':post', component: PostComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    CodeComponent,
    PostComponent,
    PostListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    Ng2HandySyntaxHighlighterModule,
    MarkdownModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
