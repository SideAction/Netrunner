import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutes} from './app_routes';
import {NetrunnerModule} from './../netrunner/netrunner_module';

import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';

// If porting to phantomjs it doesn't play nice with BrowserAnimationsModule
//import {environment} from './../environments/environment';
//let AnimationsModule = environment['test'] ? NoopAnimationsModule : BrowserAnimationsModule;

import { AppComponent } from './app.component';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutes,
    HttpClientModule,
    NetrunnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
