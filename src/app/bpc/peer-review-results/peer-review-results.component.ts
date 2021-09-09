import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { PeerReviewResults } from './peer-review-results.model';
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
  selector: 'app-peer-review-results',
  templateUrl: './peer-review-results.component.html',
  styleUrls: ['./peer-review-results.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PeerReviewResultsComponent implements OnInit {

  constructor(private location: Location, private http: Http, private httpClient: HttpClient,
    private route: ActivatedRoute, private mbpdataService: MbpdataService,
    private router: Router, private userdetails: UserdetailsService,
    private keyworddetails: KeywordsService, private titleService: Title,
    private spinnerService: NgxSpinnerService, private viewdetails: ViewdetailsService) { };

  model = new PeerReviewResults("", "", "frmPrReview", [""], "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","","","","","","","");

  
  keywords = [];
  private id: string;
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
  allDates=[];
  allDateValues=[];
  dateArraycheck=[];
  isLoading: boolean = true;    //peer-review-result is read-only before fields are retrieved completely

  //attachment code variables
  rtAttachPRFiles: FileList;
  attachmentList: any;
  dbRevID: any;
  hasAttachments: boolean = false;
  canDeleteFiles: string = "No";
  curtimestamp: string;
  filesArraycheck=[];
  parentdoc = [];
  curdt: string;
  isAdmin: boolean;

  @ViewChild('fileInput1') fileInput1: any;
  sizeFiles1: number = 0;

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
                          () => {this.router.navigate(['/peerreviewresults/select'])
                          this.allDateValues=[this.model.dtPRPerformed];
                          this.allDates=['dtPRPerformed'];
                        }
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
                this.model.$REF = mbpModel.docid;
                this.model.txtLogNo = mbpModel.txtLogNo;
                this.model.txtChannel = mbpModel.txtChannel;
                this.model.txtLAName = mbpModel.txtLAName;
                this.model.txBP = mbpModel.txtCPN;
                this.model.txtAssistAnalyst = mbpModel.txtAssistAnalyst;
                this.model.dlgLogApprovers = mbpModel.dlgLogApprovers;
                this.model.lock_status = mbpModel.lock_status;
                this.model.dtACRBDate = mbpModel.dtACRBDate;
                this.model.txtCPN = mbpModel.txtCPN;
                this.model.Form = "frmPrReview";
                this.model.txtStatus = "";
                this.model.signature = "";
                this.model.sigtimestamp = "";
                this.model.rtAttachPR = "";
                this.model.txCountry = mbpModel.txCountry;
                this.model.txGrowthMarket = mbpModel.txGrowthMarket;
                this.model.txMajorMarket = mbpModel.txMajorMarket;
                this.model.txGeo = mbpModel.txGeo
              }
            }

            console.log("this.model.txtAssistAnalyst"+this.model.txtAssistAnalyst);
            var txtAssistAnalystArr = [];
            if (Array.isArray(this.model.txtAssistAnalyst)) {
              txtAssistAnalystArr = this.model.txtAssistAnalyst;
            }
            else {
              txtAssistAnalystArr = _.toString(this.model.txtAssistAnalyst).split(",")
              console.log("txtAssistAnalystArr value"+txtAssistAnalystArr);
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

            this.isLoading = false;   //peer-review-result becomes editable after the fields are retrieved completely
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

            let attch_params = new URLSearchParams();
            let headers = new Headers();
            attch_params.append("id", this.model._id);
            attch_params.append("form", "frmPrReview");
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
                  $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmPrReview/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmPrReview\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
                })

                this.isLoading = false;   //peer-review-result becomes editable after the fields are retrieved completely
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
  save(actionTaken:string,form) {
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

          //To save data fields
          this.model.dtPRPerformed = (String)($("#dtPRPerformed").val());
          let headers = new Headers();
          headers.append('Content-Type', 'application/json');
          //params.append("json", JSON.stringify(this.model));
          let options = new RequestOptions({ headers: headers});
          this.http.post('/api/insertpeerreviewresults',this.model, options).subscribe(
            data => {
              this.revSaved = JSON.parse(data["_body"]).rev;
              this.idSaved = JSON.parse(data["_body"]).id;
              this.model._id = (String)(this.idSaved);
              this.model._rev = (String)(this.revSaved);

              if (this.rtAttachPRFiles && this.rtAttachPRFiles.length != 0) {
                let res: any = JSON.parse(data["_body"]);
                let formData: FormData = new FormData();
                this.hasAttachments = true;
                this.filesToFormData(this.rtAttachPRFiles, "rtAttachPR", formData);
                this.uploadFiles('api/attachReview', formData, res.id, res.rev, actionTaken);
              } else {
                this.hasAttachments = false;
              }
            }, error => console.error(error),
            () => {
              
              this.makeAllFormControlsPristine(form);
              this.filesArraycheck=[]; 
              this.dateArraycheck=[];
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

  uploadFiles(url: string, formData: FormData, id: string, rev: string, actionTaken:any) {
    formData.append("id", id);
    formData.append("rev", rev);
    formData.append("form", "frmPrReview");
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

        $("#rtAttachPRFile").empty();   //reset all file inputs to empty
        this.fileInput1.nativeElement.value = "";   //reset all file inputs to empty
        this.sizeFiles1 = 0;    //reset size values to zero
        this.rtAttachPRFiles = null;  // reset the Filelist to null after successfully uploading the attahcments

        // get attachment list
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let attch_params = new URLSearchParams();
        attch_params.append("id", this.model._id);
        attch_params.append("form", "frmPrReview");
        let attach_options = new RequestOptions({ params: attch_params, headers: headers });
        let deleteFiles: string = this.canDeleteFiles
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
              $("#" + fieldId + "File").append("<div><a id='att_" + fileId + "' class='file' href='/api/getFileFromDB2/frmPrReview/" + fileID + "/" + fileName.replace("%", "%25") + "'>" + fileName + "</a><a id='del_" + fileId + "'class='delete' onclick='deleteFile(\"frmPrReview\",\"" + fileID + "\",\"" + fileName.replace("%", "%25") + "\",\"" + deleteFiles + "\")'> x</a></div>");
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
    if (this.sizeFiles1 > 0) {
      this.fileInput1.nativeElement.value = "";   //reset file input fileds to empty value
      this.sizeFiles1 = 0;    //reset size values to zero
      this.rtAttachPRFiles = null;  // reset the Filelist to null after successfully uploading the attahcments
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

  getrtAttachPRFiles(event,whichfile) {
    this.sizeFiles1 = 0;
    this.rtAttachPRFiles = event.target.files;
    this.filescheckfunc(event,whichfile);
    for (let i: number = 0; i < event.target.files.length; i++) {
      if (this.invalidAttachmentName(event.target.files[i].name)) {
        alert("The file name should not contain Apostrophe(') and Hash(#).");
     // reset the variables used for the attachments
       this.fileInput1.nativeElement.value = "";
       this.sizeFiles1 = 0;
       this.rtAttachPRFiles = null;
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
  
makeAllFormControlsPristine(group:FormGroup):void{
  Object.keys(group.controls).forEach((key)=>{
     group.controls[key].markAsPristine();
});
}

  //Confirmation for close
  confirmClose(form) {
    if(form.dirty || this.filesArraycheck.length>0 || this.dateArraycheck.length>0){
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

    if(!this.model.txtSWAudit){
      this.model.txtSWAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record ";
     }else{
      this.model.txtSWAudit = "\n" + this.curdt + " :" + this.model.DeletedBy + ", Deleted the record " + "\n" + this.model.txtSWAudit;
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
    selBox.value = applurl + "peerreviewdoc/" + this.model._id;
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
      this.model.txtSWAudit = this.strAudit;
      this.model.dtcreated = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    } else {
      this.finlog = this.model.txtSWAudit;
      this.sign = this.userLoggedIn;
      this.curtimestamp = format(new Date(), "MM/DD/YYYY h:mm A Z") + " GMT";
      this.model.txtSWAudit = "Modified by " + this.sign + " on " + this.curtimestamp + "\n" + this.finlog;
      this.model.dtmodified = format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
    }
  }

  updateAuditTrailAttachments(){
    //insert the attachment only if it is added in the record
    if (this.rtAttachPRFiles && this.rtAttachPRFiles.length != 0) {
      this.getAttachmentNames(this.rtAttachPRFiles, "rtAttachPR");
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
    this.model.txtSWAudit =  this.curtimestamp + ": " + this.sign + " : Uploaded files --> " + fileNamesAttached.join(", ") + "\n" + this.model.txtSWAudit;
 }     
}   

isDateClicked(passedVal: string, modelval: string) {

  let initialDateValue;

  var index = this.allDates.findIndex(function (item, i) { return item === modelval });
  initialDateValue = this.allDateValues[index];

  let value: any = (String)($(passedVal).val());

  if (initialDateValue == value) {
    //this.dateChanged=false;
    if (_.includes(this.dateArraycheck, modelval)) {
      this.dateArraycheck = this.dateArraycheck.filter((node) => {
        return node != modelval
      })
    }
  } else {
    //this.dateChanged=true;
    this.dateArraycheck.push(modelval);
  }
  this.dateChange();
}

dateChange() {
  this.model.dtPRPerformed = String($("#dtPRPerformed").val());
}
}





