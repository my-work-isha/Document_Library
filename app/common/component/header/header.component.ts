import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef} from '@angular/core';
import { UserdetailsService } from '../../../bpc/service/userdetails.service';
import { environment } from '../../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

declare let $: any;
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  user: any;
  username :string;

  constructor(private userdetails: UserdetailsService, private spinnerService : NgxSpinnerService) { }

  ngOnInit() {
    this.spinnerService.show()
    this.userdetails.getUserdetails().subscribe(data => {
      this.user=JSON.parse(data["_body"]);
      this.user= this.user._json;
      this.username=(this.user.firstName).replace("%20"," ") + " " + (this.user.lastName).replace("%20"," ");
    })
    this.appHeading();
  }
  
  appHeading(){
    if(environment.app_env.includes("dev")){
     document.getElementById('rdlhead').innerHTML = "RDL (DEV)";
    }else if(environment.app_env.includes("test")){
      document.getElementById('rdlhead').innerHTML = "RDL (TEST)";
    }
  }

  showMenu() {
    $("#wrapper").toggleClass('active');
  }
}
