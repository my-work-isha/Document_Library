import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';

@Injectable()
export class UserdetailsService {

  constructor(private http: Http) { }

  getUserdetails() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return this.http.get('/api/getuser', options);
  }
}
