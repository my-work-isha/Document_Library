import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLSearchParams, RequestOptions } from '@angular/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { MbpdataService } from "../service/mbpdata.service"
import { Router } from '@angular/router';
import { ViewdetailsService } from '../service/viewdetails.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import {getMonth,getYear,getDate} from "date-fns"

@Component({
  selector: 'app-allviews',
  templateUrl: './allviews.component.html',
  styleUrls: ['./allviews.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AllviewsComponent implements OnInit {

  rowData: any;
  columnDefs: any;
  private gridApi;
  private gridColumnApi;
  private apiURL: string;
  searchValue: string;
  private geo: string;
  private sub: any;

  constructor(private http: HttpClient, private route: ActivatedRoute,
    private mbpdataService: MbpdataService, private titleService: Title,
    private router: Router, private viewdetails: ViewdetailsService,
    private spinnerService: NgxSpinnerService) { };

  ngOnInit() {
    this.spinnerService.show();
    this.sub = this.route.params.subscribe(params => {
      this.geo = params['geo'];
      //ByLeadAnalyst UnLocked
      if (this.geo === "ByLeadAnalystUnLocked" || this.geo === "ByLeadAnalystUnLockedAM"
        || this.geo === "ByLeadAnalystUnLockedAP" || this.geo === "ByLeadAnalystUnLockedEMEA"
        || this.geo === "ByLeadAnalystUnLockedLA" || this.geo === "ByLeadAnalystUnLockedJAPAN" || this.geo === "ByLeadAnalystUnLockedGCG") {

        if (this.geo === "ByLeadAnalystUnLocked") {
          this.apiURL = '/api/ByLeadAnalystUnLocked/';
        } else if (this.geo === "ByLeadAnalystUnLockedAM") {
          this.apiURL = '/api/ByLeadAnalystUnLockedAM/';
        } else if (this.geo === "ByLeadAnalystUnLockedAP") {
          this.apiURL = '/api/ByLeadAnalystUnLockedAP/';
        } else if (this.geo === "ByLeadAnalystUnLockedEMEA") {
          this.apiURL = '/api/ByLeadAnalystUnLockedEMEA/';
        } else if (this.geo === "ByLeadAnalystUnLockedLA") {
          this.apiURL = '/api/ByLeadAnalystUnLockedLA/';
        } else if (this.geo === "ByLeadAnalystUnLockedJAPAN") {
          this.apiURL = '/api/ByLeadAnalystUnLockedJAPAN/';
        }
        else if (this.geo === "ByLeadAnalystUnLockedGCG") {
          this.apiURL = '/api/ByLeadAnalystUnLockedGCG/';
        }

        this.columnDefs = [
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' }
        ];
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }

      //ByLeadAnalystLocked
      if (this.geo === "ByLeadAnalystLocked" || this.geo === "ByLeadAnalystLockedAM" || this.geo === "ByLeadAnalystLockedAP" ||
        this.geo === "ByLeadAnalystLockedEMEA" || this.geo === "ByLeadAnalystLockedLA" || this.geo === "ByLeadAnalystLockedJAPAN" || this.geo === "ByLeadAnalystLockedGCG") {

        if (this.geo === "ByLeadAnalystLocked") {
          this.apiURL = '/api/ByLeadAnalystLocked/'
        } else if (this.geo === "ByLeadAnalystLockedAM") {
          this.apiURL = '/api/ByLeadAnalystLockedAM/'
        } else if (this.geo === "ByLeadAnalystLockedAP") {
          this.apiURL = '/api/ByLeadAnalystLockedAP/'
        } else if (this.geo === "ByLeadAnalystLockedEMEA") {
          this.apiURL = '/api/ByLeadAnalystLockedEMEA/'
        } else if (this.geo === "ByLeadAnalystLockedLA") {
          this.apiURL = '/api/ByLeadAnalystLockedLA/'
        } else if (this.geo === "ByLeadAnalystLockedJAPAN") {
          this.apiURL = '/api/ByLeadAnalystLockedJAPAN/'
        } else if (this.geo === "ByLeadAnalystLockedGCG") {
          this.apiURL = '/api/ByLeadAnalystLockedGCG/'
        }

        this.columnDefs = [
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' }
        ];
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );

      }

      //ByAssistAnalyst
      if (this.geo === "ByAssistAnalyst") {
        this.apiURL = '/api/ByAssistAnalyst/';
        this.columnDefs = [
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' }
        ];
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }

      //ByBusinessPartner
      if (this.geo === "ByBusinessPartner" || this.geo === "ByBusinessPartnerAM" || this.geo === "ByBusinessPartnerAP"
        || this.geo === "ByBusinessPartnerEMEA" || this.geo === "ByBusinessPartnerLA" || this.geo === "ByBusinessPartnerJAPAN" || this.geo === "ByBusinessPartnerGCG") {

        if (this.geo === "ByBusinessPartner") {
          this.apiURL = '/api/ByBusinessPartner/'
        } else if (this.geo === "ByBusinessPartnerAM") {
          this.apiURL = '/api/ByBusinessPartnerAM/'
        } else if (this.geo === "ByBusinessPartnerAP") {
          this.apiURL = '/api/ByBusinessPartnerAP/'
        } else if (this.geo === "ByBusinessPartnerEMEA") {
          this.apiURL = '/api/ByBusinessPartnerEMEA/'
        } else if (this.geo === "ByBusinessPartnerLA") {
          this.apiURL = '/api/ByBusinessPartnerLA/'
        } else if (this.geo === "ByBusinessPartnerJAPAN") {
          this.apiURL = '/api/ByBusinessPartnerJAPAN/'
        }else if (this.geo === "ByBusinessPartnerGCG") {
          this.apiURL = '/api/ByBusinessPartnerGCG/'
        }

        this.columnDefs = [
          { headerName: 'Business Partner', field: 'txtCPN' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' }
        ];
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }

      //ByAuthor
      if (this.geo === "ByAuthor") {
        this.apiURL = "/api/ByAuthor/";
        this.columnDefs = [
          { headerName: 'Author', field: 'DocCreator' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' }
        ];

        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }

      //By Status
      if (this.geo === "ByStatus") {
        this.apiURL = "/api/ByStatus/";
        this.columnDefs = [
          { headerName: 'Status', field: 'txtStatus' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' },
        ];
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }


      //ByBPCRPDate
      if (this.geo === "ByBPCRPDate") {
        this.apiURL = "/api/ByBPCRPDate/";
        this.columnDefs = [
          { headerName: 'BPCRB Date', field: 'dtACRBDate' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
        ];
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }

      //ByChannel
      if (this.geo === "ByChannel") {
        this.apiURL = "/api/ByChannel/";
        this.columnDefs = [
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' },
        ]
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }


      //ByReviewer
      if (this.geo === "ByReviewer") {
        this.apiURL = "/api/ByReviewer/";
        this.columnDefs = [
          { headerName: 'Reviewer', field: 'dlgLogApprovers' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Legal Name', field: 'txtCPN' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod  ' },
          { headerName: 'Origination/Log Date', field: 'dtOrgDate ' },
          { headerName: 'BPCRB Date', field: 'dtACRBDate' },
        ]
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }


      //PeerReviewResults
      if (this.geo === "PeerReviewResults") {
        this.apiURL = "/api/PeerReviewResults/";
        this.columnDefs = [
          { headerName: 'Peer Reviewer', field: 'txtPeerReviewer' },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form Name', field: 'Form' },
          { headerName: 'Channel', field: 'txtChannel' },
          { headerName: 'Document Author', field: 'DocCreator' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Business Partner', field: 'txBP' },
          { headerName: 'Status', field: 'txPRStatus' },
          {headerName: 'Peer Review Performed Date', valueGetter: getdtperformed, width:250}
        ]
        this.http.get(this.apiURL).subscribe(
          value => {
            this.rowData = value["data"]
          },
          error => console.error(error),
          () => this.spinnerService.hide()
        );
      }
    })
    this.titleService.setTitle("RDL")
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.searchValue = this.mbpdataService.getSearchStr();
    this.gridApi.setQuickFilter(this.mbpdataService.getSearchStr());
  }

  exportToCSV(params) {
    this.gridApi.exportDataAsCsv(params);
  }

  onRowDoubleClicked(params) {
    this.spinnerService.show();
    this.mbpdataService.setViewPath(window.location.pathname);
    let idParams = new URLSearchParams();
    idParams.append("id", params.data._id);
    this.viewdetails.getDocbyid(idParams).subscribe(
      data => {
        this.mbpdataService.setMbpData(JSON.parse(data["_body"]));
        var formname = JSON.parse(data["_body"])["Form"];
        this.setFormName(formname)
      },
      error => console.error(error)
    );
  }

  onQuickFilterChanged($event) {
    this.mbpdataService.setSearchStr($event.target.value);
    this.gridApi.setQuickFilter($event.target.value);
  }
  CreateMainDocument() {
    this.spinnerService.show();
    this.mbpdataService.setMbpData("");
    this.mbpdataService.setViewPath(window.location.pathname);
    this.router.navigate(['/mainform']);
    this.mbpdataService.getSearchStr();//set the search string
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
}
function getdtperformed(params) {
  if (params.data.dtPRPerformed == ""||params.data.dtPRPerformed == undefined) {
    return formatDate(params.data.sigtimestamp.split(' ')[0])
  }else{ 
    return params.data.dtPRPerformed;
  }
}

function appendZeroToDate(val) {
  if (val < 10) {
    return '0' + val;
  } else {
    return val;
  }
}

function formatDate(date: any) {
  return _.toString(appendZeroToDate(getMonth(date)+1)) + "/" + _.toString(appendZeroToDate(getDate(date) ) + "/" + (getYear(date)));
}