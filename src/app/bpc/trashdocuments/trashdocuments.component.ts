import { AfterViewInit,Component, OnInit,ViewEncapsulation,ViewChild } from '@angular/core';
import { TrashDocuments} from "./trashdocuments.model";
import { Http, Headers, URLSearchParams, RequestOptions} from '@angular/http';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserdetailsService } from '../service/userdetails.service';
import { MbpdataService } from '../service/mbpdata.service';
import { format } from "date-fns"
import { ViewdetailsService } from '../service/viewdetails.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trashdocuments',
  templateUrl: './trashdocuments.component.html',
  styleUrls: ['./trashdocuments.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TrashdocumentsComponent implements OnInit  {

  model = new TrashDocuments("","","","","","","");
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


  constructor(private titleService: Title, private http: HttpClient, private route: ActivatedRoute, private spinnerService: NgxSpinnerService,private router: Router,
    private userdetails: UserdetailsService,private viewdetails: ViewdetailsService, private mbpdataService: MbpdataService, private https: Http) { };

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

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

      this.apiURL = '/api/trashDocuments';
        this.columnDefs = [
          { headerName: '', valueGetter: '', 'checkboxSelection': true, width:30 },
          { headerName: 'Log Number', field: 'txtLogNo' },
          { headerName: 'Form', valueGetter: getForm},
          { headerName: 'Current Primary Name', field: 'txtCPN' },
          { headerName: 'Lead Analyst', field: 'txtLAName' },
          { headerName: 'Deleted By', field: 'DeletedBy' },
          { headerName: 'Deleted On', field: 'DeletedOn' }          
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
  
  onQuickFilterChanged($event) {
    this.mbpdataService.setSearchStr($event.target.value);
    this.gridApi.setQuickFilter($event.target.value);
  }

  updateTrashDocumentsForm(info: any): void {
    console.log(info);
    this.model = info;   
  }
 
  reset() {
    this.model = new TrashDocuments("","","","","","","");
  }

  rerender(): void {
    this.dtElement.dtInstance.then(
      (dtInstance: DataTables.Api) => {
        dtInstance.destroy();   // Destroy the table first
        this.dtTrigger.next();  // Call the dtTrigger to rerender again
      }, 
      error => console.error(error)
    );
  }

  onMultipleRowsClicked(params) {
    var selectedRows = [];
    selectedRows = this.gridApi.getSelectedRows();
    var tempArray = [];
    var selectedLogNos = [];
    selectedRows.forEach(function (selectedRow, index) {
      tempArray.push(selectedRow._id);
      if (selectedRow.OldForm == "frmMain") {
        selectedLogNos.push(selectedRow.txtLogNo + "(Main Form)")
      } else if (selectedRow.OldForm == "frmAllegation") {
        selectedLogNos.push(selectedRow.txtLogNo + "(Allegation document)")
      } else if (selectedRow.OldForm == "frmCHW") {
        selectedLogNos.push(selectedRow.txtLogNo + "(CHW Transaction document)")
      } else if (selectedRow.OldForm == "frmITS") {
        selectedLogNos.push(selectedRow.txtLogNo + "(ITS/MTS/TSS Transaction document)")
      } else if (selectedRow.OldForm == "frmSW") {
        selectedLogNos.push(selectedRow.txtLogNo + "(SW Transaction document)")
      } else if (selectedRow.OldForm == "frmMiscDoc") {
        selectedLogNos.push(selectedRow.txtLogNo + "(Misc document)")
      } else if (selectedRow.OldForm == "TransDoc") {
        selectedLogNos.push(selectedRow.txtLogNo + "(CHW/SWG Transaction)")
      } else if (selectedRow.OldForm == "frmPrReview") {
        selectedLogNos.push(selectedRow.txtLogNo + "(Peer Review Results)")
      }else if (selectedRow.OldForm == "frmCFMBGF") {
        selectedLogNos.push(selectedRow.txtLogNo + "(CFM BGF Transaction)")
      }
    })
    if (tempArray.length == 0) {
      alert("please select atleast one record to restore");
      this.showBox = false;
    } else {
      this.showBox = true;
    }
    this.selectedRowArray = tempArray;
    this.strLogNos = selectedLogNos.join(", ")
  }

    restoreRecords() {
      this.spinnerService.show();    
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');   
      var recordIds = this.selectedRowArray.join(",");  
      this.sign = (this.user.firstName).replace(" ", " ") + " " + (this.user.lastName).replace(" ", " ");
      this.curdt = format(new Date(), "MM/DD/YYYY h:mm A Z") + "GMT";
      this.curdt_enc = encodeURIComponent(this.curdt); 
      let curdtest=format(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}), "MM/DD/YYYY");
      let curdtest_enc = encodeURIComponent(curdtest);
      var sendoptions = {
        recIds: recordIds,
        curdt: this.curdt_enc,   
        sign:this.sign,
        curdtest:curdtest_enc
      }
  
      let options = new RequestOptions({ headers: headers });
      this.https.post('/api/restoreMultiple', sendoptions, options).subscribe(
        data => {
  
        },
        error => {
          alert("Error while inserting the Review record!!! - " + error);
          this.spinnerService.hide();
        },
        () => {
          alert("selected records are restored Successfully.");
      //location.reload(true);
      this.ngOnInit();
        }
      )
    } 
}

