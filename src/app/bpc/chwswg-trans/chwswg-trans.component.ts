import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CHWSWGForm } from "./chwswg-trans.model";
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { MbpdataService } from "../service/mbpdata.service"
import * as _ from "lodash";
import { format } from "date-fns";
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserdetailsService } from '../service/userdetails.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient, HttpParams, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { ViewdetailsService } from '../service/viewdetails.service';
import {KeywordsService} from '../service/keywords.service';
import {FormGroup} from '@angular/forms'
import { Title } from '@angular/platform-browser';

declare function addAffix(id: any)

@Component({
  selector: 'app-chwswg-trans',
  templateUrl: './chwswg-trans.component.html',
  styleUrls: ['./chwswg-trans.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChwswgTransComponent implements OnInit {

  keywords = [];
  private id: string;

  constructor(private location: Location, private http: Http, private httpClient: HttpClient,
    private route: ActivatedRoute, private mbpdataService: MbpdataService,
    private router: Router, private userdetails: UserdetailsService,
    private keyworddetails: KeywordsService, private titleService: Title,
    private spinnerService: NgxSpinnerService, private viewdetails: ViewdetailsService) { };
  
    model = new CHWSWGForm("", "", "TransDoc", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", [""], "", "", "", "","","","","","","");

  submitAttempt: boolean;
  user: any;
  task: string;
  sub: any;
  updatestr: string;
  strAudit: string;
  statusCurrent: string;
  sign: string;
  finlog: string;
  revSaved: String;
  idSaved: String;
  isReadOnly: boolean;
  userLoggedIn: string;
  isLoading: boolean = true;    //chwswg-trans is read-only before fields are retrieved completely
  curtimestamp: string;

  //attatchment code variables
  rtXSRWorksheetFiles: FileList;
  rtXibminvoicesFiles: FileList;
  rtIBMSBFiles: FileList;
  rtIBMEUInvoiceFiles: FileList;
  rtDistInvoiceFiles: FileList;
  rtLeaseFiles: FileList;
  rtPONumberFiles: FileList;
  rtQuoteFiles: FileList;
  rtConfigFiles: FileList;
  rtSoWFiles: FileList;
  rtEUSurveyFiles: FileList;
  rtProposalFiles: FileList;
  rtFtFFiles: FileList;
  rtBVMFiles: FileList;
  rtLicenseAgreementsFiles: FileList;
  rtEmailsFiles: FileList;
  rtXactionWSFiles: FileList;
  rtDistSBFiles: FileList;
  rtTDASARFiles: FileList;
  rtserverinvoicesFiles: FileList;
  rtRecoveryDocFiles: FileList;
  rtOptionsInvoiceFiles: FileList;
  rtOtherDocFiles: FileList;
  attachmentList: any;
  dbRevID: any;
  hasAttachments: boolean = false;
  canDeleteFiles: string = "No";
  filesArraycheck=[];
  parentdoc = [];
  curdt: string;
  isAdmin: boolean;

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
  @ViewChild('fileInput16') fileInput16: any;
  @ViewChild('fileInput17') fileInput17: any;
  @ViewChild('fileInput18') fileInput18: any;
  @ViewChild('fileInput19') fileInput19: any;
  @ViewChild('fileInput20') fileInput20: any;
  @ViewChild('fileInput21') fileInput21: any;
  @ViewChild('fileInput22') fileInput22: any;
  @ViewChild('fileInput23') fileInput23: any;

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
  sizeFiles16: number = 0;
  sizeFiles17: number = 0;
  sizeFiles18: number = 0;
  sizeFiles19: number = 0;
  sizeFiles20: number = 0;
  sizeFiles21: number = 0;
  sizeFiles22: number = 0;
  sizeFiles23: number = 0;

  ngOnInit() {
    this.spinnerService.show();   //loading-spinner started before all the elements are loaded

    this.sub = this.route.params.subscribe(params => {
      this.task = params['task'];

      this.userdetails.getUserdetails().subscribe(
        data => this.user = JSON.parse(data["_body"]),
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
                          () => this.router.navigate(['/chwswgtrans/select'])
                        )
                      }
                    )
                  }
                )
              } else {
                this.keywords = this.keyworddetails.Fixedkeywords;
                this.user = this.user._json;
                this.userLoggedIn = this.user.emailAddress;

                var bGroups = this.user.blueGroups;
                var arrGrps = environment.bGroup_admin.split(",");

                if (arrGrps.some(function (element) { return (bGroups.indexOf(element) != -1) })) {
                  this.isAdmin = true;
                } else {
                  this.isAdmin = false;
                }

          if (this.task === "create") {
            let mbpModel: any = this.mbpdataService.getMbpData();
            if (mbpModel) {
              if (this.model._id == "") {
                this.model.txtLogNo = mbpModel.txtLogNo;
                this.model.txtChannel = mbpModel.txtChannel;
                this.model.txtRvwType = mbpModel.txtRvwType;
                this.model.txtRvwMethod = mbpModel.txtRvwMethod;
                this.model.txtTransactionNum = mbpModel.txtTransactionNum;
                this.model.txtEnduserTr = mbpModel.txtEnduserTr;

                this.model.txtLAName = mbpModel.txtLAName;
                this.model.txtAssistAnalyst = mbpModel.txtAssistAnalyst;
                this.model.dlgLogApprovers = mbpModel.dlgLogApprovers;

                this.model.dtACRBDate = mbpModel.dtACRBDate;
                this.model.txtCPN = mbpModel.txtCPN;
                this.model.txCountry = mbpModel.txCountry;
                this.model.txGrowthMarket = mbpModel.txGrowthMarket;
                this.model.txMajorMarket = mbpModel.txMajorMarket;
                this.model.txGeo = mbpModel.txGeo
              }
            }

            if (this.model.$REF === "") {
              this.model.$REF = mbpModel.docid;
            }

            var txtAssistAnalystArr = [];
            if (Array.isArray(this.model.txtAssistAnalyst)) {
              txtAssistAnalystArr = this.model.txtAssistAnalyst;
            }
            else {
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

            this.isLoading = false;   //allegation-results becomes editable after the fields are retrieved completely
            this.spinnerService.hide();   //loading-spinner stopped after all the elements are loaded
          } else {
            let mbpModel: any = this.mbpdataService.getMbpData();
            this.model = mbpModel;
            this.titleService.setTitle("RDL:" + " " + this.model.txtLogNo)
            //access control for editing the record and deleteling attachments
            var txtAssistAnalystArr = [];
            if (Array.isArray(this.model.txtAssistAnalyst)) {
              txtAssistAnalystArr = this.model.txtAssistAnalyst;
            }
            else {
              txtAssistAnalystArr = _.toString(this.model.txtAssistAnalyst).split(",")
            }

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
            if (this.model.lock_status == "1") {
              this.canDeleteFiles = "No";
            }
            let attch_params = new URLSearchParams();
            let headers = new Headers();
            attch_params.append("id", this.model._id);
            attch_params.append("form", "TransDoc");
            let attach_options = new RequestOptions({ params: attch_params, headers: headers });
            let deleteFiles: string = this.canDeleteFiles;
            this.http.get('/api/getAttachedFileListFromDB2', attach_options).subscribe(
              data => this.attachmentList = JSON.parse(data["_body"]),
              error => console.error(error),
              () => {
                _.forEach(this.attachmentList, function (row) {
                  let fileName = decodeURIComponent(row.FILENAME.replace("%", "%25"));
                  let fileID = row.FILE_ID;
                  let fieldId = fileName.split("_")[0];
                  let fileId: string = fileName.replace(/[)(]\s+/g, '');
                  $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/TransDoc/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"TransDoc\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
                })

                this.isLoading = false;   //chwswg-trans becomes editable after the fields are retrieved completely
                this.spinnerService.hide();   //loading-spinner stopped after all the elements are loaded
              }
            );
          }
              }
            },
            error => console.error("Error while subscribing to URL params - " + error),
            () => { }
          )
        }
      )

    })
    addAffix("#panelhead-affix");
  }

  // Save data
  save(actionTaken: string,form) {
    this.spinnerService.show();

    let params = new URLSearchParams();
    params.append("id", this.model._id);

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

          if (this.model._id == "") {
            this.model.DocCreator = this.user.emailAddress;
            this.model.txtStatus = "Created";
            this.model.signature = this.user.emailAddress;
            this.model.sigtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
          }
          this.updateAuditTrail();

          this.updateAuditTrailAttachments();

          if (this.model._id === "") {
            delete this.model._id;
            delete this.model._rev;
          }

          let headers = new Headers();
          headers.append('Content-Type', 'application/json');
          //params.append("json", JSON.stringify(this.model));
          let options = new RequestOptions({ headers: headers});
          this.http.post('/api/insertchwswgform',this.model, options).subscribe(
            data => {
              this.revSaved = JSON.parse(data["_body"]).rev;
              this.idSaved = JSON.parse(data["_body"]).id;
              this.model._id = (String)(this.idSaved);
              this.model._rev = (String)(this.revSaved);

              //insert the attachment only if it is added in the record
              if ((this.rtXSRWorksheetFiles && this.rtXSRWorksheetFiles.length != 0) ||
                (this.rtXibminvoicesFiles && this.rtXibminvoicesFiles.length != 0) ||
                (this.rtIBMSBFiles && this.rtIBMSBFiles.length != 0) ||
                (this.rtIBMEUInvoiceFiles && this.rtIBMEUInvoiceFiles.length != 0) ||
                (this.rtDistInvoiceFiles && this.rtDistInvoiceFiles.length != 0) ||
                (this.rtLeaseFiles && this.rtLeaseFiles.length != 0) ||
                (this.rtPONumberFiles && this.rtPONumberFiles.length != 0) ||
                (this.rtQuoteFiles && this.rtQuoteFiles.length != 0) ||
                (this.rtConfigFiles && this.rtConfigFiles.length != 0) ||
                (this.rtSoWFiles && this.rtSoWFiles.length != 0) ||
                (this.rtEUSurveyFiles && this.rtEUSurveyFiles.length != 0) ||
                (this.rtProposalFiles && this.rtProposalFiles.length != 0) ||
                (this.rtFtFFiles && this.rtFtFFiles.length != 0) ||
                (this.rtBVMFiles && this.rtBVMFiles.length != 0) ||
                (this.rtLicenseAgreementsFiles && this.rtLicenseAgreementsFiles.length != 0) ||
                (this.rtEmailsFiles && this.rtEmailsFiles.length != 0) ||
                (this.rtXactionWSFiles && this.rtXactionWSFiles.length != 0) ||
                (this.rtDistSBFiles && this.rtDistSBFiles.length != 0) ||
                (this.rtTDASARFiles && this.rtTDASARFiles.length != 0) ||
                (this.rtserverinvoicesFiles && this.rtserverinvoicesFiles.length != 0) ||
                (this.rtRecoveryDocFiles && this.rtRecoveryDocFiles.length != 0) ||
                (this.rtOptionsInvoiceFiles && this.rtOptionsInvoiceFiles.length != 0) ||
                (this.rtOtherDocFiles && this.rtOtherDocFiles.length != 0)
              ) {
                let res: any = JSON.parse(data["_body"]);
                let formData: FormData = new FormData();
                this.hasAttachments = true;

                this.filesToFormData(this.rtXSRWorksheetFiles, "rtXSRWorksheet", formData);
                this.filesToFormData(this.rtXibminvoicesFiles, "rtXibminvoices", formData);
                this.filesToFormData(this.rtIBMSBFiles, "rtIBMSB", formData);
                this.filesToFormData(this.rtIBMEUInvoiceFiles, "rtIBMEUInvoice", formData);
                this.filesToFormData(this.rtDistInvoiceFiles, "rtDistInvoice", formData);
                this.filesToFormData(this.rtLeaseFiles, "rtLease", formData);
                this.filesToFormData(this.rtPONumberFiles, "rtPONumber", formData);
                this.filesToFormData(this.rtQuoteFiles, "rtQuote", formData);
                this.filesToFormData(this.rtConfigFiles, "rtConfig", formData);
                this.filesToFormData(this.rtSoWFiles, "rtSoW", formData);
                this.filesToFormData(this.rtEUSurveyFiles, "rtEUSurvey", formData);
                this.filesToFormData(this.rtProposalFiles, "rtProposal", formData);
                this.filesToFormData(this.rtFtFFiles, "rtFtF", formData);
                this.filesToFormData(this.rtBVMFiles, "rtBVM", formData);
                this.filesToFormData(this.rtLicenseAgreementsFiles, "rtLicenseAgreements", formData);
                this.filesToFormData(this.rtEmailsFiles, "rtEmails", formData);
                this.filesToFormData(this.rtXactionWSFiles, "rtXactionWS", formData);
                this.filesToFormData(this.rtDistSBFiles, "rtDistSB", formData);
                this.filesToFormData(this.rtTDASARFiles, "rtTDASAR", formData);
                this.filesToFormData(this.rtserverinvoicesFiles, "rtserverinvoices", formData);
                this.filesToFormData(this.rtRecoveryDocFiles, "rtRecoveryDoc", formData);
                this.filesToFormData(this.rtOptionsInvoiceFiles, "rtOptionsInvoice", formData);
                this.filesToFormData(this.rtOtherDocFiles, "rtOtherDoc", formData);
                this.uploadFiles('api/attachReview', formData, res.id, res.rev, actionTaken);
              } else {
                this.hasAttachments = false;
              }
            }, error => console.error(error),
            () => {
              this.makeAllFormControlsPristine(form);
              this.filesArraycheck=[]; 
              if (this.hasAttachments == false) {
                this.spinnerService.hide();
                console.log('Data saved without attachments');
                alert("Data is saved successfully!!!");
                if(actionTaken == 'saveNclose') {
                  this.close();
                }
              }
            }
          );
        }
      }
    )
  }

  filesToFormData(files: FileList, suffix: string, formData: FormData) {
    if (files) {
      for (var i = 0; i < files.length; i++) {
        let file: File = files[i];
        formData.append("uploadFile", file, suffix + "_" + file.name);
      }
    }
  }

  fileListToArray(fileList: FileList) {
    if (fileList) {
      return Array.prototype.slice.call(fileList);
    } else {
      return [];
    }
  }

  uploadFiles(url: string, formData: FormData, id: string, rev: string, actionTaken: any) {
    formData.append("id", id);
    formData.append("rev", rev);
    formData.append("form", "TransDoc");
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

        $("#rtXSRWorksheetFile").empty();
        this.fileInput1.nativeElement.value = "";

        $("#rtXibminvoicesFile").empty();
        this.fileInput2.nativeElement.value = "";

        $("#rtIBMSBFile").empty();
        this.fileInput3.nativeElement.value = "";

        $("#rtIBMEUInvoiceFile").empty();
        this.fileInput4.nativeElement.value = "";

        $("#rtDistInvoiceFile").empty();
        this.fileInput5.nativeElement.value = "";

        $("#rtLeaseFile").empty();
        this.fileInput6.nativeElement.value = "";

        $("#rtPONumberFile").empty();
        this.fileInput7.nativeElement.value = "";

        $("#rtQuoteFile").empty();
        this.fileInput8.nativeElement.value = "";

        $("#rtConfigFile").empty();
        this.fileInput9.nativeElement.value = "";

        $("#rtSoWFile").empty();
        this.fileInput10.nativeElement.value = "";

        $("#rtEUSurveyFile").empty();
        this.fileInput11.nativeElement.value = "";

        $("#rtProposalFile").empty();
        this.fileInput12.nativeElement.value = "";

        $("#rtFtFFile").empty();
        this.fileInput13.nativeElement.value = "";

        $("#rtBVMFile").empty();
        this.fileInput14.nativeElement.value = "";

        $("#rtLicenseAgreementsFile").empty();
        this.fileInput15.nativeElement.value = "";

        $("#rtEmailsFile").empty();
        this.fileInput16.nativeElement.value = "";

        $("#rtXactionWSFile").empty();
        this.fileInput17.nativeElement.value = "";

        $("#rtDistSBFile").empty();
        this.fileInput18.nativeElement.value = "";

        $("#rtTDASARFile").empty();
        this.fileInput19.nativeElement.value = "";

        $("#rtserverinvoicesFile").empty();
        this.fileInput20.nativeElement.value = "";

        $("#rtRecoveryDocFile").empty();
        this.fileInput21.nativeElement.value = "";

        $("#rtOptionsInvoiceFile").empty();
        this.fileInput22.nativeElement.value = "";

        $("#rtOtherDocFile").empty();
        this.fileInput23.nativeElement.value = "";

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
        this.sizeFiles16 = 0;
        this.sizeFiles17 = 0;
        this.sizeFiles18 = 0;
        this.sizeFiles19 = 0;
        this.sizeFiles20 = 0;
        this.sizeFiles21 = 0;
        this.sizeFiles22 = 0;
        this.sizeFiles23 = 0;

        // reset the Filelist to null after successfully uploading the attahcments
        this.rtXSRWorksheetFiles = null;
        this.rtXibminvoicesFiles = null;
        this.rtIBMSBFiles = null;
        this.rtIBMEUInvoiceFiles = null;
        this.rtDistInvoiceFiles = null;
        this.rtLeaseFiles = null;
        this.rtPONumberFiles = null;
        this.rtQuoteFiles = null;
        this.rtConfigFiles = null;
        this.rtSoWFiles = null;
        this.rtEUSurveyFiles = null;
        this.rtProposalFiles = null;
        this.rtFtFFiles = null;
        this.rtBVMFiles = null;
        this.rtLicenseAgreementsFiles = null;
        this.rtEmailsFiles = null;
        this.rtXactionWSFiles = null;
        this.rtDistSBFiles = null;
        this.rtTDASARFiles = null;
        this.rtserverinvoicesFiles = null;
        this.rtRecoveryDocFiles = null;
        this.rtOptionsInvoiceFiles = null;
        this.rtOtherDocFiles = null;

        // get attachment list
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let attch_params = new URLSearchParams();
        attch_params.append("id", this.model._id);
        attch_params.append("form", "TransDoc");
        let attach_options = new RequestOptions({ params: attch_params, headers: headers });
        let deleteFiles: string = this.canDeleteFiles;
        this.http.get('/api/getAttachedFileListFromDB2', attach_options).subscribe(
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
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/TransDoc/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"TransDoc\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
            })

            let attStr: string = "If you have attached large or multiple files, please come back and verify after a few minutes.";
            alert("Data is saved successfully!!!" + " " + attStr);
            if(actionTaken == 'saveNclose') {
              this.close();
            }
            this.spinnerService.hide();
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
      this.sizeFiles13 + this.sizeFiles14 + this.sizeFiles15 + this.sizeFiles16 +
      this.sizeFiles17 + this.sizeFiles18 + this.sizeFiles19 + this.sizeFiles20 +
      this.sizeFiles21 + this.sizeFiles22 + this.sizeFiles23 > 0) {

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
      this.fileInput15.nativeElement.value = "";
      this.fileInput16.nativeElement.value = "";
      this.fileInput17.nativeElement.value = "";
      this.fileInput18.nativeElement.value = "";
      this.fileInput19.nativeElement.value = "";
      this.fileInput20.nativeElement.value = "";
      this.fileInput21.nativeElement.value = "";
      this.fileInput22.nativeElement.value = "";
      this.fileInput23.nativeElement.value = "";

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
      this.sizeFiles16 = 0;
      this.sizeFiles17 = 0;
      this.sizeFiles18 = 0;
      this.sizeFiles19 = 0;
      this.sizeFiles20 = 0;
      this.sizeFiles21 = 0;
      this.sizeFiles22 = 0;
      this.sizeFiles23 = 0;

      // reset the Filelist to null after successfully uploading the attahcments
      this.rtXSRWorksheetFiles = null;
      this.rtXibminvoicesFiles = null;
      this.rtIBMSBFiles = null;
      this.rtIBMEUInvoiceFiles = null;
      this.rtDistInvoiceFiles = null;
      this.rtLeaseFiles = null;
      this.rtPONumberFiles = null;
      this.rtQuoteFiles = null;
      this.rtConfigFiles = null;
      this.rtSoWFiles = null;
      this.rtEUSurveyFiles = null;
      this.rtProposalFiles = null;
      this.rtFtFFiles = null;
      this.rtBVMFiles = null;
      this.rtLicenseAgreementsFiles = null;
      this.rtEmailsFiles = null;
      this.rtXactionWSFiles = null;
      this.rtDistSBFiles = null;
      this.rtTDASARFiles = null;
      this.rtserverinvoicesFiles = null;
      this.rtRecoveryDocFiles = null;
      this.rtOptionsInvoiceFiles = null;
      this.rtOtherDocFiles = null;

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



  getrtXSRWorksheetFiles(event,whichfile) {
    this.sizeFiles1 = 0;
    this.rtXSRWorksheetFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput1.nativeElement.value = "";
       this.sizeFiles1 = 0;
       this.rtXSRWorksheetFiles = null;
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

  getrtXibminvoicesFiles(event,whichfile) {
    this.sizeFiles2 = 0;
    this.rtXibminvoicesFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput2.nativeElement.value = "";
       this.sizeFiles2 = 0;
       this.rtXibminvoicesFiles = null;
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

  getrtIBMSBFiles(event,whichfile) {
    this.sizeFiles3 = 0;
    this.rtIBMSBFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput3.nativeElement.value = "";
       this.sizeFiles3 = 0;
       this.rtIBMSBFiles = null;
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

  getrtIBMEUInvoiceFiles(event,whichfile) {
    this.sizeFiles4 = 0;
    this.rtIBMEUInvoiceFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput4.nativeElement.value = "";
       this.sizeFiles4 = 0;
       this.rtIBMEUInvoiceFiles = null;
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

  getrtDistInvoiceFiles(event,whichfile) {
    this.sizeFiles5 = 0;
    this.rtDistInvoiceFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput5.nativeElement.value = "";
       this.sizeFiles5 = 0;
       this.rtDistInvoiceFiles = null;
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

  getrtLeaseFiles(event,whichfile) {
    this.sizeFiles6 = 0;
    this.rtLeaseFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput6.nativeElement.value = "";
       this.sizeFiles6 = 0;
       this.rtLeaseFiles = null;
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

  getrtPONumberFiles(event,whichfile) {
    this.sizeFiles7 = 0;
    this.rtPONumberFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput7.nativeElement.value = "";
       this.sizeFiles7 = 0;
       this.rtPONumberFiles = null;
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

  getrtQuoteFiles(event,whichfile) {
    this.sizeFiles8 = 0;
    this.rtQuoteFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput8.nativeElement.value = "";
       this.sizeFiles8 = 0;
       this.rtQuoteFiles = null;
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

  getrtConfigFiles(event,whichfile) {
    this.sizeFiles9 = 0;
    this.rtConfigFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput9.nativeElement.value = "";
       this.sizeFiles9 = 0;
       this.rtConfigFiles = null;
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

  getrtSoWFiles(event,whichfile) {
    this.sizeFiles10 = 0;
    this.rtSoWFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput10.nativeElement.value = "";
       this.sizeFiles10 = 0;
       this.rtSoWFiles = null;
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

  getrtEUSurveyFiles(event,whichfile) {
    this.sizeFiles11 = 0;
    this.rtEUSurveyFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput11.nativeElement.value = "";
       this.sizeFiles11 = 0;
       this.rtEUSurveyFiles = null;
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

  getrtProposalFiles(event,whichfile) {
    this.sizeFiles12 = 0;
    this.rtProposalFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput12.nativeElement.value = "";
       this.sizeFiles12= 0;
       this.rtProposalFiles = null;
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

  getrtFtFFiles(event,whichfile) {
    this.sizeFiles13 = 0;
    this.rtFtFFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput13.nativeElement.value = "";
       this.sizeFiles13 = 0;
       this.rtFtFFiles = null;
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

  getrtBVMFiles(event,whichfile) {
    this.sizeFiles14 = 0;
    this.rtBVMFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput14.nativeElement.value = "";
       this.sizeFiles14 = 0;
       this.rtBVMFiles = null;
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

  getrtLicenseAgreementsFiles(event,whichfile) {
    this.sizeFiles15 = 0;
    this.rtLicenseAgreementsFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput15.nativeElement.value = "";
       this.sizeFiles15 = 0;
       this.rtLicenseAgreementsFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles15 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles15 = 1;
        }
      }
    }
  }

  getrtEmailsFiles(event,whichfile) {
    this.sizeFiles16 = 0;
    this.rtEmailsFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput16.nativeElement.value = "";
       this.sizeFiles16 = 0;
       this.rtEmailsFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles16 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles16 = 1;
        }
      }
    }
  }

  getrtXactionWSFiles(event,whichfile) {
    this.sizeFiles17 = 0;
    this.rtXactionWSFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput17.nativeElement.value = "";
       this.sizeFiles17 = 0;
       this.rtXactionWSFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles17 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles17 = 1;
        }
      }
    }
  }

  getrtDistSBFiles(event,whichfile) {
    this.sizeFiles18 = 0;
    this.rtDistSBFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput18.nativeElement.value = "";
       this.sizeFiles18 = 0;
       this.rtDistSBFiles = null;
       return;
      }
     // check if the file attached is greater than 30Mb and 50mb
     if (this.isAdmin) {
      if (event.target.files[i].size > 52428800) {
        this.sizeFiles18 = 1;
      }
    } else {
      if (event.target.files[i].size > 31457280) {
        this.sizeFiles18 = 1;
      }
    }
  }
}

  getrtTDASARFiles(event,whichfile) {
    this.sizeFiles19 = 0;
    this.rtTDASARFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput19.nativeElement.value = "";
       this.sizeFiles19 = 0;
       this.rtTDASARFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles19 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles19 = 1;
        }
      }
    }
  }

  getrtserverinvoicesFiles(event,whichfile) {
    this.sizeFiles20 = 0;
    this.rtserverinvoicesFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if(this.invalidAttachmentName(event.target.files[i].name)){
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        //reset the variables name used for attachments
        this.fileInput20.nativeElement.value = "";
        this.sizeFiles20 = 0;
        this.rtserverinvoicesFiles = null;
        return;
      }
     // check if the file attached is greater than 30Mb and 50mb
     if (this.isAdmin) {
      if (event.target.files[i].size > 52428800) {
        this.sizeFiles20 = 1;
      }
    } else {
      if (event.target.files[i].size > 31457280) {
        this.sizeFiles20 = 1;
      }
    }
  }
}

  getrtRecoveryDocFiles(event,whichfile) {
    this.sizeFiles21 = 0;
    this.rtRecoveryDocFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput21.nativeElement.value = "";
       this.sizeFiles21 = 0;
       this.rtRecoveryDocFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles21 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles21 = 1;
        }
      }
    }
  }

  getrtOptionsInvoiceFiles(event,whichfile) {
    this.sizeFiles22 = 0;
    this.rtOptionsInvoiceFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput22.nativeElement.value = "";
       this.sizeFiles22 = 0;
       this.rtOptionsInvoiceFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles22 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles22 = 1;
        }
      }
    }
  }

  getrtOtherDocFiles(event,whichfile) {
    this.sizeFiles23 = 0;
    this.rtOtherDocFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput23.nativeElement.value = "";
       this.sizeFiles23 = 0;
       this.rtOtherDocFiles = null;
       return;
      }
      // check if the file attached is greater than 30Mb and 50mb
      if (this.isAdmin) {
        if (event.target.files[i].size > 52428800) {
          this.sizeFiles23 = 1;
        }
      } else {
        if (event.target.files[i].size > 31457280) {
          this.sizeFiles23 = 1;
        }
      }
    }
  }

  makeAllFormControlsPristine(group:FormGroup):void{
    Object.keys(group.controls).forEach((key)=>{
       group.controls[key].markAsPristine();
 });
}
  
  //Confirmation for close
  confirmClose(form) {
    if(this.model.lock_status=='1'){
      this.close();
    } else if(form.dirty || this.filesArraycheck.length>0){
      (<any>$('#closeConfirmation')).modal('show');
    } else {
      this.close();
    }
    
  }


  close() {
    if (this.task == "create") {
      let params = new URLSearchParams();
      params.append("id", this.model.$REF);
      this.viewdetails.getDocbyid(params).subscribe(data => {
        this.mbpdataService.setMbpData(JSON.parse(data["_body"]));
        this.router.navigate(['/mainform']);
      })
    } else {
      let vPath = this.mbpdataService.getViewPath();
      this.router.navigate([vPath]);
  
    }
  }

  delete() {
    this.submitAttempt = true;
    this.model.OldForm = this.model.Form;
    this.model.Form = "fDeletedDocumentRDL";
    this.model.dtmodified=format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    this.model.DeletedBy = this.user.firstName.replace(/%20/g, " ") + " " + this.user.lastName.replace(/%20/g, " ");
    this.model.DeletedOn = format(new Date(), "YYYY-MM-DD h:mm A");
    this.curdt = format(new Date(), "MM/DD/YYYY h:mm A Z");

    if(!this.model.txtTransAudit){
      this.model.txtTransAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record ";
     }else{
      this.model.txtTransAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record " + "\n" + this.model.txtTransAudit;
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
    this.http.post('/api/deleteChild', this.model, options).subscribe(
      data => { },
      error => console.error(error),
      () => {
        alert('Deleted the record successfully!!!');
        this.location.back();
      }
    );
  }

  refreshMissingInfo(actionTaken, form) {
    let params = new URLSearchParams();
    params.append("id", this.model.txtLogNo);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers, params: params });
    this.http.get('/api/getParentDoc', options).subscribe(
      data => {
        this.parentdoc = JSON.parse(data["_body"])["data"];
        let form = this.parentdoc[0].Form
        if (this.parentdoc[0]) {
          this.model.txtChannel = this.parentdoc[0]['txtChannel']
          this.model.txtLAName = this.parentdoc[0]['txtLAName'];
          this.model.txtAssistAnalyst = this.parentdoc[0]['txtAssistAnalyst'];
          this.model.dlgLogApprovers = this.parentdoc[0]['dlgLogApprovers'];
          this.model.dtACRBDate = this.parentdoc[0]['dtACRBDate'];
          this.model.txtCPN = this.parentdoc[0]['txtCPN']
          this.model.txCountry = this.parentdoc[0]['txCountry']
          this.model.txGrowthMarket = this.parentdoc[0]['txGrowthMarket']
          this.model.txMajorMarket = this.parentdoc[0]['txMajorMarket']
          this.model.txGeo = this.parentdoc[0]['txGeo']
          this.model.$REF = this.parentdoc[0]['_id']
          this.model.lock_status = this.parentdoc[0]['lock_status']
          this.model.signature = this.parentdoc[0]['signature']
          this.model.sigtimestamp = this.parentdoc[0]['sigtimestamp']
          this.model.txtStatus = this.parentdoc[0]['txtStatus']

          alert("Retrieved the information from the Main record..!!!")
        } else {
          alert("Cannot find Main record for this review document!!!")
          return;
        }
      },
      error => console.error(error),
      () => {this.save(actionTaken,form)}
    )
  }
  
  copyDocLink() {
    let selBox = document.createElement('textarea');
    var index = this.keywords.findIndex(function (item, i) { return item.txFXKeyword === "appurl" });
    var applurl = this.keywords[index].txFXKeyList;
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = applurl + "chwswgtransdoc/" + this.model._id;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert(" Record URL is copied to clipboard.");
  }
  

  //Audit Trail
  updateAuditTrail() {
    if (this.model._id == "") {
      this.strAudit = "Created by " + this.userLoggedIn + " on " + this.model.sigtimestamp;
      this.model.txtTransAudit = this.strAudit;
      this.model.dtcreated = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    } else {
      this.finlog = this.model.txtTransAudit;
      this.sign = this.userLoggedIn;
      this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
      this.model.txtTransAudit = "Modified by " + this.sign + " on " + this.curtimestamp + "\n" + this.finlog;
      this.model.dtmodified = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    }
  }

  updateAuditTrailAttachments(){
    //insert the attachment only if it is added in the record
    if ((this.rtXSRWorksheetFiles && this.rtXSRWorksheetFiles.length != 0) ||
    (this.rtXibminvoicesFiles && this.rtXibminvoicesFiles.length != 0) ||
    (this.rtIBMSBFiles && this.rtIBMSBFiles.length != 0) ||
    (this.rtIBMEUInvoiceFiles && this.rtIBMEUInvoiceFiles.length != 0) ||
    (this.rtDistInvoiceFiles && this.rtDistInvoiceFiles.length != 0) ||
    (this.rtLeaseFiles && this.rtLeaseFiles.length != 0) ||
    (this.rtPONumberFiles && this.rtPONumberFiles.length != 0) ||
    (this.rtQuoteFiles && this.rtQuoteFiles.length != 0) ||
    (this.rtConfigFiles && this.rtConfigFiles.length != 0) ||
    (this.rtSoWFiles && this.rtSoWFiles.length != 0) ||
    (this.rtEUSurveyFiles && this.rtEUSurveyFiles.length != 0) ||
    (this.rtProposalFiles && this.rtProposalFiles.length != 0) ||
    (this.rtFtFFiles && this.rtFtFFiles.length != 0) ||
    (this.rtBVMFiles && this.rtBVMFiles.length != 0) ||
    (this.rtLicenseAgreementsFiles && this.rtLicenseAgreementsFiles.length != 0) ||
    (this.rtEmailsFiles && this.rtEmailsFiles.length != 0) ||
    (this.rtXactionWSFiles && this.rtXactionWSFiles.length != 0) ||
    (this.rtDistSBFiles && this.rtDistSBFiles.length != 0) ||
    (this.rtTDASARFiles && this.rtTDASARFiles.length != 0) ||
    (this.rtserverinvoicesFiles && this.rtserverinvoicesFiles.length != 0) ||
    (this.rtRecoveryDocFiles && this.rtRecoveryDocFiles.length != 0) ||
    (this.rtOptionsInvoiceFiles && this.rtOptionsInvoiceFiles.length != 0) ||
    (this.rtOtherDocFiles && this.rtOtherDocFiles.length != 0)
  ) {

    this.getAttachmentNames(this.rtXSRWorksheetFiles, "rtXSRWorksheet");
    this.getAttachmentNames(this.rtXibminvoicesFiles, "rtXibminvoices");
    this.getAttachmentNames(this.rtIBMSBFiles, "rtIBMSB");
    this.getAttachmentNames(this.rtIBMEUInvoiceFiles, "rtIBMEUInvoice");
    this.getAttachmentNames(this.rtDistInvoiceFiles, "rtDistInvoice");
    this.getAttachmentNames(this.rtLeaseFiles, "rtLease");
    this.getAttachmentNames(this.rtPONumberFiles, "rtPONumber");
    this.getAttachmentNames(this.rtQuoteFiles, "rtQuote");
    this.getAttachmentNames(this.rtConfigFiles, "rtConfig");
    this.getAttachmentNames(this.rtSoWFiles, "rtSoW");
    this.getAttachmentNames(this.rtEUSurveyFiles, "rtEUSurvey");
    this.getAttachmentNames(this.rtProposalFiles, "rtProposal");
    this.getAttachmentNames(this.rtFtFFiles, "rtFtF");
    this.getAttachmentNames(this.rtBVMFiles, "rtBVM");
    this.getAttachmentNames(this.rtLicenseAgreementsFiles, "rtLicenseAgreements");
    this.getAttachmentNames(this.rtEmailsFiles, "rtEmails");
    this.getAttachmentNames(this.rtXactionWSFiles, "rtXactionWS");
    this.getAttachmentNames(this.rtDistSBFiles, "rtDistSB");
    this.getAttachmentNames(this.rtTDASARFiles, "rtTDASAR");
    this.getAttachmentNames(this.rtserverinvoicesFiles, "rtserverinvoices");
    this.getAttachmentNames(this.rtRecoveryDocFiles, "rtRecoveryDoc");
    this.getAttachmentNames(this.rtOptionsInvoiceFiles, "rtOptionsInvoice");
    this.getAttachmentNames(this.rtOtherDocFiles, "rtOtherDoc");
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
    this.sign = this.userLoggedIn;
    this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
    this.model.txtTransAudit =  this.curtimestamp + ": " + this.sign + " : Uploaded files --> " + fileNamesAttached.join(", ") + "\n" + this.model.txtTransAudit;
 }     
}   
}


