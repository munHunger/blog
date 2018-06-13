import { Ng2HandySyntaxHighlighterModule } from 'ng2-handy-syntax-highlighter';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';

import { CodeComponent } from './components/code/code.component';
import { PostComponent } from './components/post/post.component';

@NgModule({
  declarations: [
    AppComponent,
    CodeComponent,
    PostComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    Ng2HandySyntaxHighlighterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
