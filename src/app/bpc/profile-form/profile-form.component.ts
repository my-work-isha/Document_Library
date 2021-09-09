import { AfterViewInit, Component, OnInit, ViewEncapsulation,ViewChild  } from '@angular/core';
import { ProfileForm } from "./profile-form.model";
import { Http, Headers, URLSearchParams, RequestOptions} from '@angular/http';
import {MbpdataService } from "../service/mbpdata.service"
import { Location } from '@angular/common'
import { Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileFormComponent implements OnInit {

  Proffetch=[];
  profid:String;
  profrev:String;

  constructor(private location:Location,private http:Http,private titleService: Title,private mbpdataService:MbpdataService,private router:Router) { };
  model = new ProfileForm("","","fProfileRDL","","");
  submitAttempt:boolean;
  ngOnInit() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    console.log("hello2");
    let options = new RequestOptions({ headers: headers });

    this.http.get('/api/retrieveProfile',options).subscribe(data => {
      console.log("profiletech:"+this.Proffetch);
        
        this.Proffetch = JSON.parse(data["_body"])["data"];  
        console.log("profiletech:"+this.Proffetch[0]);
        this.model.principalName=this.Proffetch[0]['principalName'];
        this.model.appBaseURL=this.Proffetch[0]['appBaseURL'];      
             
       this.model._id=this.Proffetch[0]['_id'];
       this.model._rev=this.Proffetch[0]['_rev'];
       this.profid=this.model._id;
       this.profrev=this.model._rev;  
  
      });
  
      this.titleService.setTitle("RDL")
  }
 //save button start and validation 
 save()
 {
  this.submitAttempt = true;
  
  {
   console.log('form submitted');
   let headers = new Headers();
   headers.append('Content-Type', 'application/json');
   let params = new URLSearchParams();
   console.log(this.model._id);
   if(this.model._id ===""){
   delete this.model._id;
   delete this.model._rev;}

   console.log(this.model);

   params.append("json", JSON.stringify(this.model));
   let options = new RequestOptions({ headers: headers, params:params });
   this.http.get('/api/insertprofileform',options).subscribe(data => {
     console.log(data);
     this.location.back();
   });

 } 
 
}//save button end


close()
  {
    this.location.back();
  }

}



