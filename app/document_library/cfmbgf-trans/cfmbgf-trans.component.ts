import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CFMBGFForm } from "./cfmbgf-trans.model";
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { MbpdataService } from "../service/mbpdata.service"
import * as _ from "lodash";
import { format } from "date-fns";
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms'
import { environment } from '../../../environments/environment';
import { UserdetailsService } from '../service/userdetails.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient, HttpParams, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { ViewdetailsService } from '../service/viewdetails.service';
import { KeywordsService } from '../service/keywords.service'
import { Title } from '@angular/platform-browser';

declare function addAffix(id: any)
@Component({
  selector: 'app-cfmbgf-trans',
  templateUrl: './cfmbgf-trans.component.html',
  styleUrls: ['./cfmbgf-trans.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CfmbgfTransComponent implements OnInit {
  keywords = [];
  MktgEventTypes = [];
  private id: string;
  constructor(private location: Location, private http: Http, private httpClient: HttpClient,
    private route: ActivatedRoute, private mbpdataService: MbpdataService,
    private router: Router, private userdetails: UserdetailsService,
    private keyworddetails: KeywordsService, private titleService: Title,
    private spinnerService: NgxSpinnerService, private viewdetails: ViewdetailsService) { };

  model = new CFMBGFForm("", "", "frmCFMBGF", "", [""], "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","","");

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
  isLoading: boolean = true;    //cfmbgf-trans is read-only before fields are retrieved completely

  //attatchment code variables
  rtCoverSheetAttachFiles: FileList;
  rtVendorVerifAttachFiles: FileList;
  rtMktgVendorInvoiceAttachFiles: FileList;
  rtMktgPlanAttachFiles: FileList;
  rtAttendeeListAttachFiles: FileList;
  rtProofPayAttachFiles: FileList;
  rtSalaryAttachFiles: FileList;
  rtProofEmploymentAttachFiles: FileList;
  rtInelligibleAttachFiles: FileList;
  rtExceptionAttachFiles: FileList;
  rtOtherDocsAttachFiles: FileList;
  attachmentList: any;
  dbRevID: any;
  filesArraycheck = [];
  hasAttachments: boolean = false;
  canDeleteFiles: string = "No";
  curtimestamp: string;
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
                          () => this.router.navigate(['/cfmbgftrans/select'])
                        )
                      }
                    )
                  }
                )
              } else {
                this.keywords = this.keyworddetails.Fixedkeywords;
                this.MktgEventTypes = String(_.result(_.find(this.keywords, { "txFXKeyword": "txMktgEventTypes" }), 'txFXKeyList')).split(";");
                // this.Status = String(_.result(_.find(this.keywords, { "txFXKeyword":"txtStatus"}), 'txFXKeyList')).split(";");
                console.log(this.MktgEventTypes.length,this.MktgEventTypes);
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
                  if(this.model.lock_status=="1"){
                    this.canDeleteFiles = "No";
                  }

                  let attch_params = new URLSearchParams();
                  let headers = new Headers();
                  attch_params.append("id", this.model._id);
                  attch_params.append("form", "frmCFMBGF");
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
                        $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmCFMBGF/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmCFMBGF\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
                      })

                      this.isLoading = false;   //cfmbgf-trans becomes editable after the fields are retrieved completely
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
  save(actionTaken: string, form) {
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
          if (this.isAdmin) {
            alert("Please make sure that the size of the file(s) attached is less than 50Mb.");
          } else {
            alert("Please make sure that the size of the file(s) attached is less than 30Mb.");
          }
          this.spinnerService.hide();
        } else {

          if (this.mbpdataService.validateAttachmentAndComments(this.rtCoverSheetAttachFiles, this.model.txtCoverSheet, '#rtCoverSheetFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtVendorVerifAttachFiles, this.model.txtVendorVerifDoc, '#rtVendorVerifFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtMktgVendorInvoiceAttachFiles, this.model.txtMktgVendorInvoice, '#rtMktgVendorInvoiceFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtMktgPlanAttachFiles, this.model.txtMktgPlan, '#rtMktgPlanFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtAttendeeListAttachFiles, this.model.txtAttendeeList, '#rtAttendeeListFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtProofPayAttachFiles, this.model.txtProofPay, '#rtProofPayFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtSalaryAttachFiles, this.model.txtSalary, '#rtSalaryFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtProofEmploymentAttachFiles, this.model.txtProofEmployment, '#rtProofEmploymentFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtInelligibleAttachFiles, this.model.txtInelligible, '#rtInelligibleFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtExceptionAttachFiles, this.model.txtException, '#rtExceptionFile') ||
            this.mbpdataService.validateAttachmentAndComments(this.rtOtherDocsAttachFiles, this.model.txtOtherDocs, '#rtOtherDocsFile')
          ) {
            this.model.isvalid = "N";
          } else {
            this.model.isvalid = "Y";
          }
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
          let options = new RequestOptions({ headers: headers });
          this.http.post('/api/insertcfmbgfform', this.model, options).subscribe(
            data => {
              this.revSaved = JSON.parse(data["_body"]).rev;
              this.idSaved = JSON.parse(data["_body"]).id;
              this.model._id = (String)(this.idSaved);
              this.model._rev = (String)(this.revSaved);

              //insert the attachment only if it is added in the record
              if ((this.rtCoverSheetAttachFiles && this.rtCoverSheetAttachFiles.length != 0) ||
                (this.rtVendorVerifAttachFiles && this.rtVendorVerifAttachFiles.length != 0) ||
                (this.rtMktgVendorInvoiceAttachFiles && this.rtMktgVendorInvoiceAttachFiles.length != 0) ||
                (this.rtMktgPlanAttachFiles && this.rtMktgPlanAttachFiles.length != 0) ||
                (this.rtAttendeeListAttachFiles && this.rtAttendeeListAttachFiles.length != 0) ||
                (this.rtProofPayAttachFiles && this.rtProofPayAttachFiles.length != 0) ||
                (this.rtSalaryAttachFiles && this.rtSalaryAttachFiles.length != 0) ||
                (this.rtProofEmploymentAttachFiles && this.rtProofEmploymentAttachFiles.length != 0) ||
                (this.rtInelligibleAttachFiles && this.rtInelligibleAttachFiles.length != 0) ||
                (this.rtExceptionAttachFiles && this.rtExceptionAttachFiles.length != 0) ||
                (this.rtOtherDocsAttachFiles && this.rtOtherDocsAttachFiles.length != 0)) {
                let res: any = JSON.parse(data["_body"]);
                let formData: FormData = new FormData();
                this.hasAttachments = true;

                this.filesToFormData(this.rtCoverSheetAttachFiles, "rtCoverSheet", formData);
                this.filesToFormData(this.rtVendorVerifAttachFiles, "rtVendorVerif", formData);
                this.filesToFormData(this.rtMktgVendorInvoiceAttachFiles, "rtMktgVendorInvoice", formData);
                this.filesToFormData(this.rtMktgPlanAttachFiles, "rtMktgPlan", formData);
                this.filesToFormData(this.rtAttendeeListAttachFiles, "rtAttendeeList", formData);
                this.filesToFormData(this.rtProofPayAttachFiles, "rtProofPay", formData);
                this.filesToFormData(this.rtSalaryAttachFiles, "rtSalary", formData);
                this.filesToFormData(this.rtProofEmploymentAttachFiles, "rtProofEmployment", formData);
                this.filesToFormData(this.rtInelligibleAttachFiles, "rtInelligible", formData);
                this.filesToFormData(this.rtExceptionAttachFiles, "rtException", formData);
                this.filesToFormData(this.rtOtherDocsAttachFiles, "rtOtherDocs", formData);
                this.uploadFiles('api/attachReview', formData, res.id, res.rev, actionTaken);
              } else {
                this.hasAttachments = false;
              }
            },
            error => console.error(error),
            () => {
              this.makeAllFormControlsPristine(form);
              this.filesArraycheck = [];
              if (this.hasAttachments == false) {
                this.spinnerService.hide();
                console.log('Data saved without attachments');
                alert("Data is saved successfully!!!");
                if (actionTaken == 'saveNclose') {
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
    formData.append("form", "frmCFMBGF");
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

        $("#rtCoverSheetFile").empty();
        this.fileInput1.nativeElement.value = "";

        $("#rtVendorVerifFile").empty();
        this.fileInput2.nativeElement.value = "";

        $("#rtMktgVendorInvoiceFile").empty();
        this.fileInput3.nativeElement.value = "";

        $("#rtMktgPlanFile").empty();
        this.fileInput4.nativeElement.value = "";

        $("#rtAttendeeListFile").empty();
        this.fileInput5.nativeElement.value = "";

        $("#rtProofPayFile").empty();
        this.fileInput6.nativeElement.value = "";

        $("#rtSalaryFile").empty();
        this.fileInput7.nativeElement.value = "";

        $("#rtProofEmploymentFile").empty();
        this.fileInput8.nativeElement.value = "";

        $("#rtInelligibleFile").empty();
        this.fileInput9.nativeElement.value = "";

        $("#rtExceptionFile").empty();
        this.fileInput10.nativeElement.value = "";

        $("#rtOtherDocsFile").empty();
        this.fileInput11.nativeElement.value = "";

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

        // reset the Filelist to null after successfully uploading the attahcments
        this.rtCoverSheetAttachFiles = null;
        this.rtVendorVerifAttachFiles = null;
        this.rtMktgVendorInvoiceAttachFiles = null;
        this.rtMktgPlanAttachFiles = null;
        this.rtAttendeeListAttachFiles = null;
        this.rtProofPayAttachFiles = null;
        this.rtSalaryAttachFiles = null;
        this.rtProofEmploymentAttachFiles = null;
        this.rtInelligibleAttachFiles = null;
        this.rtExceptionAttachFiles = null;
        this.rtOtherDocsAttachFiles = null;

        // get attachment list
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let attch_params = new URLSearchParams();
        attch_params.append("id", this.model._id);
        attch_params.append("form", "frmCFMBGF");
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
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmCFMBGF/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmCFMBGF\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
            })

            let attStr: string = "If you have attached large or multiple files, please come back and verify after a few minutes.";
            alert("Data is saved successfully!!!" + " " + attStr);
            if (actionTaken == 'saveNclose') {
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
      this.sizeFiles9 + this.sizeFiles10 + this.sizeFiles11 > 0) {

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

      // reset the Filelist to null after successfully uploading the attahcments
      this.rtCoverSheetAttachFiles = null;
      this.rtVendorVerifAttachFiles = null;
      this.rtMktgVendorInvoiceAttachFiles = null;
      this.rtMktgPlanAttachFiles = null;
      this.rtAttendeeListAttachFiles = null;
      this.rtProofPayAttachFiles = null;
      this.rtSalaryAttachFiles = null;
      this.rtProofEmploymentAttachFiles = null;
      this.rtInelligibleAttachFiles = null;
      this.rtExceptionAttachFiles = null;
      this.rtOtherDocsAttachFiles = null;

      hasExceeded = true;
    } else {
      hasExceeded = false;
    }
    return hasExceeded;
  }

  //alerting users not to use Apostrophe and Hash in the file names
  invalidAttachmentName(fileName: string): Boolean {
    if (_.includes(fileName, "'") || _.includes(fileName, "#")) {
      return true;
    } else {
      return false;
    }
  }

  filescheckfunc(event, whichfile) {
    if (event.target.files.length > 0) {
      this.filesArraycheck.push(whichfile);
    } else {
      this.filesArraycheck = this.filesArraycheck.filter((node) => { return node != whichfile })
    }
    return this.filesArraycheck
  }

  getrtCoverSheetAttachFiles(event, whichfile) {
    this.sizeFiles1 = 0;
    this.rtCoverSheetAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput1.nativeElement.value = "";
        this.sizeFiles1 = 0;
        this.rtCoverSheetAttachFiles = null;
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

  getrtVendorVerifAttachFiles(event, whichfile) {
    this.sizeFiles2 = 0;
    this.rtVendorVerifAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput2.nativeElement.value = "";
        this.sizeFiles2 = 0;
        this.rtVendorVerifAttachFiles = null;
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

  getrtMktgVendorInvoiceAttachFiles(event, whichfile) {
    this.sizeFiles3 = 0;
    this.rtMktgVendorInvoiceAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput3.nativeElement.value = "";
        this.sizeFiles3 = 0;
        this.rtMktgVendorInvoiceAttachFiles = null;
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

  getrtMktgPlanAttachFiles(event, whichfile) {
    this.sizeFiles4 = 0;
    this.rtMktgPlanAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput4.nativeElement.value = "";
        this.sizeFiles4 = 0;
        this.rtMktgPlanAttachFiles = null;
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

  getrtAttendeeListAttachFiles(event, whichfile) {
    this.sizeFiles5 = 0;
    this.rtAttendeeListAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput5.nativeElement.value = "";
        this.sizeFiles5 = 0;
        this.rtAttendeeListAttachFiles = null;
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

  getrtProofPayAttachFiles(event, whichfile) {
    this.sizeFiles6 = 0;
    this.rtProofPayAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput6.nativeElement.value = "";
        this.sizeFiles6 = 0;
        this.rtProofPayAttachFiles = null;
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

  getrtSalaryAttachFiles(event, whichfile) {
    this.sizeFiles7 = 0;
    this.rtSalaryAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput7.nativeElement.value = "";
        this.sizeFiles7 = 0;
        this.rtSalaryAttachFiles = null;
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

  getrtProofEmploymentAttachFiles(event, whichfile) {
    this.sizeFiles8 = 0;
    this.rtProofEmploymentAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput8.nativeElement.value = "";
        this.sizeFiles8 = 0;
        this.rtProofEmploymentAttachFiles = null;
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

  getrtInelligibleAttachFiles(event, whichfile) {
    this.sizeFiles9 = 0;
    this.rtInelligibleAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput9.nativeElement.value = "";
        this.sizeFiles9 = 0;
        this.rtInelligibleAttachFiles = null;
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

  getrtExceptionAttachFiles(event, whichfile) {
    this.sizeFiles10 = 0;
    this.rtExceptionAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput10.nativeElement.value = "";
        this.sizeFiles10 = 0;
        this.rtExceptionAttachFiles = null;
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

  getrtOtherDocsAttachFiles(event, whichfile) {
    this.sizeFiles11 = 0;
    this.rtOtherDocsAttachFiles = event.target.files;
    this.filescheckfunc(event, whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
        // reset the variables used for the attachments
        this.fileInput11.nativeElement.value = "";
        this.sizeFiles11 = 0;
        this.rtOtherDocsAttachFiles = null;
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

  makeAllFormControlsPristine(group: FormGroup): void {
    Object.keys(group.controls).forEach((key) => {
      group.controls[key].markAsPristine();
    })
  }

  //Confirmation for close
  confirmClose(form) {
    if (this.model.lock_status == '1') {
      this.close();
    } else if (form.dirty || this.filesArraycheck.length > 0) {
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
      // this.location.back();
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
    this.curdt = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";

    if (!this.model.txtCFMBGFAudit) {
      this.model.txtCFMBGFAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record ";
    } else {
      this.model.txtCFMBGFAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record " + "\n" + this.model.txtCFMBGFAudit;
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
      () => { this.save(actionTaken, form) }
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
    selBox.value = applurl + "cfmbgftransdoc/" + this.model._id;
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
      this.model.txtCFMBGFAudit = this.strAudit;
      this.model.dtcreated = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    } else {
      this.finlog = this.model.txtCFMBGFAudit;
      this.sign = this.userLoggedIn;
      this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
      this.model.txtCFMBGFAudit = "Modified by " + this.sign + " on " + this.curtimestamp + "\n" + this.finlog;
      this.model.dtmodified = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    }
  }

  updateAuditTrailAttachments() {
    //insert the attachment only if it is added in the record
    if ((this.rtCoverSheetAttachFiles && this.rtCoverSheetAttachFiles.length != 0) ||
      (this.rtVendorVerifAttachFiles && this.rtVendorVerifAttachFiles.length != 0) ||
      (this.rtMktgVendorInvoiceAttachFiles && this.rtMktgVendorInvoiceAttachFiles.length != 0) ||
      (this.rtMktgPlanAttachFiles && this.rtMktgPlanAttachFiles.length != 0) ||
      (this.rtAttendeeListAttachFiles && this.rtAttendeeListAttachFiles.length != 0) ||
      (this.rtProofPayAttachFiles && this.rtProofPayAttachFiles.length != 0) ||
      (this.rtSalaryAttachFiles && this.rtSalaryAttachFiles.length != 0) ||
      (this.rtProofEmploymentAttachFiles && this.rtProofEmploymentAttachFiles.length != 0) ||
      (this.rtInelligibleAttachFiles && this.rtInelligibleAttachFiles.length != 0) ||
      (this.rtExceptionAttachFiles && this.rtExceptionAttachFiles.length != 0) ||
      (this.rtOtherDocsAttachFiles && this.rtOtherDocsAttachFiles.length != 0)) {

      this.getAttachmentNames(this.rtCoverSheetAttachFiles, "rtCoverSheet");
      this.getAttachmentNames(this.rtVendorVerifAttachFiles, "rtVendorVerif");
      this.getAttachmentNames(this.rtMktgVendorInvoiceAttachFiles, "rtMktgVendorInvoice");
      this.getAttachmentNames(this.rtMktgPlanAttachFiles, "rtMktgPlan");
      this.getAttachmentNames(this.rtAttendeeListAttachFiles, "rtAttendeeList");
      this.getAttachmentNames(this.rtProofPayAttachFiles, "rtProofPay");
      this.getAttachmentNames(this.rtSalaryAttachFiles, "rtSalary");
      this.getAttachmentNames(this.rtProofEmploymentAttachFiles, "rtProofEmployment");
      this.getAttachmentNames(this.rtInelligibleAttachFiles, "rtInelligible");
      this.getAttachmentNames(this.rtExceptionAttachFiles, "rtException");
      this.getAttachmentNames(this.rtOtherDocsAttachFiles, "rtOtherDocs");

    }
  }

  getAttachmentNames(files: FileList, suffix: string) {
    if (files) {
      let fileNamesAttached = [];
      for (var i = 0; i < files.length; i++) {
        let file: File = files[i];
        fileNamesAttached.push(suffix + "_" + file.name)
      }
      this.sign = this.userLoggedIn;
      this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
      // update audit trail
      this.model.txtCFMBGFAudit = this.curtimestamp + ": " + this.sign + " : Uploaded files --> " + fileNamesAttached.join(", ") + "\n" + this.model.txtCFMBGFAudit;
    }
  }
}
