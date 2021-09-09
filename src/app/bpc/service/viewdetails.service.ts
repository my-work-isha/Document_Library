import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';

@Injectable()
export class ViewdetailsService {

  constructor(private http: Http) { }

  getDocbyid(id: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers, params: id });
    return this.http.get('/api/getdocbyId',options);
  }
}
