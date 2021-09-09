import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './bpc/welcome/welcome.component';
import { HeaderComponent } from './common/component/header/header.component';
import { FooterComponent } from './common/component/footer/footer.component';
import { SidenavComponent } from './common/component/sidenav/sidenav.component';
import { routing } from './app.routes';

import { MbpdataService } from "./bpc/service/mbpdata.service";
import { MbpviewserviceService } from './bpc/service/mbpviewservice.service';
import { UserdetailsService } from './bpc/service/userdetails.service';
import { ViewdetailsService } from './bpc/service/viewdetails.service';
import { KeywordsService } from './bpc/service/keywords.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent
  ],
  imports: [
    BrowserModule,
    routing,
    HttpModule,
    NgxSpinnerModule,
    HttpClientModule
  ],
  providers: [MbpdataService,MbpviewserviceService, UserdetailsService, ViewdetailsService, KeywordsService],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor() {
    console.log("AppModule is loaded!!!")
  }
}
