import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { MbpdataService } from "../service/mbpdata.service"
import { Router } from '@angular/router';
import { ViewdetailsService } from '../service/viewdetails.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-catviews',
  templateUrl: './catviews.component.html',
  styleUrls: ['./catviews.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CatviewsComponent implements OnInit {
  
  submitAttempt: boolean;
  geo: string;
  private sub: any;
  searchValue: string = "";
  selectedRows: any;

  constructor(private http: Http, private route: ActivatedRoute,
    private reviewdataviewService: MbpdataService, private titleSevice: Title,
    private router: Router, private viewdetails: ViewdetailsService, 
    private spinnerService: NgxSpinnerService) { };

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  rdl: any;

  nodes: any = [{
    data: {
      Form: "",
      dtACRBDate: "",
      dtOrgDate: "",
      txtAssistAnalyst: "",
      txtCPN: "",
      txtChannel: "",
      txtLAName: "",
      txtLogNo: "",
      txtRvwMethod: "",
      txtRvwType: "",
      _id: "",
      _rev: ""
    }
  }];

  ngOnInit() {
    this.searchValue = "";

    this.sub = this.route.params.subscribe(params => {
      this.geo = params['geo'];
      
      // determine the row values based on the url geo parameter
      this.searchBtn(this.geo);

      let searchStr = this.reviewdataviewService.getSearchStr();
      if (searchStr) {
        this.searchValue = searchStr;
      }
    })
    this.titleSevice.setTitle("RDL")
  }
  
  CreateMainDocument() {
    this.spinnerService.show();
    this.reviewdataviewService.setMbpData("");
    this.reviewdataviewService.setViewPath(window.location.pathname);
    this.router.navigate(['/mainform']);
  }

  setFormName(fname) {
    if (fname == "frmMain") {
      this.router.navigate(['/mainform']);
    } else if (fname == "frmAllegation") {
      this.router.navigate(['/allegation/select']);
    } else if (fname == "frmCHW") {
      this.router.navigate(['/chwtrans/select']);
    } else if (fname == "TransDoc") {
      this.router.navigate(['/chwswgtrans/select']);
    } else if (fname == "frmITS") {
      this.router.navigate(['/itsmtstrans/select']);
    } else if (fname == "frmMiscDoc") {
      this.router.navigate(['/misc/select']);
    } else if (fname == "frmPrReview") {
      this.router.navigate(['/peerreviewresults/select']);
    } else if (fname == "frmSW") {
      this.router.navigate(['/swtransaction/select']);
    } else if (fname == "frmCFMBGF") {
      this.router.navigate(['/cfmbgftrans/select']);
    }
  }

  refreshData() {
    // this.nodes.data = this.nodes.data.slice();
    this.reviewdataviewService.setSearchStr(this.searchValue);
  }

  nodeSelect(event) {
    let id = event.node.data._id;
    if(id && id != '') {
      this.spinnerService.show();
      this.reviewdataviewService.setViewPath(window.location.pathname);
      let params = new URLSearchParams();
      params.append("id", id);
      this.viewdetails.getDocbyid(params).subscribe(
        data => {
          this.reviewdataviewService.setMbpData(JSON.parse(data["_body"]));
          var formname = JSON.parse(data["_body"])["Form"];
          this.setFormName(formname);
        },
        error => console.error(error),
        () => { }
      );
    }
  }
  
  searchBtn(urlGeoParam: string) {
    
    // stop the serach if invalid special chars are entered for search
    if (urlGeoParam == 'clickAction' && 
        _.trim(this.reviewdataviewService.getSearchStr()) != "" && 
        this.invalidSpecialChars(this.reviewdataviewService.getSearchStr())
      ) {
      alert("Please do not enter special characters in the search value!!!");
      return;
    }

    let emptyObject: any = {
      Form: "",
      dtACRBDate: "",
      dtOrgDate: "",
      txtAssistAnalyst: "",
      txtCPN: "",
      txtChannel: "",
      txtLAName: "",
      txtLogNo: "",
      txtRvwMethod: "",
      txtRvwType: "",
      _id: "",
      _rev: ""
    }

    if (window.location.pathname == "/ByLogNumberUnLocked/ByLogNumberUnLocked" || urlGeoParam == "ByLogNumberUnLocked" || window.location.pathname =="/ByLogNumberUnLockedAM/ByLogNumberUnLockedAM" || urlGeoParam == "ByLogNumberUnLockedAM"
    || window.location.pathname == "/ByLogNumberUnLockedAP/ByLogNumberUnLockedAP" || urlGeoParam == "ByLogNumberUnLockedAP" || window.location.pathname =="/ByLogNumberUnLockedEMEA/ByLogNumberUnLockedEMEA" || urlGeoParam == "ByLogNumberUnLockedEMEA"
    || window.location.pathname == "/ByLogNumberUnLockedLA/ByLogNumberUnLockedLA" || urlGeoParam == "ByLogNumberUnLockedLA"  || window.location.pathname == "/ByLogNumberUnLockedJAPAN/ByLogNumberUnLockedJAPAN" || urlGeoParam == "ByLogNumberUnLockedJAPAN" || window.location.pathname == "/ByLogNumberUnLockedGCG/ByLogNumberUnLockedGCG" || urlGeoParam == "ByLogNumberUnLockedGCG" ) {
      // initial message when the row data is being retrived from the api
      this.nodes.data = [{
        data: {
          txtLogNo: "Data is loading... Please wait..."
        }
      }];

      let params = new URLSearchParams();
      params.append("searchStr", this.reviewdataviewService.getSearchStr());
      let headers = new Headers();
      let options = new RequestOptions({ params: params, headers: headers });
      var apicallurl;
      if(window.location.pathname == "/ByLogNumberUnLocked/ByLogNumberUnLocked"){
        apicallurl = '/api/ByLogNumberUnLocked/'
      }else if(window.location.pathname == "/ByLogNumberUnLockedAM/ByLogNumberUnLockedAM"){
        apicallurl = '/api/ByLogNumberUnLockedAM/'
      }else if(window.location.pathname == "/ByLogNumberUnLockedAP/ByLogNumberUnLockedAP"){
        apicallurl = '/api/ByLogNumberUnLockedAP/'
      }else if(window.location.pathname == "/ByLogNumberUnLockedEMEA/ByLogNumberUnLockedEMEA"){
        apicallurl = '/api/ByLogNumberUnLockedEMEA/'
      }else if(window.location.pathname == "/ByLogNumberUnLockedLA/ByLogNumberUnLockedLA"){
        apicallurl = '/api/ByLogNumberUnLockedLA/'
      }else if(window.location.pathname == "/ByLogNumberUnLockedJAPAN/ByLogNumberUnLockedJAPAN"){
        apicallurl = '/api/ByLogNumberUnLockedJAPAN/'
      }else if(window.location.pathname == "/ByLogNumberUnLockedGCG/ByLogNumberUnLockedGCG"){
        apicallurl = '/api/ByLogNumberUnLockedGCG/'
      }
console.log(apicallurl);
      this.http.get(apicallurl, options).subscribe(
        data => {
          console.log("working")
          this.rdl = JSON.parse(data["_body"]);
        },
        error => console.log(error),
        () => {
          let rdldata = this.rdl.data;
          var result = _.chain(rdldata)
            .groupBy("txtLogNo")
            .toPairs()
            .map(function (currentItem) {
              return _.zipObject(["data", "children"], currentItem);
            })
            .value();

          _.forEach(result, function (value: any, key) {
            let txtLogNo: any = value.data;
            value.data = _.find(rdldata, { 'txtLogNo': value.data, 'Form': 'Main' });
            if (typeof value.data == 'undefined') {
              let obj = _.clone(emptyObject)
              obj.txtLogNo = txtLogNo;
              obj.txtLogNo = (txtLogNo == 'undefined' || txtLogNo.trim() == '') ? "No Log Number" : txtLogNo;
              value.data = obj;
            } else {
              value.data.txtLogNo = (txtLogNo == 'undefined' || txtLogNo.trim() == '') ? "No Log Number" : txtLogNo;
            }

            var children_result = _.map(value.children, function (value, prop) {
              return { data: value };
            });
            
            // remove the frmMain record from the children list
            children_result = _.filter(children_result, function(value) {
              let tempTransNum: string = "";
              let tempEndUser: string = "";
              if(value.data.Form != "Main") {
                if(value.data.Form == "frmAllegation") {
                  if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txtTransactionNum;
                  }
                  if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txtEnduserTr;
                  }
                  value.data.Form = "Allegation" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmCHW") {
                  if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txTransactionNum;
                  }
                  if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txEnduserTr;
                  }
                  value.data.Form = "CHW Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "TransDoc") {
                  if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txtTransactionNum;
                  }
                  if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txtEnduserTr;
                  }
                  value.data.Form = "Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmITS") {
                  if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txtTransactionNum;
                  }
                  if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txtEnduserTr;
                  }
                  value.data.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmMiscDoc") {
                  if(value.data.txtAttNameMisc && value.data.txtAttNameMisc != "" && value.data.txtAttNameMisc != "undefined") {
                    tempTransNum = ": " + value.data.txtAttNameMisc;
                  }
                  value.data.Form = "Misc Doc" + tempTransNum;
                } else if(value.data.Form == "frmPrReview") {
                  if(value.data.rtAttachPR && value.data.rtAttachPR != "" && value.data.rtAttachPR != "undefined") {
                    tempTransNum = ": " + value.data.rtAttachPR;
                  }
                  value.data.Form = "Peer Review Results" + tempTransNum;
                } else if(value.data.Form == "frmSW") {
                  if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txTransactionNum;
                  }
                  if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txEnduserTr;
                  }
                  value.data.Form = "SW Transaction" + tempTransNum + tempEndUser;
                }else if(value.data.Form == "frmCFMBGF") {
                  if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txTransactionNum;
                  }
                  if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txEnduserTr;
                  }
                  value.data.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
                }
                return value;
              }
            })

            // value.children = children_result;
            value.children = _.orderBy(children_result, [doc => doc.data.Form.toLowerCase()], ['asc']);
          });

          this.nodes = { data: result };
          if(result.length == 0) {
            this.nodes.data = [{
              data: {
                txtLogNo: "No records found..."
              }
            }];
          }
          this.refreshData();
        }
      );      
    } else if (window.location.pathname == "/ByLogNumberLocked/ByLogNumberLocked" || urlGeoParam == "ByLogNumberLocked"
    || window.location.pathname == "/ByLogNumberLockedAM/ByLogNumberLockedAM" || urlGeoParam == "ByLogNumberLockedAM" || window.location.pathname == "/ByLogNumberLockedAP/ByLogNumberLockedAP" 
    || urlGeoParam == "ByLogNumberLockedAP" ||window.location.pathname == "/ByLogNumberLockedEMEA/ByLogNumberLockedEMEA" || urlGeoParam == "ByLogNumberLockedEMEA"
    ||window.location.pathname == "/ByLogNumberLockedLA/ByLogNumberLockedLA" || urlGeoParam == "ByLogNumberLockedLA"
    ||window.location.pathname == "/ByLogNumberLockedJAPAN/ByLogNumberLockedJAPAN" || urlGeoParam == "ByLogNumberLockedJAPAN"
    ||window.location.pathname == "/ByLogNumberLockedGCG/ByLogNumberLockedGCG" || urlGeoParam == "ByLogNumberLockedGCG") {
      // initial message when the row data is being retrived from the api
      this.nodes.data = [{
        data: {
          txtLogNo: "Data is loading... Please wait..."
        }
      }];

      let params = new URLSearchParams();
      params.append("searchStr", this.reviewdataviewService.getSearchStr());
      let headers = new Headers();
      let options = new RequestOptions({ params: params, headers: headers });

      var apicalllocked
      if(window.location.pathname == "/ByLogNumberLocked/ByLogNumberLocked"){
        apicalllocked = '/api/ByLogNumberLocked/'
      }else if(window.location.pathname == "/ByLogNumberLockedAM/ByLogNumberLockedAM"){
        apicalllocked = '/api/ByLogNumberLockedAM/'
      }else if(window.location.pathname == "/ByLogNumberLockedAP/ByLogNumberLockedAP"){
        apicalllocked = '/api/ByLogNumberLockedAP/'
      }else if(window.location.pathname == "/ByLogNumberLockedEMEA/ByLogNumberLockedEMEA"){
        apicalllocked = '/api/ByLogNumberLockedEMEA/'
      }else if(window.location.pathname == "/ByLogNumberLockedLA/ByLogNumberLockedLA"){
        apicalllocked = '/api/ByLogNumberLockedLA/'
      }else if(window.location.pathname == "/ByLogNumberLockedJAPAN/ByLogNumberLockedJAPAN"){
        apicalllocked = '/api/ByLogNumberLockedJAPAN/'
      } else if(window.location.pathname == "/ByLogNumberLockedGCG/ByLogNumberLockedGCG"){
          apicalllocked = '/api/ByLogNumberLockedGCG/'
      }

      this.http.get(apicalllocked, options).subscribe(
        data => {
          this.rdl = JSON.parse(data["_body"]);
        },
        error => console.error(error),
        () => {
          let rdldata = this.rdl.data;
          var result = _.chain(rdldata)
            .groupBy("txtLogNo")
            .toPairs()
            .map(function (currentItem) {
              return _.zipObject(["data", "children"], currentItem);
            })
            .value();
            
          _.forEach(result, function (value: any, key) {
            let txtLogNo: any = value.data;
            value.data = _.find(rdldata, { 'txtLogNo': value.data, 'Form': 'Main' });
            if(typeof value.data == 'undefined') {
              let obj = _.clone(emptyObject)
              obj.txtLogNo = txtLogNo;
              obj.txtLogNo = (txtLogNo == 'undefined' || txtLogNo.trim() == '') ? "No Log Number" : txtLogNo;
              value.data = obj;
            } else {
              value.data.txtLogNo=(txtLogNo == 'undefined' || txtLogNo.trim() == '') ? "No Log Number" : txtLogNo;
            }

            var children_result = _.map(value.children, function (value, prop) {
              return {data: value };
            });

            // remove the frmMain record from the children list
            children_result = _.filter(children_result, function(value) {
              let tempTransNum: string = "";
              let tempEndUser: string = "";
              if(value.data.Form != "Main") {
                if(value.data.Form == "frmAllegation") {
                  if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txtTransactionNum;
                  }
                  if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txtEnduserTr;
                  }
                  value.data.Form = "Allegation" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmCHW") {
                  if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txTransactionNum;
                  }
                  if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txEnduserTr;
                  }
                  value.data.Form = "CHW Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "TransDoc") {
                  if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txtTransactionNum;
                  }
                  if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txtEnduserTr;
                  }
                  value.data.Form = "Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmITS") {
                  if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txtTransactionNum;
                  }
                  if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txtEnduserTr;
                  }
                  value.data.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmMiscDoc") {
                  if(value.data.txtAttNameMisc && value.data.txtAttNameMisc != "" && value.data.txtAttNameMisc != "undefined") {
                    tempTransNum = ": " + value.data.txtAttNameMisc;
                  }
                  value.data.Form = "Misc Doc" + tempTransNum;
                } else if(value.data.Form == "frmPrReview") {
                  if(value.data.rtAttachPR && value.data.rtAttachPR != "" && value.data.rtAttachPR != "undefined") {
                    tempTransNum = ": " + value.data.rtAttachPR;
                  }
                  value.data.Form = "Peer Review Results" + tempTransNum;
                } else if(value.data.Form == "frmSW") {
                  if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txTransactionNum;
                  }
                  if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txEnduserTr;
                  }
                  value.data.Form = "SW Transaction" + tempTransNum + tempEndUser;
                } else if(value.data.Form == "frmCFMBGF") {
                  if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                    tempTransNum = ": " + value.data.txTransactionNum;
                  }
                  if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                    tempEndUser = " - " + value.data.txEnduserTr;
                  }
                  value.data.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
                }
                return value;
              }
            })
            
            // value.children = children_result;
            value.children = _.orderBy(children_result, [doc => doc.data.Form.toLowerCase()], ['asc']);
          });
          
          this.nodes = { data: result };
          if(result.length == 0) {
            this.nodes.data = [{
              data: {
                txtLogNo: "No records found..."
              }
            }];
          }
          this.refreshData();
        }
      );
    }else if (window.location.pathname == "/Myreviews/Myreviews" || urlGeoParam == "Myreviews" ||window.location.pathname == "/MyreviewsAM/MyreviewsAM" ||
     urlGeoParam == "MyreviewsAM" || window.location.pathname == "/MyreviewsAP/MyreviewsAP" || urlGeoParam == "MyreviewsAP" || window.location.pathname == "/MyreviewsEMEA/MyreviewsEMEA" ||
     urlGeoParam == "MyreviewsEMEA" || window.location.pathname == "/MyreviewsLA/MyreviewsLA" || urlGeoParam == "MyreviewsLA"|| window.location.pathname == "/MyreviewsJAPAN/MyreviewsJAPAN" || urlGeoParam == "MyreviewsJAPAN" || window.location.pathname == "/MyreviewsGCG/MyreviewsGCG" || urlGeoParam == "MyreviewsGCG" ) {
      
       this.nodes.data = [{
        data: {
          txtLogNo: "Data is loading... Please wait..."
        }
      }];

      let params = new URLSearchParams();
      params.append("searchStr", this.reviewdataviewService.getSearchStr());
      let headers = new Headers();
      let options = new RequestOptions({ params: params, headers: headers });

      var apicallmyreviews
      if(window.location.pathname == "/Myreviews/Myreviews"){
        apicallmyreviews = '/api/Myreviews/'
      }else if(window.location.pathname == "/MyreviewsAM/MyreviewsAM"){
        apicallmyreviews = '/api/MyreviewsAM/'
      }else if(window.location.pathname == "/MyreviewsAP/MyreviewsAP"){
        apicallmyreviews = '/api/MyreviewsAP/'
      }else if(window.location.pathname == "/MyreviewsEMEA/MyreviewsEMEA"){
        apicallmyreviews = '/api/MyreviewsEMEA/'
      }else if(window.location.pathname == "/MyreviewsLA/MyreviewsLA"){
        apicallmyreviews = '/api/MyreviewsLA/'
      }else if(window.location.pathname == "/MyreviewsJAPAN/MyreviewsJAPAN"){
        apicallmyreviews = '/api/MyreviewsJAPAN/'
      }else if(window.location.pathname == "/MyreviewsGCG/MyreviewsGCG"){
        apicallmyreviews = '/api/MyreviewsGCG/'
      }

      this.http.get(apicallmyreviews, options).subscribe(
        data => {
          this.rdl = JSON.parse(data["_body"]);
        },
        error => console.error(error),
        () => {
          let rdldata = this.rdl.data;
          var result = _.chain(rdldata)
            .groupBy("catName")
            .toPairs()
            .map(function (currentItem) {
              return _.zipObject(["data", "children"], currentItem);
            })
            .value();

         _.forEach(result, function (value: any, key) {
          let catName: any = value.data;
          value.data = _.find(rdldata, { 'catName': value.data });

          let obj = _.clone(emptyObject);
          obj.catName = catName;
          value.data = obj;

          var childResult = _.chain(value.children)
            .groupBy("txtLogNo")
            .toPairs()
            .map(function (currentItem) {
              return _.zipObject(["data", "children"], currentItem);
            })
            .value();

          _.forEach(childResult, function(childVal: any, key) {
            let txtLogNo: any = childVal.data;
            childVal.data = _.find(childResult, { 'txtLogNo': childVal.data });

            let objChild = _.clone(emptyObject);
           objChild.catName =txtLogNo;
            childVal.data = objChild;

            childVal.children = _.map(childVal.children, function (value, prop) {
              return { "data": value };
            });

          childVal.children = _.filter(childVal.children, function(value) {
          let tempTransNum: string = "";
          let tempEndUser: string = "";

            if(value.data.Form == "frmAllegation") {
              if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                tempTransNum = ": " + value.data.txtTransactionNum;
              }
              if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                tempEndUser = " - " + value.data.txtEnduserTr;
              }
              value.data.Form = "Allegation" + tempTransNum + tempEndUser;
            } else if(value.data.Form == "frmCHW") {
              if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                tempTransNum = ": " + value.data.txTransactionNum;
              }
              if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                tempEndUser = " - " + value.data.txEnduserTr;
              }
              value.data.Form = "CHW Transaction" + tempTransNum + tempEndUser;
            } else if(value.data.Form == "TransDoc") {
              if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                tempTransNum = ": " + value.data.txtTransactionNum;
              }
              if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                tempEndUser = " - " + value.data.txtEnduserTr;
              }
              value.data.Form = "Transaction" + tempTransNum + tempEndUser;
            } else if(value.data.Form == "frmITS") {
              if(value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
                tempTransNum = ": " + value.data.txtTransactionNum;
              }
              if(value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
                tempEndUser = " - " + value.data.txtEnduserTr;
              }
              value.data.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
            } else if(value.data.Form == "frmMiscDoc") {
              if(value.data.txtAttNameMisc && value.data.txtAttNameMisc != "" && value.data.txtAttNameMisc != "undefined") {
                tempTransNum = ": " + value.data.txtAttNameMisc;
              }
              value.data.Form = "Misc Doc" + tempTransNum;
            } else if(value.data.Form == "frmPrReview") {
              if(value.data.rtAttachPR && value.data.rtAttachPR != "" && value.data.rtAttachPR != "undefined") {
                tempTransNum = ": " + value.data.rtAttachPR;
              }
              value.data.Form = "Peer Review Results" + tempTransNum;
            } else if(value.data.Form == "frmSW") {
              if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                tempTransNum = ": " + value.data.txTransactionNum;
              }
              if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                tempEndUser = " - " + value.data.txEnduserTr;
              }
              value.data.Form = "SW Transaction" + tempTransNum + tempEndUser;
            } else if(value.data.Form == "frmCFMBGF") {
              if(value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
                tempTransNum = ": " + value.data.txTransactionNum;
              }
              if(value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
                tempEndUser = " - " + value.data.txEnduserTr;
              }
              value.data.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
            }
            return value;
        }) 
      })

          value.children = childResult;
        });

          this.nodes = { data: result };
          if(result.length == 0) {
            this.nodes.data = [{
              data: {
                txtLogNo: "No records found..."
              }
            }];
          }
          this.refreshData();
        }
      );
    }

  }

  invalidSpecialChars(inputStr: string): boolean {
    let includesSpecialChars: boolean = false;
    var specialCharsList = ["~","`","!","@","#","$","\"","'","%","^","&","*","(",")","+","=","{","}","[","]",":",";",",",".","?"];
    _.forEach(specialCharsList, function(value, key) {
      if(_.includes(inputStr, value)) {
        includesSpecialChars = true;
      }
    })
    return includesSpecialChars;
  }
  
  expandAll() {
    _.forEach(this.nodes.data, function(value, key) {
      value['expanded'] = true;
    })
  }

  collapseAll() {
    _.forEach(this.nodes.data, function(value, key) {
      value['expanded'] = false;
    })
  }
}
