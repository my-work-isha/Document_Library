import { Component, OnInit } from '@angular/core';
import { Http} from '@angular/http';
import { Router } from '@angular/router';
import { KeywordsService } from './bpc/service/keywords.service';
import * as _ from "lodash";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private http: Http,private router: Router, 
    private keyworddetails: KeywordsService) {
    
      this.keyworddetails.getCountrymaster().subscribe(
        data => {
        this.keyworddetails.setCountrymaster(JSON.parse(data["_body"])["data"]);
        }, 
        error => console.error(error), 
        () => { }
        ) 
        
    this.keyworddetails.getretrieveProfile().subscribe(
      data => this.keyworddetails.setretrieveProfile(JSON.parse(data["_body"])["data"]),
      error => console.error(error),
      () => { }
    )
    
    // getFixedkeywords() is running from the sidenav component

  }

  ngOnInit(){
    if (!_.includes(window.location.pathname, '/Myreviews') && !_.includes(window.location.pathname, '/mainform/')
    && !_.includes(window.location.pathname, '/allegationdoc/') && !_.includes(window.location.pathname, '/swtransactiondoc/')
    && !_.includes(window.location.pathname, '/itsmtstransdoc/') && !_.includes(window.location.pathname, '/miscdoc/')
    && !_.includes(window.location.pathname, '/chwswgtransdoc/') && !_.includes(window.location.pathname, '/chwtransdoc/')
    && !_.includes(window.location.pathname, '/peerreviewdoc/') && !_.includes(window.location.pathname, '/cfmbgftransdoc/')) 
    {
      this.router.navigate(['/']);
  }
 }
}
