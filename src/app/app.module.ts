import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { IqsClientService } from './iqs-client.service';

import { CookieService } from 'ngx-cookie-service';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    // BsDropdownModule.forRoot()
  ],
  providers: [
    IqsClientService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