function getForm(value) {
  let tempTransNum: string = "";
  let tempEndUser: string = "";
  if(value.data.OldForm == "frmMain"){
    return "Main"
  }
  
    if (value.data.OldForm == "frmAllegation") {
      if (value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txtTransactionNum;
      }
      if (value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txtEnduserTr;
      }
     return "Allegation" + tempTransNum + tempEndUser;
    } else if (value.data.OldForm == "frmCHW") {
      if (value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txTransactionNum;
      }
      if (value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txEnduserTr;
      }
      return "CHW Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.OldForm == "TransDoc") {
      if (value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txtTransactionNum;
      }
      if (value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txtEnduserTr;
      }
      return "Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.OldForm == "frmITS") {
      if (value.data.txtTransactionNum && value.data.txtTransactionNum != "" && value.data.txtTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txtTransactionNum;
      }
      if (value.data.txtEnduserTr && value.data.txtEnduserTr != "" && value.data.txtEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txtEnduserTr;
      }
     return "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.OldForm == "frmMiscDoc") {
      if (value.data.txtAttNameMisc && value.data.txtAttNameMisc != "" && value.data.txtAttNameMisc != "undefined") {
        tempTransNum = ": " + value.data.txtAttNameMisc;
      }
      return "Misc Doc" + tempTransNum;
    } else if (value.data.OldForm == "frmPrReview") {
      if (value.data.rtAttachPR && value.data.rtAttachPR != "" && value.data.rtAttachPR != "undefined") {
        tempTransNum = ": " + value.data.rtAttachPR;
      }
      return "Peer Review Results" + tempTransNum;
    } else if (value.data.OldForm == "frmSW") {
      if (value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txTransactionNum;
      }
      if (value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txEnduserTr;
      }
      return "SW Transaction" + tempTransNum + tempEndUser;
    } else if (value.data.OldForm == "frmCFMBGF") {
      if (value.data.txTransactionNum && value.data.txTransactionNum != "" && value.data.txTransactionNum != "undefined") {
        tempTransNum = ": " + value.data.txTransactionNum;
      }
      if (value.data.txEnduserTr && value.data.txEnduserTr != "" && value.data.txEnduserTr != "undefined") {
        tempEndUser = " - " + value.data.txEnduserTr;
      }
      return "CFM BGF Transaction" + tempTransNum + tempEndUser;
    }
    else {
      return value.data.OldForm
    }
  }
