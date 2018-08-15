import { Ng2HandySyntaxHighlighterModule } from 'ng2-handy-syntax-highlighter';
import { MarkdownModule } from 'ngx-markdown';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';

import { CodeComponent } from './components/code/code.component';
import { PostComponent } from './components/post/post.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { IntroComponent } from './components/intro/intro.component';

const appRoutes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'intro', component: IntroComponent },
  { path: ':post', component: PostComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    CodeComponent,
    PostComponent,
    PostListComponent,
    IntroComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    Ng2HandySyntaxHighlighterModule,
    FormsModule,
    MarkdownModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
