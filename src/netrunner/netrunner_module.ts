import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

import {NetrunnerCmp} from './netrunner_cmp';
import {SearchCmp} from './search_cmp';
import {CardCmp} from './card_cmp';
import {NetrunnerService} from './netrunner_service';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatExpansionModule,
    MatGridListModule,
    MatPaginatorModule,
  ],
  declarations: [NetrunnerCmp, CardCmp, SearchCmp],
  exports: [NetrunnerCmp, CardCmp, SearchCmp],
  providers: [NetrunnerService]
})
export class NetrunnerModule {}
