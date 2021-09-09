import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MainForm } from "./main-form.model";
import {FormGroup} from '@angular/forms'
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { DataTableDirective } from 'angular-datatables';
import { MbpdataService } from "../service/mbpdata.service"
import { Subject } from 'rxjs/Subject';
import * as _ from "lodash";
import { format } from "date-fns";
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserdetailsService } from '../service/userdetails.service';
import { ActivatedRoute } from '@angular/router';
import { KeywordsService } from '../service/keywords.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient, HttpParams, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { ViewdetailsService } from '../service/viewdetails.service';
import { getMonth, getYear, getDate } from 'date-fns';
import { Title } from '@angular/platform-browser';
import { modelGroupProvider } from '@angular/forms/src/directives/ng_model_group';



declare function addAffix(id: any)

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainFormComponent implements OnInit {
  private id: string;
  mainchannel = [];
  Status = [];
  mainlogapp = [];
  profilefielddays = [];
  doc = [];
  countrynames = [];
  countries = [];

  keywords = [];
  updatestr: string;
  strAudit: string;
  submitcheck:any;
  invalidforms:string;
  statusCurrent: string;
  sign: string;
  mailto: string;
  mailcc: string;
  subdoc1: string;
  subdoc2: string;
  revSaved: String;
  idSaved: String;
  actionMessage: string;
  curtimestamp: string;
  hasLogNum: boolean = false;
  statuschange: boolean = false;
  validationdone: boolean = false;
  curdt: string;
  
  
  @ViewChild('fileInput1') fileInput1: any;
  @ViewChild('fileInput2') fileInput2: any;
  @ViewChild('fileInput3') fileInput3: any;
  @ViewChild('fileInput4') fileInput4: any;
  @ViewChild('fileInput5') fileInput5: any;
  @ViewChild('fileInput6') fileInput6: any;
  @ViewChild('fileInput7') fileInput7: any;
  @ViewChild('fileInput8') fileInput8: any;
  @ViewChild('fileInput9') fileInput9: any;
  @ViewChild('fileInput10') fileInput10: any;
  @ViewChild('fileInput11') fileInput11: any;
  @ViewChild('fileInput12') fileInput12: any;
  @ViewChild('fileInput13') fileInput13: any;
  @ViewChild('fileInput14') fileInput14: any;
  @ViewChild('fileInput15') fileInput15: any;

  sizeFiles1: number = 0;
  sizeFiles2: number = 0;
  sizeFiles3: number = 0;
  sizeFiles4: number = 0;
  sizeFiles5: number = 0;
  sizeFiles6: number = 0;
  sizeFiles7: number = 0;
  sizeFiles8: number = 0;
  sizeFiles9: number = 0;
  sizeFiles10: number = 0;
  sizeFiles11: number = 0;
  sizeFiles12: number = 0;
  sizeFiles13: number = 0;
  sizeFiles14: number = 0;
  sizeFiles15: number = 0;
  logDetailsFetched: boolean = false;
  form: any;

  constructor(private location: Location, private http: Http, private httpClient: HttpClient,
    private mbpdataService: MbpdataService, private router: Router,
    private userdetails: UserdetailsService, private keyworddetails: KeywordsService,
    private route: ActivatedRoute, private titleService: Title,
    private spinnerService: NgxSpinnerService, private viewdetails: ViewdetailsService) { };

  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtFetchlogDetails: any = [];
  dtTrigger: Subject<any> = new Subject();

  model = new MainForm("", "", "frmMain", "","", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", [""], "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","","","","","","","","","","");

  submitAttempt: boolean;
  user: any;
  isAdmin: boolean;
  isReadOnly: boolean;
  userLoggedIn: string;
  isLoading: boolean = true;    //main-form is read-only before keywords are retrieved completely
  isReviewer: boolean = false;
  isSubmitter: boolean = false;
  profiledoc = [];

  rtReviewNotifAttachFiles: FileList;
  rtUniverseAttachFiles: FileList;
  rtKickoffAttachFiles: FileList;
  rtCloseoutAttachFiles: FileList;
  rtInitialFindingsAttachFiles: FileList;
  rtFinalFindingsAttachFiles: FileList;
  rtFSheetAttachFiles: FileList;
  rtBPCRBAttachFiles: FileList;
  rtEscalationLetterAttachFiles: FileList;
  rtRecoveryAttachFiles: FileList;
  rtSalesReviewAttachFiles: FileList;
  rtFailure2RespondAttachFiles: FileList;
  rtMiscAttachFiles: FileList;
  rtTerminationEmailsAttachFiles: FileList;
  rtOtherattachmentsAttachFiles: FileList;
  filesArraycheck=[];
  attachmentList: any;
  dbRevID: any;
  hasAttachments: boolean = false;
  canDeleteFiles: string = "No";

  ngOnInit() {
    this.spinnerService.show();   //loading-spinner started before all the elements are loaded
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.userdetails.getUserdetails().subscribe(
      data => {
        this.user = JSON.parse(data["_body"]);
      },
      error => console.error(error),
      () => {
        this.route.params.subscribe(
          params => {
            this.id = params['id'];
            if (this.id) {
              this.mbpdataService.setViewPath("");
              let idParams = new URLSearchParams();
              idParams.append("id", this.id);
              this.viewdetails.getDocbyid(idParams).subscribe(
                data => {
                  this.mbpdataService.setMbpData(JSON.parse(data["_body"]));
                },
                error => console.error(error),
                () => {
                  this.keyworddetails.getretrieveProfile().subscribe(
                    data => this.keyworddetails.setretrieveProfile(JSON.parse(data["_body"])["data"]),
                    error => console.error(error),
                    () => {
                      this.keyworddetails.getFixedkeywords().subscribe(
                        data => this.keyworddetails.setFixedkeywords(JSON.parse(data["_body"])["data"]),
                        error => console.error(error),
                        () => this.router.navigate(['/mainform'])
                      )
                    }
                  )
                }
              )
            } else {
              this.profiledoc = this.keyworddetails.retrieveProfile;
              this.model.Appurl = this.profiledoc[0]['appBaseURL'];
              this.model.principalname = this.profiledoc[0]['principalName'];

              this.countries = this.keyworddetails.countryMasterValues;
              for (var i = 0; i < this.countries.length; i++) {
                this.countrynames.push((this.countries[i].txCountryKeywd));
              }
              if (this.countrynames.indexOf(this.model.txCountry) == -1) {
                this.countrynames.push(this.model.txCountry);
              } 

              this.keywords = this.keyworddetails.Fixedkeywords;
              this.mainchannel = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwChannel" }), 'txFXKeyList')).split(";");
              this.Status = String(_.result(_.find(this.keywords, { "txFXKeyword":"txtStatus"}), 'txFXKeyList')).split(";");

              var logno = this.model.txtLogNo.toUpperCase();
              this.getReviewers(logno);

              this.user = this.user._json;
              this.userLoggedIn = this.user.emailAddress;

              var bGroups = this.user.blueGroups;
              var arrGrps = environment.bGroup_admin.split(",");

              if (arrGrps.some(function (element) { return (bGroups.indexOf(element) != -1) })) {
                this.isAdmin = true;
              } else {
                this.isAdmin = false;
              }

              var txtAssistAnalystArr = [];
              if(Array.isArray(this.model.txtAssistAnalyst)){
              txtAssistAnalystArr=this.model.txtAssistAnalyst;
              }
              else{
                    txtAssistAnalystArr = _.toString(this.model.txtAssistAnalyst).split(",")
              }

              //access control for editing the record and deleteling attachments
              if ((this.model._id == "") ||
                (this.model.DocCreator == this.userLoggedIn) ||
                (this.model.txtLAName == this.userLoggedIn) ||
                (_.indexOf(txtAssistAnalystArr, this.userLoggedIn) != -1) ||
                (this.model.dlgLogApprovers == this.userLoggedIn) ||
                (arrGrps.some(function (element) { return (bGroups.indexOf(element) != -1) }))
              ) {
                this.isReadOnly = false;
                this.canDeleteFiles = "Yes";
              } else {
                this.isReadOnly = true;
                this.canDeleteFiles = "No";
              }

              if(this.model.Form === "fDeletedDocumentRDL"){
                this.isReadOnly = true;
              }
              if(this.model.lock_status=="1"){
                this.canDeleteFiles = "No";
              }
              //access control for approve/reject actions
              if ((this.model.dlgLogApprovers == this.userLoggedIn) ||
                (arrGrps.some(function (element) { return (bGroups.indexOf(element) != -1) }))
              ) {
                this.isReviewer = true;
              } else {
                this.isReviewer = false;
              }

              if ((this.model.txtLAName == this.userLoggedIn) ||
                 (_.indexOf(txtAssistAnalystArr, this.userLoggedIn) != -1) ||
                (this.model.DocCreator == this.userLoggedIn) ||
                (this.model.signature == this.userLoggedIn) ||
                (arrGrps.some(function (element) { return (bGroups.indexOf(element) != -1) }))
              ) {
                this.isSubmitter = true;
              } else {
                this.isSubmitter = false;
              }

              let attch_params = new URLSearchParams();
              let headers = new Headers();
              attch_params.append("id", this.model._id);
              attch_params.append("form", "frmMain");
              let attach_options = new RequestOptions({ params: attch_params, headers: headers });
              let deleteFiles: string = this.canDeleteFiles;
              this.http.get('/api/getAttachedFileListFromDB2',attach_options).subscribe(
                data => this.attachmentList = JSON.parse(data["_body"]),
                error => console.error(error),
                () => {
                  _.forEach(this.attachmentList, function (row) {
                    let fileName = decodeURIComponent(row.FILENAME.replace("%", "%25"));
                    let fileID = row.FILE_ID;
                    let fieldId = fileName.split("_")[0];
                    let fileId: string = fileName.replace(/[)(]\s+/g, '');
                    if(_.startsWith(fileName,'rtOther'))
                      $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmMain_Other/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmMain_Other\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
                    else
                      $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmMain/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmMain\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
    
                  })

                  this.isLoading = false;   //main-form becomes editable after the keywords are retrieved completely
                  this.spinnerService.hide();   //loading-spinner stopped after all the elements are loaded
                }
              );
            }
          },
          error => console.error("Error while subscribing to URL params - " + error), 
          () => { }
        )
        this.spinnerService.show(); 
      }
    )

    let mbpModel: any = this.mbpdataService.getMbpData();
    if (mbpModel) {
      this.model = mbpModel;
    }
    addAffix("#panelhead-affix");
    if(this.model.txtLogNo != ""){
      this.titleService.setTitle("RDL:" + " " + this.model.txtLogNo)
    } else {
      this.titleService.setTitle("RDL")
    }
  }

  // To fetch Log number
  fetchlogDetails() {
    if (this.model.txtLogNo !== '') {
      this.spinnerService.show();
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let params = new URLSearchParams();
      params.append("logno", this.model.txtLogNo.toUpperCase());
      let options = new RequestOptions({ headers: headers, params: params });
      this.http.get('/api/log_results', options).subscribe(
        data => {
          if(data["_body"] !== "") {
            this.doc = JSON.parse(data["_body"]);
            this.hasLogNum = true;
          }
        },
        error => console.error(error),
        () => {
          if (this.hasLogNum == false) {
            alert("No record found with the given log number in BPC database!!!");
          } else {
            this.updatelogno(this.doc);
            this.hasLogNum = false;
          }
          this.spinnerService.hide();
        }
      );
    } else {
      alert('Please enter the log number!!!');
    }
  }
  
  //update Log Number method to update the fields
  updatelogno(data: any) {
    this.model.txtCPN = data.txtCurprimname;
    this.model.txtLAName = data.kwStaffMember;
    this.model.txtRvwType = data.kwInvestType;
    this.model.txtRvwMethod = data.kwMethodReview;
    this.model.dtOrgDate = data.dtOrigDate;
    this.model.txtAssistAnalyst = data.nmAddEditor;
    this.model.txCountry = data.txCountry;
    this.model.txGrowthMarket = data.txGrowthMarket;
    this.model.txMajorMarket = data.txMajorMarket
    this.model.txGeo = data.txGeo


    // take the latest date for BPCRB date
    if(data.dtACRBDts != "") {
      var vBPCRB = _.split(data.dtACRBDts, ",");
      vBPCRB = vBPCRB.sort();
      vBPCRB = vBPCRB.reverse();
      this.model.dtACRBDate = appendZeroToDate(_.toString(getMonth(vBPCRB[0]) + 1)) + "/" + appendZeroToDate(_.toString(getDate(vBPCRB[0]))) + "/" + _.toString(getYear(vBPCRB[0]));
    } else {
      this.model.dtACRBDate = "";
    }

    if (data.kwSource == "OTH - Other") {
      this.model.txtSrcAllegation = data.kwSource + "-" + data.txSourceExplain
    } else {
      this.model.txtSrcAllegation = data.kwSource
    }
    this.logDetailsFetched=true;
  }
  // to update IOT and IMT
  updateIMTIOT() {
    this.model.txGrowthMarket= _.result(_.find(this.countries, {'txCountryKeywd': this.model.txCountry}), 'txGrowthKeywd');
    this.model.txMajorMarket= _.result(_.find(this.countries, {'txCountryKeywd': this.model.txCountry}), 'txMajorKeywd');
    
    if (typeof this.model.txGrowthMarket=='undefined'){
    this.model.txGrowthMarket=""
    }
    if (typeof this.model.txMajorMarket=='undefined'){
    this.model.txMajorMarket=""
    } 
    
    } 
  //peer-review results navigate
  OpenPeerreviews() {
    this.mbpdataService.setMbpData(this.model);
    this.model.docid = this.model._id;
    this.model._id = "";
    this.router.navigate(['/peerreviewresults/create']);
  }

  //check if the log num is unique and then save
  uniquelog(actionTaken: string,form) {
    if (this.model.txtLogNo !== '') {
      this.spinnerService.show();
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let params = new URLSearchParams();
      params.append("logno", this.model.txtLogNo.toUpperCase());
      let options = new RequestOptions({ headers: headers, params: params });
      this.http.get('/api/uniquelog', options).subscribe(
        data => {
          this.doc = JSON.parse(data["_body"]);
        },
        error => console.error(error),
        () => {
          if ((this.doc.length > 0) && (this.model._id === "")) {
            alert("Log number already exists in main form. Please modify!!!");
            this.spinnerService.hide();
            return;
          }else if(this.model.txtStatusNew == "Closed"){
            this.spinnerService.show();
            this.submitValidationCheck(actionTaken,form);
          } else{
            this.actionMessage = "Data is saved successfully!!!";
            this.saveForAllActions(actionTaken,form);
          }
        }
      );
    } else {
      alert('Please enter the log number!!!')
    }
  }
    
  //Checking Validation before closing
  submitValidationCheck(actionTaken,form) {
    if (this.model.dtACRBDate == "") {
      alert('Please make sure that BPCRB Date is filled (By fetching log details from WW BPC Ops)before Closed');   
     this.spinnerService.hide(); 
    }  
    else{  
       this.spinnerService.show();
      this.AttachmentsOrCommentsAdded();
      let headers1 = new Headers();
      let idParams = new URLSearchParams();
      idParams.append("id", this.model._id);
      idParams.append("isvalid", this.model.isvalid);
      headers1.append('Content-Type', 'application/json');
      let options = new RequestOptions({ headers: headers1, params: idParams });
      let validationMsg = "";
      this.http.get('/api/getAllChildrenForSubmitReviewCheck', options).subscribe(
        data => {
          console.log("data part inside validation",JSON.parse(data["_body"]));
        validationMsg = JSON.parse(data["_body"]);
      },
        error => console.error(error),
        () => {
         
          if (validationMsg.indexOf('Main document') != -1 || validationMsg.indexOf('Allegation') != -1 ||
          validationMsg.indexOf('CHW Transaction') != -1 || validationMsg.indexOf('ITS/MTS/TSS Transaction') != -1 ||
          validationMsg.indexOf('SW Transaction') != -1 || validationMsg.indexOf('CFMBGF Transaction')!= -1) {
          alert(validationMsg);
          this.spinnerService.hide();
        
          
          } else{
           
            this.model.lock_status ='1';
            alert("Record is Locked and cannot be edited further. Please contact the administrator for unlocking the Document");
            this.actionMessage = "Record is closed"; 
            this.saveForAllActions('Closed',form);
            
          }  
        }
      )
   }
}

  //approve Button
  approve(): boolean {
    this.model.txtStatus = "Approved";
    this.model.sigtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
    this.model.signature = this.user.emailAddress;

    this.mailto = this.model.signature;
    this.mailcc = this.model.txtLAName;
    this.subdoc1 = this.model.txtLogNo;
    this.subdoc2 = this.model.txtCPN;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('/api/sendmail', this.model, options).subscribe(
      data => { },
      error => console.error(error),
      () => { }
    )

    this.actionMessage = "Approved the record successfully!!!";
    return true;
  }

  //reject Button
  reject(): boolean {
    if (this.model.txtComments == "") {
      alert("Please enter the rejection comments to proceed.");
      return false;
    } else {
      this.model.txtStatus = "Rejected";
      this.model.sigtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
      this.model.signature = this.user.emailAddress;
      this.model.lock_status = '0';
      this.model.rejectFlag = "0";
      
      this.mailto = this.model.signature;
      this.mailcc = this.model.txtLAName;
      this.subdoc1 = this.model.txtLogNo;
      this.subdoc2 = this.model.txtCPN;

      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post('/api/rejectmail', this.model, options).subscribe(
        data => { },
        error => console.error(error),
        () => { }
      )

      this.actionMessage = "The record has been rejected!!!";
      return true;
    }
  }

  //re-review button
  rereview(): boolean {
    if (this.model.txtStatus == "Approved") {
      this.model.txtStatus = "Sent for Re-review";
    }
    this.model.sigtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
    this.model.signature = this.user.emailAddress;
    this.model.lock_status = '0';

    this.mailto = this.model.signature;
    this.mailcc = this.model.txtLAName;
    this.subdoc1 = this.model.txtLogNo;
    this.subdoc2 = this.model.txtCPN;
   
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('/api/rerevmail', this.model, options).subscribe(
      data => { },
      error => console.error(error),
      () => { }
    )

    this.actionMessage = "Submitted the record for Re-review.";
    return true;
  }

  UpdateStatus(){
    this.statuschange = true;
     this.model.txtStatus = this.model.txtStatusNew;
     this.model.sigtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
     this.model.signature = this.user.emailAddress;
     this.model.DocCreator = this.user.emailAddress;
    
  }

  saveForAllActions(actionTaken: string,form) {
    this.spinnerService.show();

    let params = new URLSearchParams();
    params.append("id", this.model._id);

    // set a flag if every row entry either has an attachment or a comment
    //this.AttachmentsOrCommentsAdded();

    this.viewdetails.getDocbyid(params).subscribe(
      data => {
        if (this.model._id != "") {
          this.dbRevID = JSON.parse(data["_body"])._rev;
        }
      },
      error => console.error(error),
      () => {
        if (this.dbRevID != this.model._rev && this.model._id != "") {
          alert('There is an updated version of this record. Please use it to make changes.');
          this.spinnerService.hide();
        } else if (this.hasFileSizeExceeded()) {
          if (this.isAdmin){
          alert("Please make sure that the size of the file(s) attached is less than 50Mb.");
          } else {
            alert("Please make sure that the size of the file(s) attached is less than 30Mb.");
          }
          this.spinnerService.hide();
        } else {

          this.submitAttempt = true;
          this.AttachmentsOrCommentsAdded();

          if (this.model._id == '') {
            this.model.txtStatus = "Created";
            this.model.sigtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
            this.model.signature = this.user.emailAddress;
            this.model.DocCreator = this.user.emailAddress;
            this.model.SaveFlag = "Yes";
            delete this.model._id;
            delete this.model._rev;
          }

        

          if (actionTaken == "Save" || actionTaken === "saveNclose" ||   
            (actionTaken == "Closed") ||
            (actionTaken == "approve" && this.approve() == true) ||
            (actionTaken == "reject" && this.reject() == true) ||
            (actionTaken == "rereview" && this.rereview() == true)
          ) {
            this.updateAuditTrail(actionTaken);    //update the audit trail for any action taken

            this.updateAuditTrailAttachments();

            this.setgeovalue();

            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            //params.append("json", JSON.stringify(this.model));
            let options = new RequestOptions({ headers: headers});
            this.http.post('/api/insertmainform',this.model, options).subscribe(
              data => {
                this.revSaved = JSON.parse(data["_body"]).rev;
                this.idSaved = JSON.parse(data["_body"]).id;
                this.model._id = (String)(this.idSaved);
                this.model._rev = (String)(this.revSaved);

                //insert the attachment only if it is added in the record
                if ((this.rtReviewNotifAttachFiles && this.rtReviewNotifAttachFiles.length != 0) ||
                  (this.rtUniverseAttachFiles && this.rtUniverseAttachFiles.length != 0) ||
                  (this.rtKickoffAttachFiles && this.rtKickoffAttachFiles.length != 0) ||
                  (this.rtCloseoutAttachFiles && this.rtCloseoutAttachFiles.length != 0) ||
                  (this.rtInitialFindingsAttachFiles && this.rtInitialFindingsAttachFiles.length != 0) ||
                  (this.rtFinalFindingsAttachFiles && this.rtFinalFindingsAttachFiles.length != 0) ||
                  (this.rtFSheetAttachFiles && this.rtFSheetAttachFiles.length != 0) ||
                  (this.rtBPCRBAttachFiles && this.rtBPCRBAttachFiles.length != 0) ||
                  (this.rtEscalationLetterAttachFiles && this.rtEscalationLetterAttachFiles.length != 0) ||
                  (this.rtRecoveryAttachFiles && this.rtRecoveryAttachFiles.length != 0) ||
                  (this.rtSalesReviewAttachFiles && this.rtSalesReviewAttachFiles.length != 0) ||
                  (this.rtFailure2RespondAttachFiles && this.rtFailure2RespondAttachFiles.length != 0) ||
                  (this.rtMiscAttachFiles && this.rtMiscAttachFiles.length != 0) ||
                  (this.rtTerminationEmailsAttachFiles && this.rtTerminationEmailsAttachFiles.length != 0)) {
                  let res: any = JSON.parse(data["_body"]);
                  let formData: FormData = new FormData();
                  this.hasAttachments = true;

                  this.filesToFormData(this.rtReviewNotifAttachFiles, "txtReviewNotif", formData);
                  this.filesToFormData(this.rtUniverseAttachFiles, "rtUniverse", formData);
                  this.filesToFormData(this.rtKickoffAttachFiles, "rtKickoff", formData);
                  this.filesToFormData(this.rtCloseoutAttachFiles, "rtCloseout", formData);
                  this.filesToFormData(this.rtInitialFindingsAttachFiles, "rtInitialFindings", formData);
                  this.filesToFormData(this.rtFinalFindingsAttachFiles, "rtFinalFindings", formData);
                  this.filesToFormData(this.rtFSheetAttachFiles, "rtFSheet", formData);
                  this.filesToFormData(this.rtBPCRBAttachFiles, "rtBPCRB", formData);
                  this.filesToFormData(this.rtEscalationLetterAttachFiles, "rtEscalationLetter", formData);
                  this.filesToFormData(this.rtRecoveryAttachFiles, "rtRecovery", formData);
                  this.filesToFormData(this.rtSalesReviewAttachFiles, "rtSalesReview", formData);
                  this.filesToFormData(this.rtFailure2RespondAttachFiles, "rtFailure2Respond", formData);
                  this.filesToFormData(this.rtMiscAttachFiles, "rtMisc", formData);
                  this.filesToFormData(this.rtTerminationEmailsAttachFiles, "rtTerminationEmails", formData);
                  this.uploadFiles('api/attachReview', formData, res.id, res.rev, actionTaken);
                } else {
                  this.hasAttachments = false;
                }
              },
              error => console.error(error),
              () => {
                this.makeAllFormControlsPristine(form);
                this.filesArraycheck=[]; 
                this.logDetailsFetched=false;
                
                if (this.hasAttachments == false) {
                  console.log('Data saved without attachments');
                  this.updatechildren(actionTaken);
                }
              }
            );
          } else {
            this.spinnerService.hide();
          }
        }
      }
    )
  }

   setgeovalue(){
    if(this.model.txGeo == "" || this.model.txtLogNo.toUpperCase().includes("RT")){
      if(this.model.txtLogNo.toUpperCase().includes("AM") || this.model.txtLogNo.toUpperCase().includes("LA")){
        this.model.txGeo = "AM"
      } else  if(this.model.txtLogNo.toUpperCase().includes("AP") || this.model.txtLogNo.toUpperCase().includes("J")){
        this.model.txGeo = "AP"
      } else  if(this.model.txtLogNo.toUpperCase().includes("EMEA")){
        this.model.txGeo = "EMEA"
      } 
    }
  }

  filesToFormData(files: FileList, suffix: string, formData: FormData) {
    if (files) {
      for (var i = 0; i < files.length; i++) {
        let file: File = files[i];
        formData.append("uploadFile", file, suffix + "_" + file.name);
      }
    }
  }

  makeAllFormControlsPristine(group:FormGroup):void{
    {
       Object.keys(group.controls).forEach((key)=>{
          group.controls[key].markAsPristine();
    });
  }
   
  }

  fileListToArray(fileList: FileList) {
    if (fileList) {
      return Array.prototype.slice.call(fileList);
    } else {
      return [];
    }
  }

  uploadOtherFile(){
    if(this.rtOtherattachmentsAttachFiles && this.rtOtherattachmentsAttachFiles.length != 0){ 
    if(this.model._id != ""){ 
    this.spinnerService.show();
    let formData: FormData = new FormData();
    this.filesToFormData(this.rtOtherattachmentsAttachFiles, "rtOther", formData);
    formData.append("id", this.model._id);
    formData.append("rev", this.model._rev);
    formData.append("form", "frmMain_Other");

    this.sign = this.userLoggedIn;
    this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
    
    let params = new HttpParams();
    const options = {
      params: params,
      reportProgress: true
    };

    this.http.post('/api/attachOtherFilesToDB2', formData, options).subscribe(
      data => {
        this.getAttachmentNames(this.rtOtherattachmentsAttachFiles, "rtOther");
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
 
        let options = new RequestOptions({ headers: headers});
        this.http.post('/api/insertmainform',this.model, options).subscribe(
          data => {
            this.revSaved = JSON.parse(data["_body"]).rev;
            this.idSaved = JSON.parse(data["_body"]).id;
            this.model._id = (String)(this.idSaved);
            this.model._rev = (String)(this.revSaved);
          }, error => console.error(error),
          () => {
        alert("Data is saved successfully!!! If you have attached large or multiple files, please come back and verify after a few minutes.")
          })
        },
          error => {
        console.error("Other File Attachment upload error: ", error);
        alert('Other File Attachment upload error: ' + error);
        this.spinnerService.hide();
      },
      () => {
        
          //reset all file inputs to empty

          $("#txtReviewNotifFile").empty();
          this.fileInput1.nativeElement.value = "";
  
          $("#rtUniverseFile").empty();
          this.fileInput2.nativeElement.value = "";
  
          $("#rtKickoffFile").empty();
          this.fileInput3.nativeElement.value = "";
  
          $("#rtCloseoutFile").empty();
          this.fileInput4.nativeElement.value = "";
  
          $("#rtInitialFindingsFile").empty();
          this.fileInput5.nativeElement.value = "";
  
          $("#rtFinalFindingsFile").empty();
          this.fileInput6.nativeElement.value = "";
  
          $("#rtFSheetFile").empty();
          this.fileInput7.nativeElement.value = "";
  
          $("#rtBPCRBFile").empty();
          this.fileInput8.nativeElement.value = "";
  
          $("#rtEscalationLetterFile").empty();
          this.fileInput9.nativeElement.value = "";
  
          $("#rtRecoveryFile").empty();
          this.fileInput10.nativeElement.value = "";
  
          $("#rtSalesReviewFile").empty();
          this.fileInput11.nativeElement.value = "";
  
          $("#rtFailure2RespondFile").empty();
          this.fileInput12.nativeElement.value = "";
  
          $("#rtMiscFile").empty();
          this.fileInput13.nativeElement.value = "";
  
          $("#rtTerminationEmailsFile").empty();
          this.fileInput14.nativeElement.value = "";

          $("#rtOtherFile").empty();
          if (this.isAdmin) {    
            this.fileInput15.nativeElement.value = "";
          }
  
          //reset size values to zero
          this.sizeFiles1 = 0;
          this.sizeFiles2 = 0;
          this.sizeFiles3 = 0;
          this.sizeFiles4 = 0;
          this.sizeFiles5 = 0;
          this.sizeFiles6 = 0;
          this.sizeFiles7 = 0;
          this.sizeFiles8 = 0;
          this.sizeFiles9 = 0;
          this.sizeFiles10 = 0;
          this.sizeFiles11 = 0;
          this.sizeFiles12 = 0;
          this.sizeFiles13 = 0;
          this.sizeFiles14 = 0;
          this.sizeFiles15 = 0;

          // reset the Filelist to null after successfully uploading the attahcments
          this.rtReviewNotifAttachFiles = null;
          this.rtUniverseAttachFiles = null;
          this.rtKickoffAttachFiles = null;
          this.rtCloseoutAttachFiles = null;
          this.rtInitialFindingsAttachFiles = null;
          this.rtFinalFindingsAttachFiles = null;
          this.rtFSheetAttachFiles = null;
          this.rtBPCRBAttachFiles = null;
          this.rtEscalationLetterAttachFiles = null;
          this.rtRecoveryAttachFiles = null;
          this.rtSalesReviewAttachFiles = null;
          this.rtFailure2RespondAttachFiles = null;
          this.rtMiscAttachFiles = null;
          this.rtTerminationEmailsAttachFiles = null;
          this.rtOtherattachmentsAttachFiles = null;
          this.filesArraycheck=[]; 
          
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let attch_params = new URLSearchParams();
        attch_params.append("id", this.model._id);
        attch_params.append("form", "frmMain_Other");
        let attach_options = new RequestOptions({ params: attch_params, headers: headers });
        let deleteFiles: string = this.canDeleteFiles;
        this.http.get('/api/getAttachedFileListFromDB2',attach_options).subscribe(
          data => this.attachmentList = JSON.parse(data["_body"]),
          error => {
            console.error(error);
            alert('Error while retrieving uploaded attachments: ' + error);
            this.spinnerService.hide();
          },
          () => {
            _.forEach(this.attachmentList, function (row) {
              let fileName = decodeURIComponent(row.FILENAME.replace("%", "%25"));
              let fileID = row.FILE_ID;
              let fieldId = fileName.split("_")[0];
              let fileId: string = fileName.replace(/[)(]\s+/g, '');
              if(_.startsWith(fileName,'rtOther'))
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmMain_Other/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmMain_Other\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
              else
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmMain/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmMain\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
            });
            this.spinnerService.hide();
          }
        );
      });
    }
    else{
      alert("Please save the document before clicking Upload button")
    }
    }
    else{
      alert("Please attach documents to upload!!!")
    }
  }

  uploadFiles(url: string, formData: FormData, id: string, rev: string, actionTaken: any) {
    formData.append("id", id);
    formData.append("rev", rev);
    formData.append("form", "frmMain");
    let params = new HttpParams();
    const options = {
      params: params,
      reportProgress: true
    };

    this.http.post('/api/attachFilesToDB2', formData, options).subscribe(
      data => { },
      error => {
        console.error("Attachment upload error: ", error);
        alert('Attachment upload error: ' + error);
        this.spinnerService.hide();
      },
      () => {
        console.log('Attachments successfully uploaded!!!');

        //reset all file inputs to empty

        $("#txtReviewNotifFile").empty();
        this.fileInput1.nativeElement.value = "";

        $("#rtUniverseFile").empty();
        this.fileInput2.nativeElement.value = "";

        $("#rtKickoffFile").empty();
        this.fileInput3.nativeElement.value = "";

        $("#rtCloseoutFile").empty();
        this.fileInput4.nativeElement.value = "";

        $("#rtInitialFindingsFile").empty();
        this.fileInput5.nativeElement.value = "";

        $("#rtFinalFindingsFile").empty();
        this.fileInput6.nativeElement.value = "";

        $("#rtFSheetFile").empty();
        this.fileInput7.nativeElement.value = "";

        $("#rtBPCRBFile").empty();
        this.fileInput8.nativeElement.value = "";

        $("#rtEscalationLetterFile").empty();
        this.fileInput9.nativeElement.value = "";

        $("#rtRecoveryFile").empty();
        this.fileInput10.nativeElement.value = "";

        $("#rtSalesReviewFile").empty();
        this.fileInput11.nativeElement.value = "";

        $("#rtFailure2RespondFile").empty();
        this.fileInput12.nativeElement.value = "";

        $("#rtMiscFile").empty();
        this.fileInput13.nativeElement.value = "";

        $("#rtTerminationEmailsFile").empty();
        this.fileInput14.nativeElement.value = "";

        $("#rtOtherFile").empty();
        if (this.isAdmin) {    
          this.fileInput15.nativeElement.value = "";
        }

        //reset size values to zero
        this.sizeFiles1 = 0;
        this.sizeFiles2 = 0;
        this.sizeFiles3 = 0;
        this.sizeFiles4 = 0;
        this.sizeFiles5 = 0;
        this.sizeFiles6 = 0;
        this.sizeFiles7 = 0;
        this.sizeFiles8 = 0;
        this.sizeFiles9 = 0;
        this.sizeFiles10 = 0;
        this.sizeFiles11 = 0;
        this.sizeFiles12 = 0;
        this.sizeFiles13 = 0;
        this.sizeFiles14 = 0;
        this.sizeFiles15 = 0;

        // reset the Filelist to null after successfully uploading the attahcments
        this.rtReviewNotifAttachFiles = null;
        this.rtUniverseAttachFiles = null;
        this.rtKickoffAttachFiles = null;
        this.rtCloseoutAttachFiles = null;
        this.rtInitialFindingsAttachFiles = null;
        this.rtFinalFindingsAttachFiles = null;
        this.rtFSheetAttachFiles = null;
        this.rtBPCRBAttachFiles = null;
        this.rtEscalationLetterAttachFiles = null;
        this.rtRecoveryAttachFiles = null;
        this.rtSalesReviewAttachFiles = null;
        this.rtFailure2RespondAttachFiles = null;
        this.rtMiscAttachFiles = null;
        this.rtTerminationEmailsAttachFiles = null;
        this.rtOtherattachmentsAttachFiles = null;

        // get attachment list
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let attch_params = new URLSearchParams();
        attch_params.append("id", this.model._id);
        attch_params.append("form", "frmMain");
        let attach_options = new RequestOptions({ params: attch_params, headers: headers });
        let deleteFiles: string = this.canDeleteFiles;
        this.http.get('/api/getAttachedFileListFromDB2',attach_options).subscribe(
          data => this.attachmentList = JSON.parse(data["_body"]),
          error => {
            console.error(error);
            alert('Error while retrieving uploaded attachments: ' + error);
            this.spinnerService.hide();
          },
          () => {
            _.forEach(this.attachmentList, function (row) {
              let fileName = decodeURIComponent(row.FILENAME.replace("%", "%25"));
              let fileID = row.FILE_ID;
              let fieldId = fileName.split("_")[0];
              let fileId: string = fileName.replace(/[)(]\s+/g, '');
              if(_.startsWith(fileName,'rtOther'))
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmMain_Other/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmMain_Other\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
              else
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmMain/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmMain\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
            })

            this.updatechildren(actionTaken);
          }
        );
      }
    )
  }

  hasFileSizeExceeded(): boolean {
    let hasExceeded: boolean = false;

    // Limit total size to 30Mb
    if (this.sizeFiles1 + this.sizeFiles2 + this.sizeFiles3 + this.sizeFiles4 +
      this.sizeFiles5 + this.sizeFiles6 + this.sizeFiles7 + this.sizeFiles8 +
      this.sizeFiles9 + this.sizeFiles10 + this.sizeFiles11 + this.sizeFiles12 +
      this.sizeFiles13 + this.sizeFiles14 > 0) {

      //reset file input fileds to empty value
      this.fileInput1.nativeElement.value = "";
      this.fileInput2.nativeElement.value = "";
      this.fileInput3.nativeElement.value = "";
      this.fileInput4.nativeElement.value = "";
      this.fileInput5.nativeElement.value = "";
      this.fileInput6.nativeElement.value = "";
      this.fileInput7.nativeElement.value = "";
      this.fileInput8.nativeElement.value = "";
      this.fileInput9.nativeElement.value = "";
      this.fileInput10.nativeElement.value = "";
      this.fileInput11.nativeElement.value = "";
      this.fileInput12.nativeElement.value = "";
      this.fileInput13.nativeElement.value = "";
      this.fileInput14.nativeElement.value = "";

      //reset size values to zero
      this.sizeFiles1 = 0;
      this.sizeFiles2 = 0;
      this.sizeFiles3 = 0;
      this.sizeFiles4 = 0;
      this.sizeFiles5 = 0;
      this.sizeFiles6 = 0;
      this.sizeFiles7 = 0;
      this.sizeFiles8 = 0;
      this.sizeFiles9 = 0;
      this.sizeFiles10 = 0;
      this.sizeFiles11 = 0;
      this.sizeFiles12 = 0;
      this.sizeFiles13 = 0;
      this.sizeFiles14 = 0;

      // reset the Filelist to null after successfully uploading the attahcments
      this.rtReviewNotifAttachFiles = null;
      this.rtUniverseAttachFiles = null;
      this.rtKickoffAttachFiles = null;
      this.rtCloseoutAttachFiles = null;
      this.rtInitialFindingsAttachFiles = null;
      this.rtFinalFindingsAttachFiles = null;
      this.rtFSheetAttachFiles = null;
      this.rtBPCRBAttachFiles = null;
      this.rtEscalationLetterAttachFiles = null;
      this.rtRecoveryAttachFiles = null;
      this.rtSalesReviewAttachFiles = null;
      this.rtFailure2RespondAttachFiles = null;
      this.rtMiscAttachFiles = null;
      this.rtTerminationEmailsAttachFiles = null;

      hasExceeded = true;
    } else {
      hasExceeded = false;
    }
    return hasExceeded;
  }

  //alerting users not to use Apostrophe and Hash in the file names
  invalidAttachmentName(fileName: string): Boolean {
    if (_.includes(fileName, "'")|| _.includes(fileName, "#" )) {
      return true;
    } else {
      return false;
    }
  }

  filescheckfunc(event,whichfile){
    if(event.target.files.length>0){
      this.filesArraycheck.push(whichfile);
    } else{
      this.filesArraycheck=this.filesArraycheck.filter((node)=>{ return node!=whichfile})
    }
    return this.filesArraycheck
  }

  getrtReviewNotifAttachFiles(event, whichfile) {
    this.sizeFiles1 = 0;
    this.rtReviewNotifAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput1.nativeElement.value = "";
       this.sizeFiles1 = 0;
       this.rtReviewNotifAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles1 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles1 = 1;
        }
      }
    }
  }

  getrtUniverseAttachFiles(event, whichfile) {
    this.sizeFiles2 = 0;
    this.rtUniverseAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput2.nativeElement.value = "";
       this.sizeFiles2 = 0;
       this.rtUniverseAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles2 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles2 = 1;
        }
      }
    }
  }

  getrtKickoffAttachFiles(event, whichfile) {
    this.sizeFiles3 = 0;
    this.rtKickoffAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput3.nativeElement.value = "";
       this.sizeFiles3 = 0;
       this.rtKickoffAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles3 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles3 = 1;
        }
      }
    }
  }

  getrtCloseoutAttachFiles(event, whichfile) {
    this.sizeFiles4 = 0;
    this.rtCloseoutAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput4.nativeElement.value = "";
       this.sizeFiles4 = 0;
       this.rtCloseoutAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles4 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles4 = 1;
        }
      }
    }
  }

  getrtInitialFindingsAttachFiles(event, whichfile) {
    this.sizeFiles5 = 0;
    this.rtInitialFindingsAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput5.nativeElement.value = "";
       this.sizeFiles5 = 0;
       this.rtInitialFindingsAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles5 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles5 = 1;
        }
      }
    }
  }

  getrtFinalFindingsAttachFiles(event, whichfile) {
    this.sizeFiles6 = 0;
    this.rtFinalFindingsAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput6.nativeElement.value = "";
       this.sizeFiles6 = 0;
       this.rtFinalFindingsAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles6 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles6 = 1;
        }
      }
    }
  }

  getrtFSheetAttachFiles(event, whichfile) {
    this.sizeFiles7 = 0;
    this.rtFSheetAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput7.nativeElement.value = "";
       this.sizeFiles7 = 0;
       this.rtFSheetAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles7 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles7 = 1;
        }
      }
    }
  }

  getrtBPCRBAttachFiles(event, whichfile) {
    this.sizeFiles8 = 0;
    this.rtBPCRBAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput8.nativeElement.value = "";
       this.sizeFiles8 = 0;
       this.rtBPCRBAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles8 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles8 = 1;
        }
      }
    }
  }

  getrtEscalationLetterAttachFiles(event, whichfile) {
    this.sizeFiles9 = 0;
    this.rtEscalationLetterAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput9.nativeElement.value = "";
       this.sizeFiles9 = 0;
       this.rtEscalationLetterAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles9 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles9 = 1;
        }
      }
    }
  }

  getrtRecoveryAttachFiles(event, whichfile) {
    this.sizeFiles10 = 0;
    this.rtRecoveryAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput10.nativeElement.value = "";
       this.sizeFiles10 = 0;
       this.rtRecoveryAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles10 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles10 = 1;
        }
      }
    }
  }

  getrtSalesReviewAttachFiles(event, whichfile) {
    this.sizeFiles11 = 0;
    this.rtSalesReviewAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput11.nativeElement.value = "";
       this.sizeFiles11 = 0;
       this.rtSalesReviewAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles11 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles11 = 1;
        }
      }
    }
  }

  getrtFailure2RespondAttachFiles(event, whichfile) {
    this.sizeFiles12 = 0;
    this.rtFailure2RespondAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput12.nativeElement.value = "";
       this.sizeFiles12 = 0;
       this.rtFailure2RespondAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles12 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles12 = 1;
        }
      }
    }
  }

  getrtMiscAttachFiles(event, whichfile) {
    this.sizeFiles13 = 0;
    this.rtMiscAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput13.nativeElement.value = "";
       this.sizeFiles13 = 0;
       this.rtMiscAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles13 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles13 = 1;
        }
      }
    }
  }

  getrtTerminationEmailsAttachFiles(event, whichfile) {
    this.sizeFiles14 = 0;
    this.rtTerminationEmailsAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput14.nativeElement.value = "";
       this.sizeFiles14 = 0;
       this.rtTerminationEmailsAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles14 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles14 = 1;
        }
      }
    }
  }

  getrtOtherattachmentsAttachFiles(event, whichfile) {
    this.sizeFiles15 = 0;
    this.rtOtherattachmentsAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput15.nativeElement.value = "";
       this.sizeFiles15 = 0;
       this.rtOtherattachmentsAttachFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb for non-admin users
      if (!this.isAdmin) {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles15 = 1;
        }
      }
    }
  }
  
  //Confirmation for close check
  confirmClose(form) {
    if(this.model.lock_status=='1'){
      this.close();
    } else if(this.filesArraycheck.length>0 || this.logDetailsFetched || form.dirty){
      (<any>$('#closeConfirmation')).modal('show');
    } else {
      this.close();
    }
  }

  //close button
  close() {
    let vPath = this.mbpdataService.getViewPath();
    this.router.navigate([vPath]);
  }

  //delete button
  deleteMainForm() {
    this.submitAttempt = true;
    this.model.OldForm = this.model.Form;
    this.model.Form = "fDeletedDocumentRDL";
    this.model.dtmodified = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");   
    this.model.DeletedBy = this.user.firstName.replace(/%20/g, " ") + " " + this.user.lastName.replace(/%20/g, " ");
    this.model.DeletedOn = format(new Date(), "YYYY-MM-DD h:mm A");
    this.curdt = format(new Date(), "MM/DD/YYYY h:mm A Z");

    if(!this.model.txtMainAudit){
      this.model.txtMainAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record "  + "\n";
     }else{
      this.model.txtMainAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record " + "\n" + this.model.txtMainAudit;
     }

    if (this.model._id === "") {
      delete this.model._id;
      delete this.model._rev;
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let params = new URLSearchParams();
    params.append("json", JSON.stringify(this.model));
    let options = new RequestOptions({ headers: headers });
    this.http.post('/api/deleteMain', this.model, options).subscribe(
      data => { },
      error => console.error(error),
      () => {
        alert('Deleted the record successfully!!!');
        this.location.back();
      }
    );
  }

  //Audit Trail
  updateAuditTrail(actionTaken: string) {  
    if (this.model._id && this.model._id != "") {
      this.model.dtmodified = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    }
    else{
    this.model.dtcreated = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    }
    this.strAudit = this.model.txtMainAudit;
    if(this.strAudit == ""){
      this.statusCurrent = "Created"
    }
     else if(this.statuschange){
      this.statusCurrent = this.model.txtStatus;
      this.statuschange = false;
    }
    else{
      this.statusCurrent = "modified by";
    }
    this.sign = this.userLoggedIn;
    this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
    this.model.txtMainAudit = this.statusCurrent + " by " + this.sign + " on " + this.curtimestamp + "\n" + this.strAudit;
  }

  updateAuditTrailAttachments(){
    //insert the attachment only if it is added in the record
    if ((this.rtReviewNotifAttachFiles && this.rtReviewNotifAttachFiles.length != 0) ||
    (this.rtUniverseAttachFiles && this.rtUniverseAttachFiles.length != 0) ||
    (this.rtKickoffAttachFiles && this.rtKickoffAttachFiles.length != 0) ||
    (this.rtCloseoutAttachFiles && this.rtCloseoutAttachFiles.length != 0) ||
    (this.rtInitialFindingsAttachFiles && this.rtInitialFindingsAttachFiles.length != 0) ||
    (this.rtFinalFindingsAttachFiles && this.rtFinalFindingsAttachFiles.length != 0) ||
    (this.rtFSheetAttachFiles && this.rtFSheetAttachFiles.length != 0) ||
    (this.rtBPCRBAttachFiles && this.rtBPCRBAttachFiles.length != 0) ||
    (this.rtEscalationLetterAttachFiles && this.rtEscalationLetterAttachFiles.length != 0) ||
    (this.rtRecoveryAttachFiles && this.rtRecoveryAttachFiles.length != 0) ||
    (this.rtSalesReviewAttachFiles && this.rtSalesReviewAttachFiles.length != 0) ||
    (this.rtFailure2RespondAttachFiles && this.rtFailure2RespondAttachFiles.length != 0) ||
    (this.rtMiscAttachFiles && this.rtMiscAttachFiles.length != 0) ||
    (this.rtTerminationEmailsAttachFiles && this.rtTerminationEmailsAttachFiles.length != 0)) {

      this.getAttachmentNames(this.rtReviewNotifAttachFiles, "txtReviewNotif");
      this.getAttachmentNames(this.rtUniverseAttachFiles, "rtUniverse");
      this.getAttachmentNames(this.rtKickoffAttachFiles, "rtKickoff");
      this.getAttachmentNames(this.rtCloseoutAttachFiles, "rtCloseout");
      this.getAttachmentNames(this.rtInitialFindingsAttachFiles, "rtInitialFindings");
      this.getAttachmentNames(this.rtFinalFindingsAttachFiles, "rtFinalFindings");
      this.getAttachmentNames(this.rtFSheetAttachFiles, "rtFSheet");
      this.getAttachmentNames(this.rtBPCRBAttachFiles, "rtBPCRB");
      this.getAttachmentNames(this.rtEscalationLetterAttachFiles, "rtEscalationLetter");
      this.getAttachmentNames(this.rtRecoveryAttachFiles, "rtRecovery");
      this.getAttachmentNames(this.rtSalesReviewAttachFiles, "rtSalesReview");
      this.getAttachmentNames(this.rtFailure2RespondAttachFiles, "rtFailure2Respond");
      this.getAttachmentNames(this.rtMiscAttachFiles, "rtMisc");
      this.getAttachmentNames(this.rtTerminationEmailsAttachFiles, "rtTerminationEmails");
    }
  }

  getAttachmentNames(files: FileList, suffix: string) {
    if (files) {
      let fileNamesAttached = [];
      for (var i = 0; i < files.length; i++) {
        let file: File = files[i];
        fileNamesAttached.push(suffix + "_" +file.name)
      }
      // update audit trail
      this.model.txtMainAudit =  this.curtimestamp + ": " + this.sign + " : Uploaded files --> " + fileNamesAttached.join(", ") + "\n" + this.model.txtMainAudit;
    }
  }
  
  storeMBPData() {
    this.spinnerService.show();
    this.mbpdataService.setMbpData(this.model);
    this.model.docid = this.model._id;
    this.model._id = "";
  }

  Lockdoc() {
    this.spinnerService.show();
    this.model.lock_status = '1';
    this.model.dtmodified=format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let params = new URLSearchParams();
    //params.append("json", JSON.stringify(this.model));
    let options = new RequestOptions({ headers: headers});
    this.http.post('/api/insertmainform',this.model, options).subscribe(
      data => {
        this.revSaved = JSON.parse(data["_body"]).rev;
        this.idSaved = JSON.parse(data["_body"]).id;
        this.model._id = (String)(this.idSaved);
        this.model._rev = (String)(this.revSaved);
      }, error => console.error(error),
      () => {
        this.actionMessage = "You have successfully locked the main and the child records.";
        this.updatechildren('lock');
      }
    );
  }

  Unlockdoc() {
    this.spinnerService.show();
    this.model.lock_status = '0';
    this.model.dtmodified=format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");   
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let params = new URLSearchParams();
    //params.append("json", JSON.stringify(this.model));
    let options = new RequestOptions({ headers: headers});
    this.http.post('/api/insertmainform',this.model, options).subscribe(
      data => {
        this.revSaved = JSON.parse(data["_body"]).rev;
        this.idSaved = JSON.parse(data["_body"]).id;
        this.model._id = (String)(this.idSaved);
        this.model._rev = (String)(this.revSaved);
      }, error => console.error(error),
      () => {
        this.actionMessage = "You have successfully unlocked the main and the child records.";
        this.updatechildren('unlock');
      }
    );
  }

  updatechildren(action: string) {   
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('/api/getAllChildren', this.model, options).subscribe(
      data => {
        this.revSaved = JSON.parse(data["_body"]).rev;
        this.idSaved = JSON.parse(data["_body"]).id;
        if (action == 'lock' || action == 'unlock') {
          this.model._id = (String)(this.idSaved);
          this.model._rev = (String)(this.revSaved);
        }
      },
      error => console.error(error),
      () => {
        if (action != "Save") {
          this.close();
        }
        let attStr: string = "If you have attached large or multiple files, please come back and verify after a few minutes.";
        alert(this.actionMessage + " " + attStr);
        this.spinnerService.hide();
      }
    )    
  }

  AttachmentsOrCommentsAdded() {
    this.spinnerService.show();
    let miscfield=$('#txtMisc').val();
    if (this.mbpdataService.validateAttachmentAndComments(this.rtReviewNotifAttachFiles, this.model.txtReviewNotif, '#txtReviewNotifFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtUniverseAttachFiles, this.model.txtUniverse, '#rtUniverseFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtKickoffAttachFiles, this.model.txtKickoff, '#rtKickoffFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtCloseoutAttachFiles, this.model.txtCloseout, '#rtCloseoutFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtInitialFindingsAttachFiles, this.model.txtInitialFindings, '#rtInitialFindingsFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtFinalFindingsAttachFiles, this.model.txtFinalFindings, '#rtFinalFindingsFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtFSheetAttachFiles, this.model.txtFSheet, '#rtFSheetFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtBPCRBAttachFiles, this.model.txtBPCRB, '#rtBPCRBFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtEscalationLetterAttachFiles, this.model.txtEscalationLetter, '#rtEscalationLetterFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtRecoveryAttachFiles, this.model.txtRecovery, '#rtRecoveryFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtSalesReviewAttachFiles, this.model.txtSalesReview, '#rtSalesReviewFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtFailure2RespondAttachFiles, this.model.txtFailure2Respond, '#rtFailure2RespondFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtMiscAttachFiles, this.model.txtMisc, '#rtMiscFile') ||
      this.mbpdataService.validateAttachmentAndComments(this.rtTerminationEmailsAttachFiles, this.model.txtTerminationEmails, '#rtTerminationEmailsFile')
    ) {
      this.model.isvalid = "N";
    } else {
      this.model.isvalid = "Y";
    }
  }

  copyDocLink() {
    let selBox = document.createElement('textarea');
    var index = this.keywords.findIndex(function (item, i) { return item.txFXKeyword === "appurl" });
    var applurl = this.keywords[index].txFXKeyList;
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = applurl + "mainform/" + this.model._id;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert(" Record URL is copied to clipboard.");
  }
  
  //email validation
  emailValidation(input: any, fieldID: string) {
    var pattern = /@([A-Z])+\.IBM.COM$/;
    var emailIDarr = [];
    var correctedEmailArr = [];

    emailIDarr = input.split(',');
    correctedEmailArr = emailIDarr;
    let errMsg: string = "";

    for (let i: number = 0; i < emailIDarr.length; i++) {
      let individualID: string = emailIDarr[i].trim().toUpperCase();
      let res: boolean = pattern.test(individualID);
      if (!res) {
        correctedEmailArr.splice(i, 1, null);
        errMsg = "Please enter only IBM email ID(s)."
      }
    }
    if (errMsg != "") {
      alert(errMsg);
    }
        //trim and get the unique value of the array
        correctedEmailArr = correctedEmailArr.filter(function (n) { return n != undefined });
        correctedEmailArr = Array.from(new Set(correctedEmailArr));
    
        //set the value of the field with the corrected list
        $('#' + fieldID).val(correctedEmailArr.join(','));
    
  }
 
  // getReviewers(logno: string) {
  //   logno = logno.toUpperCase();
  //   this.model.txtLogNo = logno;
  //   if (logno.indexOf('AM') >= 0) {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyList')).split(";");
  //   } else if (logno.indexOf('AP') >= 0 && (this.model.txGrowthMarket)=='GCG IOT' || (this.model.txMajorMarket) == 'GCG IOT') {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListGCG')).split(";");
  //   } else if (logno.indexOf('AP') >= 0) {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListAP')).split(";");
  //   }
  //    else if (logno.indexOf('EMEA') >= 0) {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListEMEA')).split(";");
  //   } else if (logno.indexOf('LA') >= 0) {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListLA')).split(";");
  //   } else if (logno.indexOf('JP') >= 0) {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListJP')).split(";");
  //   } else if (logno.indexOf('GCG') >= 0) {
  //     this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListGCG')).split(";");
  //   } else {
  //     this.mainlogapp = [];
  //   }
  // }

  getReviewers(logno: string) {
    logno = logno.toUpperCase();
    this.model.txtLogNo = logno;
    if (logno.indexOf('AM') >= 0) {
    this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyList')).split(";");
    } else if (logno.indexOf('AP') >= 0) {
    this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListAP')).split(";");
    } else if (logno.indexOf('EMEA') >= 0) {
    this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListEMEA')).split(";");
    } else if (logno.indexOf('LA') >= 0) {
    this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListLA')).split(";");
    } else if (logno.indexOf('JP') >= 0) {
    this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListJP')).split(";");
    } else if (logno.indexOf('GCG') >= 0) {
      this.mainlogapp = String(_.result(_.find(this.keywords, { "txFXKeyword": "kwLogApprovers" }), 'txFXKeyListGCG')).split(";");
      } else {
    this.mainlogapp = [];
    }
    }
}

function appendZeroToDate(val) {
  if(val < 10) {
    return '0' + val;
  } else {
    return val;
  }
}

