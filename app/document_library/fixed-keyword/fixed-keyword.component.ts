import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { fixedkeyword } from './fixed-keyword.model';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { Title } from '@angular/platform-browser';
import { UserdetailsService } from '../service/userdetails.service';
import { format } from "date-fns";

@Component({
  selector: 'app-fixedkeyword',
  templateUrl: './fixed-keyword.component.html',
  styles: [`
  input.ng-invalid{border-left:5px solid red;}
  input.ng-valid{border-left:5px solid green;}
  textarea.ng-invalid {border-left:5px solid red;}
  textarea.ng-valid {border-left:5px solid green;}
  .required{
    color:red;
    font-size:12px;
}
  `]
})
export class FixedKeywordComponent implements OnInit, AfterViewInit {
  
  fixed = new fixedkeyword("", "", "fFXKeywordRDL", "", "", "", "", "", "", "", "","");
  submitAttempt: boolean;

  constructor(private http: Http, private titleService: Title, private userdetails: UserdetailsService) { }

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  curdt: String;
  sign: String;
  user: any;

  ngOnInit() {
    this.userdetails.getUserdetails().subscribe(
      data => {
        this.user=JSON.parse(data["_body"]);
        this.user= this.user._json;
        console.log("this.user",this.user); 
      }, 
      error => console.error(error), 
      () => {})
    this.dtOptions = {     
      "oLanguage":{"zeroRecords":"No Data available","sLoadingRecords":"Data is Loading...Please Wait..."},
      ajax: '/api/fixedkeywords',
      columns: [{
        title: 'Keyword',
        data: 'txFXKeyword',
        defaultContent: ""
      }, {
        title: 'Values for AM',
        data: 'txFXKeyList',
        defaultContent: "",
        class: "none"
      }, {
        title: 'Values for AP',
        data: 'txFXKeyListAP',
        defaultContent: "",
        class: "none"
      }, {
        title: 'Values for EMEA',
        data: 'txFXKeyListEMEA',
        defaultContent: "",
        class: "none"
      }, {
        title: 'Values for LA',
        data: 'txFXKeyListLA',
        defaultContent: "",
        class: "none"
      }, {
        title: 'Values for Japan',
        data: 'txFXKeyListJP',
        defaultContent: "",
        class: "none"
      }, {
        title:'Values for GCG',
        data:'txFXKeyListGCG',
        defaultContent: "",
        class: "none"
      },{
        title: 'Comments',
        data: 'txFXKeyComment',
        defaultContent: "",
        class: "none"
      }, {
        title: 'Audit Trail',
        data: 'txFXAudit',
        defaultContent: "",
        class: "none"
      }, {
        title: 'id',
        data: '_id',
        class: "none"
      }, {
        title: 'rev',
        data: '_rev',
        class: "none"
      }, {
        title: 'Form',
        data: "Form",
        class: "none"
      }],
      responsive: true,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        $('td', row).unbind('mousedown');
        $('td', row).bind('mousedown', () => {
          self.updateFixedKeywordForm(data);
        });
        return row;
      }
    };
    this.titleService.setTitle("RDL")
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  
  updateFixedKeywordForm(info: any): void {    
    this.fixed = info;
  }

  updateAuditTrail() {
    console.log("entered in to update audit trail function")
    this.curdt=format(new Date(),"MM/DD/YYYY h:mm A Z");
    if (this.fixed._id && this.fixed._id != "") {
      if(!this.fixed.txFXAudit){
       this.fixed.txFXAudit = this.curdt+":"+this.sign+" "+"Saved the Document"+" ";
      }else{
        this.fixed.txFXAudit = this.curdt+":"+this.sign+" "+"Saved the Document"+"\n "
        +this.fixed.txFXAudit;
      }
    }else{
      this.fixed.txFXAudit="\n"+this.curdt+ " : " + this.sign+ "  " +"Created the Document"+"\n";
      console.log("txFXAudit",this.fixed.txFXAudit);
    }
  
  }

  //save code
  save() {
    this.submitAttempt = true;
    if (this.fixedform.valid) {
      if (this.fixed._id === "") {
        delete this.fixed._id;
        delete this.fixed._rev;
      }

      this.trimKeywords()
      this.sign = (this.user.firstName).replace("%20"," ")+" "+(this.user.lastName).replace("%20"," ");
      this.updateAuditTrail();
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let params = new URLSearchParams();
      params.append("json", JSON.stringify(this.fixed));
      let options = new RequestOptions({ headers: headers, params: params });
      this.http.get('/api/insertfixedkeywords', options).subscribe(
        data => { }, 
        error => console.error(error), 
        () => { 
          this.reset()
          this.rerender();
        }
      );
    }
  }

  trimKeywords(){
      var keywordarr=[]
      if(this.fixed.txFXKeyList != ""){
      keywordarr=this.fixed.txFXKeyList.split(";").map(el=> el.trim())   
      this.fixed.txFXKeyList = keywordarr.join(";")
      }
      if(this.fixed.txFXKeyListAP != ""){
       keywordarr=this.fixed.txFXKeyListAP.split(";").map(el=> el.trim())   
       this.fixed.txFXKeyListAP = keywordarr.join(";") 
      }
      if(this.fixed.txFXKeyListEMEA != ""){
        keywordarr=this.fixed.txFXKeyListEMEA.split(";").map(el=> el.trim())   
        this.fixed.txFXKeyListEMEA = keywordarr.join(";") 
      }
      if(this.fixed.txFXKeyListLA != ""){
        keywordarr=this.fixed.txFXKeyListLA.split(";").map(el=> el.trim())   
        this.fixed.txFXKeyListLA = keywordarr.join(";") 
      }
      if(this.fixed.txFXKeyListJP != ""){
        keywordarr=this.fixed.txFXKeyListJP.split(";").map(el=> el.trim())   
        this.fixed.txFXKeyListJP = keywordarr.join(";") 
      }
  }

  //Delete code
  delete() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('/api/deleteFixedKeywords', this.fixed, options).subscribe(
      data => { }, 
      error => console.error (error), 
      () => {
        this.reset();
        this.rerender();
      }
    )
  }

  reset() {
    this.fixed = new fixedkeyword("", "", "fFXKeywordRDL", "", "", "", "", "", "", "", "","");
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();   // Destroy the table first
      this.dtTrigger.next();  // Call the dtTrigger to rerender again
    });
  }

  fixedform = new FormGroup({
    keyword: new FormControl('', [Validators.required, this.nospaceValidator]),
    valueAM: new FormControl(''),
    valueAP: new FormControl(''),
    valueEMEA: new FormControl(''),
    valueLA: new FormControl(''),
    valueJapan: new FormControl(''),
    valueGCG: new FormControl(''),
    comments: new FormControl(''),
    audit: new FormControl()
  });

  nospaceValidator(control: AbstractControl): { [s: string]: boolean } {
    let regex = / /;
    if (control.value && control.value.match(regex)) {
      return { nospace: true };
    }
  }
}




//fixed: Array<any>;




