import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { UserdetailsService } from '../../../bpc/service/userdetails.service';
import { KeywordsService } from '../../../bpc/service/keywords.service';
import { MbpdataService } from '../../../bpc/service/mbpdata.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidenavComponent implements OnInit {

  constructor(private userdetails: UserdetailsService, private keyworddetails: KeywordsService, 
              private mbpdataservice: MbpdataService, private spinnerService: NgxSpinnerService) { }
  
  keywords = [];
  kwCSVmember = [];
  isAdmin: boolean;
  user: any;
  canTakeReports: boolean = false;
  
  ngOnInit() {
    this.keyworddetails.getFixedkeywords().subscribe(
      data => this.keyworddetails.setFixedkeywords(JSON.parse(data["_body"])["data"]),
      error => console.error('There was an error while retrieving keywords!!! - ' + error),
      () => {
        this.keywords = this.keyworddetails.Fixedkeywords;
        var index = this.keywords.findIndex(function (item, i) { return item.txFXKeyword === "kwCSVmember" });
        this.kwCSVmember = this.keywords[index].txFXKeyList.split(";");
        
        this.userdetails.getUserdetails().subscribe(
          data => {
            this.user = JSON.parse(data["_body"]);
          }, 
          error => console.error(error),
          () => {
            this.user = this.user._json;
            var varUserLoggedIn = this.user.emailAddress;
            var bGroups = this.user.blueGroups;
            var arrGrps = environment.bGroup_admin.split(",");

            if (arrGrps.some(function(element) {return (bGroups.indexOf(element) != -1)})) {
              this.isAdmin=true;      
            } else {
              this.isAdmin=false;
            }

            // display the 'Reports' sidenav to appropriate members
            if (this.kwCSVmember.some(function (element) { return (element == varUserLoggedIn) })) {
              this.canTakeReports = true;
            } else {
              this.canTakeReports = false;
            }
          }
        )
        if (window.location.href.indexOf("mainform") == -1) {
          this.spinnerService.hide()
        }
      }
    );
  }

  setEmptySearchStr() {
    this.mbpdataservice.setSearchStr("");
  }
}
