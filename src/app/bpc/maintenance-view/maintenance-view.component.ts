import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLSearchParams, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { MbpdataService } from "../service/mbpdata.service"
import { Router } from '@angular/router';
import { ViewdetailsService } from '../service/viewdetails.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import { UserdetailsService } from '../service/userdetails.service';

@Component({
  selector: 'app-maintenance-view',
  templateUrl: './maintenance-view.component.html',
  styleUrls: ['./maintenance-view.component.css']
})
export class MaintenanceViewComponent implements OnInit {

  submitAttempt:boolean;
  selectedRowArray: string[];
  user: any;
  showBox: boolean = true;
  strLogNos: string;
  curdt: string;
  curdt_enc: string;
  sign: string;
  private sub: any;
  private type: string;
  private apiURL: string;
  rowData: any;
  columnDefs: any;
  private gridApi;
  private gridColumnApi;
  searchValue: string;


  constructor(private http: HttpClient, private route: ActivatedRoute,
    private mbpdataService: MbpdataService, private titleService: Title,
    private router: Router, private viewdetails: ViewdetailsService,private userdetails: UserdetailsService,
    private spinnerService: NgxSpinnerService) { };

    ngOnInit() {
    this.sub = this.route.params.subscribe(value => {
      this.type = value['type'];
      this.spinnerService.show();

      this.userdetails.getUserdetails().subscribe(
        data => this.user=JSON.parse(data["_body"]),
        error => console.error(error),
        () => {
          this.user= this.user._json;
        }
      )

      this.apiURL = '/api/maintenanceview';
        this.columnDefs = [
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form', valueGetter: getForm},
          { headerName: 'Doc Status', field: 'txtStatus' },
          { headerName: 'Current Primary Name', field: 'txtCPN' },
          { headerName: 'Lock Status', valueGetter: getLockstatus },
          { headerName: 'Doc ID', field: '_id' },
          { headerName: '$REF', field: '$REF' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' }        
        ]

        this.http.get(this.apiURL).subscribe(
          value => this.rowData = value["data"],
          error => console.error(error),
          () => {
            this.spinnerService.hide();
          }
         )
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
    }
  }
}

function getLockstatus(value){
  if(value.data.lock_status == "0"){
    return 'Unlocked'
  }else if(value.data.lock_status == "1"){
    return 'Locked'
  }
}

function getForm(value) {
  let tempTransNum: string = "";
  let tempEndUser: string = "";
  if(value.data.Form == "frmMain"){
    return "Main"
  }
  
    if (value.data.Form == "frmAllegation") {
      if (value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txtTransactionNum;
      }
      if (value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txtEnduserTr;
      }
     return "Allegation" + tempTransNum + tempEndUser;
    } else if (value.data.Form == "frmCHW") {
      if (value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txTransactionNum;
      }
      if (value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txEnduserTr;
      }
      return "CHW Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.Form == "TransDoc") {
      if (value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txtTransactionNum;
      }
      if (value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txtEnduserTr;
      }
      return "Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.Form == "frmITS") {
      if (value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txtTransactionNum;
      }
      if (value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txtEnduserTr;
      }
     return "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.Form == "frmMiscDoc") {
      if (value.data.txtAttNameMisc && value.data.txtAttNameMisc != "" && value.data.txtAttNameMisc != "undefined") {
        tempTransNum = ": " + value.data.txtAttNameMisc;
      }
      return "Misc Doc" + tempTransNum;
    } else if (value.data.Form == "frmPrReview") {
      if (value.data.rtAttachPR && value.data.rtAttachPR != "" && value.data.rtAttachPR != "undefined") {
        tempTransNum = ": " + value.data.rtAttachPR;
      }
      return "Peer Review Results" + tempTransNum;
    } else if (value.data.Form == "frmSW") {
      if (value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txTransactionNum;
      }
      if (value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txEnduserTr;
      }
      return "SW Transaction" + tempTransNum + tempEndUser;
    }
    else {
      return value.data.Form
    }
  }