import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';

import {NetrunnerCmp} from './netrunner_cmp';
import {CardCmp} from './card_cmp';
import {NetrunnerService} from './netrunner_service';

@NgModule({
  imports: [BrowserModule, HttpModule, FormsModule],
  declarations: [NetrunnerCmp, CardCmp],
  exports: [NetrunnerCmp, CardCmp],
  providers: [NetrunnerService]
})
export class NetrunnerModule {}
