import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { ViewdetailsService } from '../service/viewdetails.service';
import { MbpdataService } from '../service/mbpdata.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash"
import {getMonth,getYear,getDate} from "date-fns"
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-csvexport',
  templateUrl: './csvexport.component.html',
  styleUrls: ['./csvexport.component.css']
})

export class CsvexportComponent implements OnInit {

  private type: string;
  private sub: any;
  private apiURL: string;

  constructor(private http: HttpClient, private router: Router, 
              private route: ActivatedRoute, private mbpdataService: MbpdataService, private titleService: Title,
              private viewdetails: ViewdetailsService, private spinnerService: NgxSpinnerService) { }
              
  rowData: any;
  columnDefs: any;
  private gridApi;
  private gridColumnApi;
  searchValue: string;

  ngOnInit() {
    this.sub = this.route.params.subscribe( value => {
      this.type = value['type'];

      if(this.type == "adhoc") {
        this.apiURL = "/api/adhoc";
        this.columnDefs = [
          { headerName: 'Log number', field: 'txtLogNo' },
          { headerName: 'Doc status', field: 'txtStatus' },
          { headerName: 'Status updated by', field: 'signature' },
          { headerName: 'Status updated on', valueGetter: sigtimestampValid },
          { headerName: 'Current primary name', field: 'txtCPN' },
          { headerName: 'Brand/Channel', field: 'txtChannel' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Assist Analyst', field: 'txtAssistAnalyst' },
          { headerName: 'Type of Review', field: 'txtRvwType' },
          { headerName: 'Method of Review', field: 'txtRvwMethod' },
          { headerName: 'Origination/Log date', valueGetter: dtOrgDateValid },
          { headerName: 'BPCRB date', valueGetter: dtACRBDateValid },
          { headerName: 'Reviewer', field: 'dlgLogApprovers' },
          { headerName: 'Source of Allegation', field: 'txtSrcAllegation' },
          { headerName: 'Workbook required', field: 'rdwbook' },
          { headerName: 'Third party name', field: 'lbThirdPartyName' },
          { headerName: 'Rejection comments', field: 'txtComments' },
          { headerName: 'European Union Review', field: 'rbEuroUnionFlag' },
          { headerName: 'Review notification? Comments_1', field: 'txtReviewNotif' },
          { headerName: 'Review notification? Attachments_1', field: 'rtReviewNotif' },
          { headerName: 'Universe? Comments_2', field: 'txtUniverse' },
          { headerName: 'Universe? Attachments_2', field: 'rtUniverse' },
          { headerName: 'Kickoff Meeting/Sample Comments_3', field: 'txtKickoff' },
          { headerName: 'Kickoff Meeting/Sample Attachments_3', field: 'rtKickoff' },
          { headerName: 'Close Out Mtg Comments_4', field: 'txtCloseout' },
          { headerName: 'Close Out Mtg Attachments_4', field: 'rtCloseout' },
          { headerName: 'Initial Findings(10 day letter) Comments_5', field: 'txtInitialFindings' },
          { headerName: 'Initial Findings(10 day letter) Attachments_5', field: 'rtInitialFindings' },
          { headerName: 'Final Findings Comments_6', field: 'txtFinalFindings' },
          { headerName: 'Final Findings Attachments_6', field: 'rtFinalFindings' },
          { headerName: 'Fact Sheet? Comments_7', field: 'txtFSheet' },
          { headerName: 'Fact Sheet? Attachments_7', field: 'rtFSheet' },
          { headerName: 'BPCRB Letter? Comments_8', field: 'txtBPCRB' },
          { headerName: 'BPCRB Letter? Attachments_8', field: 'rtBPCRB' },
          { headerName: 'Escalation Letter? Comments_9', field: 'txtEscalationLetter' },
          { headerName: 'Escalation Letter? Attachments_9', field: 'rtEscalationLetter' },
          { headerName: 'Recovery Documentation? Comments_10', field: 'txtRecovery' },
          { headerName: 'Recovery Documentation? Attachments_10', field: 'rtRecovery' },
          { headerName: 'Sales Review Workbook(s) Comments_11', field: 'txtSalesReview' },
          { headerName: 'Sales Review Workbook(s) Attachments_11', field: 'rtSalesReview' },
          { headerName: 'Failure to Respond? Comments_12', field: 'txtFailure2Respond' },
          { headerName: 'Failure to Respond? Attachments_12', field: 'rtFailure2Respond' },
          { headerName: 'Misc, Emails & Letters? Comments_13', field: 'txtMisc' },
          { headerName: 'Misc, Emails & Letters? Attachments_13', field: 'rtMisc' },
          { headerName: 'Termination Emails & Letters? Comments_14', field: 'txtTerminationEmails' },
          { headerName: 'Termination Emails & Letters? Attachments_14', field: 'rtTerminationEmails' },
          { headerName: '_id', field: '_id', hide: true },
          { headerName: '_rev', field: '_rev', hide: true }
        ];
      }

      this.http.get(this.apiURL).subscribe(
        value => this.rowData = value["data"], 
        error => console.error(error), 
        () => { }
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
      data => this.mbpdataService.setMbpData(JSON.parse(data["_body"])), 
      error => console.error(error), 
      () => this.router.navigate(['/mainform'])
    );
  }

  onQuickFilterChanged($event) {
    this.mbpdataService.setSearchStr($event.target.value);
    this.gridApi.setQuickFilter($event.target.value);
  }
}


function sigtimestampValid(params) {
  if (checkDateValidity(params.data.sigtimestamp) != "") {
    return formatDate(params.data.sigtimestamp.split(' ')[0])
  }
}

function dtOrgDateValid(params) {
  if (checkDateValidity(params.data.dtOrgDate) != "") {
    return formatDate(params.data.dtOrgDate)
  }
}

function dtACRBDateValid(params) {
  if (checkDateValidity(params.data.dtACRBDate) != "") {
    return formatDate(params.data.dtACRBDate)
  }
}

function checkDateValidity(inputDate) {
  if (inputDate && inputDate != "undefined" && inputDate != "NaN") {
    return inputDate;
  } else {
    return "";
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
    return _.toString(getYear(date)) + "-" + _.toString(appendZeroToDate(getMonth(date) + 1) + "-" + appendZeroToDate(getDate(date)));
}

